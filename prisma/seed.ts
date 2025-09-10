// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.log('Please set DATABASE_URL in your environment variables')
    process.exit(1)
  }

  console.log('🌱 Starting database seed...')
  console.log('📍 Environment:', process.env.NODE_ENV || 'development')

  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection established')

    // Create categories
    console.log('📂 Creating categories...')
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Logam' },
        update: {},
        create: {
          name: 'Logam',
          description: 'Barang-barang dari logam'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Plastik' },
        update: {},
        create: {
          name: 'Plastik',
          description: 'Barang-barang dari plastik'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Kertas' },
        update: {},
        create: {
          name: 'Kertas',
          description: 'Barang-barang dari kertas'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Elektronik' },
        update: {},
        create: {
          name: 'Elektronik',
          description: 'Barang-barang elektronik'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Lainnya' },
        update: {},
        create: {
          name: 'Lainnya',
          description: 'Barang-barang lainnya'
        }
      })
    ])

    console.log('✅ Categories created:', categories.length)

    const logamCategory = categories.find((c: any) => c.name === 'Logam')!
    const plastikCategory = categories.find((c: any) => c.name === 'Plastik')!
    const kertasCategory = categories.find((c: any) => c.name === 'Kertas')!
    const elektronikCategory = categories.find((c: any) => c.name === 'Elektronik')!
    const lainnyaCategory = categories.find((c: any) => c.name === 'Lainnya')!

    // Create waste items based on your data
    console.log('♻️ Creating waste items...')
    const wasteItems = [
      // Logam
      { name: 'Seng bekas', price: 600, unit: 'Kg', categoryId: logamCategory.id },
      { name: 'Kaleng susu', price: 1000, unit: 'Kg', categoryId: logamCategory.id },
      { name: 'Aluminium', price: 12000, unit: 'Kg', categoryId: logamCategory.id },
      { name: 'Aki / batrai', price: 6000, unit: 'Kg', categoryId: logamCategory.id },
      { name: 'Kara - kara', price: 800, unit: 'Kg', categoryId: logamCategory.id },

      // Plastik
      { name: 'Botol plastik kecil atau besar', price: 2600, unit: 'Kg', categoryId: plastikCategory.id },
      { name: 'Ember / baskom plastik', price: 800, unit: 'Kg', categoryId: plastikCategory.id },
      { name: 'Piring plastik', price: 10000, unit: 'Kg', categoryId: plastikCategory.id },
      { name: 'Gelas air plastik', price: 800, unit: 'Kg', categoryId: plastikCategory.id },
      { name: 'Duplex', price: 700, unit: 'Kg', categoryId: plastikCategory.id },
      { name: 'Aqua gelas', price: 300, unit: 'Kg', categoryId: plastikCategory.id },
      { name: 'Kemasan Ale-ale, teh rio, dll', price: 500, unit: 'Kg', categoryId: plastikCategory.id },

      // Kertas
      { name: 'Buku', price: 600, unit: 'Kg', categoryId: kertasCategory.id },
      { name: 'Karton', price: 1000, unit: 'Kg', categoryId: kertasCategory.id },
      { name: 'Sarang telor', price: 50, unit: 'ppm', categoryId: kertasCategory.id },
      { name: 'Sampul', price: 700, unit: 'Kg', categoryId: kertasCategory.id },

      // Elektronik
      { name: 'Drum elektronik', price: 1000, unit: 'Kg', categoryId: elektronikCategory.id },
      { name: 'TV Tabung atau TV LCD', price: 800, unit: 'Kg', categoryId: elektronikCategory.id },
      { name: 'Magiccom', price: 800, unit: 'Kg', categoryId: elektronikCategory.id },

      // Lainnya (Items that don't clearly fit other categories)
      { name: 'Besi kropos', price: 2600, unit: 'Kg', categoryId: lainnyaCategory.id },
      { name: 'Kaleng minuman (sprite, fanta, dll)', price: 11000, unit: 'Kg', categoryId: lainnyaCategory.id },
      { name: 'Kap kreta, kap mobil dan sejenisnya', price: 800, unit: 'Kg', categoryId: lainnyaCategory.id },
      { name: 'Botol oli, Botol sampo, dll', price: 800, unit: 'Kg', categoryId: lainnyaCategory.id },
      { name: 'Botol kaca atau beling', price: 50, unit: 'Kg', categoryId: lainnyaCategory.id },
      { name: 'Galon air', price: 700, unit: 'Kg', categoryId: lainnyaCategory.id },
      { name: 'Aqua botol', price: 800, unit: 'Kg', categoryId: lainnyaCategory.id },
      { name: 'Sepam HP', price: 1200, unit: 'Kg', categoryId: lainnyaCategory.id }
    ]

    // Process waste items with error handling
    let createdItems = 0
    for (const item of wasteItems) {
      try {
        await prisma.wasteItem.upsert({
          where: { name: item.name },
          update: {
            price: item.price,
            unit: item.unit,
            categoryId: item.categoryId
          },
          create: item
        })
        createdItems++
      } catch (error) {
        console.error(`❌ Error creating waste item "${item.name}":`, error)
      }
    }

    console.log('✅ Waste items processed:', createdItems, 'out of', wasteItems.length)

    // Create users
    console.log('👤 Creating users...')
    const adminPassword = await bcrypt.hash('admin123', 12)
    const userPassword = await bcrypt.hash('password123', 12)

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@banksampah.com' },
      update: {},
      create: {
        email: 'admin@banksampah.com',
        password: adminPassword,
        name: 'Admin Bank Sampah',
        role: 'ADMIN',
        phone: '081234567890',
        address: 'Kantor Bank Sampah',
        balance: 0
      }
    })

    const regularUser = await prisma.user.upsert({
      where: { email: 'user@gmail.com' },
      update: {},
      create: {
        email: 'user@gmail.com',
        password: userPassword,
        name: 'User Demo',
        role: 'USER',
        phone: '081234567891',
        address: 'Jl. Contoh No. 123, Jakarta',
        balance: 0
      }
    })

    console.log('✅ Users created:')
    console.log('- Admin:', adminUser.email, '(Role:', adminUser.role + ')')
    console.log('- User:', regularUser.email, '(Role:', regularUser.role + ')')

    console.log('\n🎉 === DATABASE SEEDED SUCCESSFULLY ===')
    console.log('📊 Summary:')
    console.log(`  - Categories: ${categories.length}`)
    console.log(`  - Waste Items: ${createdItems}`)
    console.log(`  - Users: 2`)
    
    console.log('\n🔐 === LOGIN CREDENTIALS ===')
    console.log('👨‍💼 Admin Account:')
    console.log('  📧 Email: admin@banksampah.com')
    console.log('  🔑 Password: admin123')
    console.log('\n👤 User Account:')
    console.log('  📧 Email: user@gmail.com')
    console.log('  🔑 Password: password123')
    
    console.log('\n🚀 Ready to go! You can now sign in to your application.')

  } catch (error: any) {
    console.error('❌ Error during seeding:')
    console.error('Message:', error.message)
    console.error('Code:', error.code)
    
    if (error.code === 'P1001') {
      console.error('💡 Solution: Check your DATABASE_URL connection string')
    } else if (error.code === 'P1012') {
      console.error('💡 Solution: Ensure DATABASE_URL starts with postgresql:// or postgres://')
    }
    
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed process failed:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    console.log('🔌 Disconnecting from database...')
    await prisma.$disconnect()
    console.log('✅ Database connection closed.')
  })
