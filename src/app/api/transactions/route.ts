import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Safe access to user role with fallback
    const userRole = session.user?.role || 'USER'
    const userId = session.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      )
    }

    const whereClause = userRole === "ADMIN" 
      ? {} 
      : { userId: userId }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            wasteItem: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error in GET /api/transactions:', error)
    
    // Handle Prisma connection issues
    if (error instanceof Error) {
      if (error.message.includes('connection') || error.message.includes('database')) {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const { items } = body

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required and cannot be empty" },
        { status: 400 }
      )
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.wasteItemId || !item.weight || !item.price) {
        return NextResponse.json(
          { error: `Invalid item at index ${i}: wasteItemId, weight, and price are required` },
          { status: 400 }
        )
      }
      
      if (typeof item.weight !== 'number' || item.weight <= 0) {
        return NextResponse.json(
          { error: `Invalid weight at index ${i}: must be a positive number` },
          { status: 400 }
        )
      }
      
      if (typeof item.price !== 'number' || item.price < 0) {
        return NextResponse.json(
          { error: `Invalid price at index ${i}: must be a non-negative number` },
          { status: 400 }
        )
      }
    }

    // Verify all waste items exist and are active
    const wasteItemIds = items.map((item: any) => item.wasteItemId)
    const wasteItems = await prisma.wasteItem.findMany({
      where: {
        id: { in: wasteItemIds },
        isActive: true
      }
    })

    if (wasteItems.length !== wasteItemIds.length) {
      const foundIds = wasteItems.map((item: any) => item.id)
      const missingIds = wasteItemIds.filter((id: string) => !foundIds.includes(id))
      return NextResponse.json(
        { error: `Waste items not found or inactive: ${missingIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Create waste item lookup map for validation
    const wasteItemMap = new Map(wasteItems.map((item: any) => [item.id, item]))

    let totalAmount = 0
    let totalWeight = 0

    const transactionItems = items.map((item: any) => {
      const wasteItem = wasteItemMap.get(item.wasteItemId) as any
      
      // Validate price matches current waste item price
      if (Math.abs(wasteItem!.price - item.price) > 0.01) {
        throw new Error(`Price mismatch for ${wasteItem!.name}: expected ${wasteItem!.price}, got ${item.price}`)
      }
      
      const subtotal = item.weight * item.price
      totalAmount += subtotal
      totalWeight += item.weight
      
      return {
        wasteItemId: item.wasteItemId,
        weight: item.weight,
        price: item.price,
        subtotal
      }
    })

    // Create transaction with all items in a single transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: userId,
        totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
        totalWeight: Math.round(totalWeight * 100) / 100,
        status: 'PENDING',
        items: {
          create: transactionItems
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            wasteItem: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Transaction created successfully",
      data: transaction
    })

  } catch (error) {
    console.error('Error in POST /api/transactions:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('connection') || error.message.includes('database')) {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        )
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: "Invalid waste item reference" },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Price mismatch')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create transaction",
      },
      { status: 500 }
    )
  }
}
