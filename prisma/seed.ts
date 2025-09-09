import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create categories
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

  console.log('Categories created:', categories.length)

  const logamCategory = categories.find((c: any) => c.name === 'Logam')!
  const plastikCategory = categories.find((c: any) => c.name === 'Plastik')!
  const kertasCategory = categories.find((c: any) => c.name === 'Kertas')!
  const elektronikCategory = categories.find((c: any) => c.name === 'Elektronik')!
  const lainnyaCategory = categories.find((c: any) => c.name === 'Lainnya')!

  // Create waste items based on your data
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

  for (const item of wasteItems) {
    await prisma.wasteItem.upsert({
      where: { name: item.name },
      update: {},
      create: item
    })
  }

  console.log('Waste items created:', wasteItems.length)

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
      phone: '081234567890'
    }
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {},
    create: {
      email: 'user@gmail.com',
      password: userPassword,
      name: 'User',
      role: 'USER',
      phone: '081234567891',
      address: 'Jl. Contoh No. 123, Jakarta'
    }
  })

  console.log('Users created:')
  console.log('- Admin:', adminUser.email, '(Role:', adminUser.role + ')')
  console.log('- User 1:', regularUser.email, '(Role:', regularUser.role + ')')

  console.log('\n=== LOGIN CREDENTIALS ===')
  console.log('Admin Account:')
  console.log('  Email: admin@banksampah.com')
  console.log('  Password: admin123')
  console.log('\nUser Accounts:')
  console.log('  Email: user@example.com | Password: password123')

  console.log('\nDatabase seeded successfully! 🌱')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })