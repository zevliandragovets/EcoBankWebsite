import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    } else {
      // Default to active items only
      where.isActive = true
    }

    const wasteItems = await prisma.wasteItem.findMany({
      where,
      include: {
        category: true
      },
      orderBy: [
        {
          category: {
            name: 'asc'
          }
        },
        {
          name: 'asc'
        }
      ]
    })

    return NextResponse.json({
      success: true,
      data: wasteItems,
      count: wasteItems.length
    })
  } catch (error: any) {
    console.error('Error fetching waste items:', error)
    return NextResponse.json(
      { 
        success: false,
        error: "Gagal mengambil data barang sampah" 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { 
          success: false,
          error: "Akses ditolak. Hanya admin yang dapat menambah barang sampah." 
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, price, unit, categoryId, isActive = true } = body

    // Validation
    if (!name || !price || !unit || !categoryId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Semua field wajib diisi: nama, harga, satuan, dan kategori" 
        },
        { status: 400 }
      )
    }

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

    // Check if waste item with same name already exists (using findFirst instead of findUnique)
    const existingItem = await prisma.wasteItem.findFirst({
      where: { 
        name: name.trim(),
        categoryId // Check within same category
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { 
          success: false,
          error: "Barang sampah dengan nama tersebut sudah ada dalam kategori ini" 
        },
        { status: 400 }
      )
    }

    // Validate price
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

    const wasteItem = await prisma.wasteItem.create({
      data: {
        name: name.trim(),
        price: parsedPrice,
        unit: unit.trim(),
        categoryId,
        isActive
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Barang sampah berhasil ditambahkan",
      data: wasteItem
    })
  } catch (error: any) {
    console.error('Error creating waste item:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: "Gagal menambahkan barang sampah" 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { 
          success: false,
          error: "Akses ditolak. Hanya admin yang dapat mengubah barang sampah." 
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, name, price, unit, categoryId, isActive } = body

    // Validation
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: "ID barang sampah diperlukan" 
        },
        { status: 400 }
      )
    }

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
      
      // Check for duplicate name in same category (excluding current item)
      const duplicateItem = await prisma.wasteItem.findFirst({
        where: { 
          name: name.trim(),
          categoryId: categoryId || existingItem.categoryId,
          id: { not: id }
        }
      })

      if (duplicateItem) {
        return NextResponse.json(
          { 
            success: false,
            error: "Barang sampah dengan nama tersebut sudah ada dalam kategori ini" 
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
    
    return NextResponse.json(
      { 
        success: false,
        error: "Gagal memperbarui barang sampah" 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { 
          success: false,
          error: "Akses ditolak. Hanya admin yang dapat menghapus barang sampah." 
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: "ID barang sampah diperlukan" 
        },
        { status: 400 }
      )
    }

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
  } catch (error: any) {
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