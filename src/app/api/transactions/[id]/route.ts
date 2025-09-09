import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userRole = session.user?.role || 'USER'
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Hanya admin yang dapat mengubah status transaksi." },
        { status: 403 }
      )
    }

    const { id } = await params
    
    // Validate transaction ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required and must be a valid string" },
        { status: 400 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const { status, notes } = body

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Status tidak valid. Status harus salah satu dari: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if transaction exists - Add error handling for database connection
    let existingTransaction
    try {
      existingTransaction = await prisma.transaction.findUnique({
        where: { id },
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
    } catch (dbError) {
      console.error('Database error when finding transaction:', dbError)
      return NextResponse.json(
        { success: false, error: "Database connection failed while checking transaction" },
        { status: 503 }
      )
    }

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: "Transaksi tidak ditemukan" },
        { status: 404 }
      )
    }

    // Business logic validation
    const currentStatus = existingTransaction.status
    
    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      'PENDING': ['APPROVED', 'REJECTED'],
      'APPROVED': ['COMPLETED', 'REJECTED'],
      'REJECTED': [], // Cannot change from rejected
      'COMPLETED': [] // Cannot change from completed
    }

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Tidak dapat mengubah status dari ${currentStatus} ke ${status}. Transisi yang valid: ${validTransitions[currentStatus]?.join(', ') || 'tidak ada'}` 
        },
        { status: 400 }
      )
    }

    // Update transaction with proper error handling
    let updatedTransaction
    try {
      updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date()
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
    } catch (updateError: any) {
      console.error('Database error when updating transaction:', updateError)
      
      // Handle specific Prisma errors
      if (updateError.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: "Constraint violation during update" },
          { status: 409 }
        )
      } else if (updateError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: "Transaction not found during update" },
          { status: 404 }
        )
      } else {
        return NextResponse.json(
          { success: false, error: "Database error during transaction update" },
          { status: 500 }
        )
      }
    }

    // Log the status change
    console.log(`Transaction ${id} status changed from ${currentStatus} to ${status} by admin ${session.user?.name || 'Unknown'}`)

    return NextResponse.json({
      success: true,
      message: `Status transaksi berhasil diubah ke ${status}`,
      data: updatedTransaction
    })

  } catch (error) {
    console.error('Unexpected error updating transaction status:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('connection') || error.message.includes('database')) {
        return NextResponse.json(
          { success: false, error: "Database connection failed" },
          { status: 503 }
        )
      } else if (error.message.includes('timeout')) {
        return NextResponse.json(
          { success: false, error: "Request timeout" },
          { status: 408 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: "Gagal mengubah status transaksi" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    
    // Validate transaction ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      )
    }

    const userRole = session.user?.role || 'USER'
    const userId = session.user?.id

    // Build where clause based on user role
    const whereClause = userRole === "ADMIN" 
      ? { id } 
      : { id, userId }

    let transaction
    try {
      transaction = await prisma.transaction.findFirst({
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
        }
      })
    } catch (dbError) {
      console.error('Database error when fetching transaction:', dbError)
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 503 }
      )
    }

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaksi tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: transaction
    })

  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data transaksi" },
      { status: 500 }
    )
  }
}
