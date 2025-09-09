// app/api/waste-items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const wasteItem = await prisma.wasteItem.findUnique({
      where: { id },
      include: {
        category: true,
        transactionItems: {
          include: {
            transaction: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!wasteItem) {
      return NextResponse.json(
        { 
          success: false,
          error: "Barang sampah tidak ditemukan" 
        },
        { status: 404 }
      )
    }

    // Calculate statistics
    const totalWeight = wasteItem.transactionItems.reduce((sum: number, item: any) => sum + item.weight, 0)
    const totalTransactions = wasteItem.transactionItems.length
    const totalRevenue = wasteItem.transactionItems.reduce((sum: number, item: any) => sum + item.subtotal, 0)

    return NextResponse.json({
      success: true,
      data: {
        ...wasteItem,
        statistics: {
          totalWeight,
          totalTransactions,
          totalRevenue,
          averageWeight: totalTransactions > 0 ? totalWeight / totalTransactions : 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching waste item:', error)
    return NextResponse.json(
      { 
        success: false,
        error: "Gagal mengambil data barang sampah" 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { 
          success: false,
          error: "Akses ditolak. Hanya admin yang dapat mengubah barang sampah." 
        },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, price, unit, categoryId, isActive } = body

    // Check if waste item exists
    const existingItem = await prisma.wasteItem.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { 
          success: false,
          error: "Barang sampah tidak ditemukan" 
        },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {}
    
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { 
            success: false,
            error: "Nama barang sampah tidak boleh kosong" 
          },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }
    
    if (price !== undefined) {
      const parsedPrice = parseFloat(price)
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { 
            success: false,
            error: "Harga harus berupa angka dan tidak boleh negatif" 
          },
          { status: 400 }
        )
      }
      updateData.price = parsedPrice
    }
    
    if (unit !== undefined) {
      if (!unit.trim()) {
        return NextResponse.json(
          { 
            success: false,
            error: "Satuan tidak boleh kosong" 
          },
          { status: 400 }
        )
      }
      updateData.unit = unit.trim()
    }
    
    if (categoryId !== undefined) {
      // Check if category exists
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!categoryExists) {
        return NextResponse.json(
          { 
            success: false,
            error: "Kategori tidak ditemukan" 
          },
          { status: 400 }
        )
      }
      updateData.categoryId = categoryId
    }
    
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive)
    }

    const updatedItem = await prisma.wasteItem.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Barang sampah berhasil diperbarui",
      data: updatedItem
    })
  } catch (error: any) {
    console.error('Error updating waste item:', error)
    
    // Handle unique constraint error
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false,
          error: "Barang sampah dengan nama tersebut sudah ada" 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: "Gagal memperbarui barang sampah" 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { 
          success: false,
          error: "Akses ditolak. Hanya admin yang dapat menghapus barang sampah." 
        },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if waste item exists
    const existingItem = await prisma.wasteItem.findUnique({
      where: { id },
      include: {
        transactionItems: true
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { 
          success: false,
          error: "Barang sampah tidak ditemukan" 
        },
        { status: 404 }
      )
    }

    // Check if waste item is used in transactions
    if (existingItem.transactionItems.length > 0) {
      // Soft delete - set isActive to false instead of hard delete
      await prisma.wasteItem.update({
        where: { id },
        data: { isActive: false }
      })

      return NextResponse.json({
        success: true,
        message: "Barang sampah telah dinonaktifkan karena sudah digunakan dalam transaksi"
      })
    }

    // Hard delete if not used in any transactions
    await prisma.wasteItem.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Barang sampah berhasil dihapus"
    })
  } catch (error) {
    console.error('Error deleting waste item:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: "Gagal menghapus barang sampah" 
      },
      { status: 500 }
    )
  }
}
