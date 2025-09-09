import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, address, role } = body

    // Validation
    if (!name || !email || !password || !phone || !address) {
      return NextResponse.json(
        { message: "Semua field harus diisi" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter" },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 }
      )
    }

    // Validate role
    if (role && !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { message: "Role tidak valid" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone.trim(),
        address: address.trim(),
        role: role || "USER",
        balance: 0
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      { 
        message: "Akun berhasil dibuat",
        user 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("Sign up error:", error)
    
    // Handle Prisma unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Terjadi kesalahan sistem. Silakan coba lagi." },
      { status: 500 }
    )
  }
}
