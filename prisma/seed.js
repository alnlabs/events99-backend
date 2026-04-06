// prisma/seed.js
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminPass = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@events99.com' },
    update: {},
    create: { email: 'admin@events99.com', password: adminPass, name: 'Admin User', phone: '0000000000', role: 'ADMIN' }
  })

  // Staff user
  const staffPass = await bcrypt.hash('staff123', 10)
  await prisma.user.upsert({
    where: { email: 'staff@events99.com' },
    update: {},
    create: { email: 'staff@events99.com', password: staffPass, name: 'Staff Member', phone: '1111111111', role: 'STAFF' }
  })

  // Customer
  const custPass = await bcrypt.hash('customer123', 10)
  await prisma.user.upsert({
    where: { email: 'customer@events99.com' },
    update: {},
    create: { email: 'customer@events99.com', password: custPass, name: 'John Doe', phone: '9999999999', role: 'CUSTOMER' }
  })

  // Halls
  const halls = await Promise.all([
    prisma.hall.upsert({
      where: { id: 'hall-grand-ballroom' },
      update: {},
      create: {
        id: 'hall-grand-ballroom',
        name: 'Grand Ballroom',
        description: 'Our flagship hall, perfect for weddings and large corporate events.',
        capacityMin: 100, capacityMax: 500,
        pricePerHour: 250, pricePerDay: 1800,
        amenities: ['AC', 'Stage', 'AV System', 'Dance Floor', 'Parking', 'Bridal Suite', 'Catering Kitchen'],
        images: [],
      }
    }),
    prisma.hall.upsert({
      where: { id: 'hall-crystal-room' },
      update: {},
      create: {
        id: 'hall-crystal-room',
        name: 'Crystal Room',
        description: 'Elegant mid-size venue ideal for birthday parties and receptions.',
        capacityMin: 50, capacityMax: 200,
        pricePerHour: 150, pricePerDay: 1000,
        amenities: ['AC', 'AV System', 'Parking', 'Bar Area'],
        images: [],
      }
    }),
    prisma.hall.upsert({
      where: { id: 'hall-garden-terrace' },
      update: {},
      create: {
        id: 'hall-garden-terrace',
        name: 'Garden Terrace',
        description: 'Open-air venue surrounded by lush greenery. Great for outdoor events.',
        capacityMin: 30, capacityMax: 150,
        pricePerHour: 100, pricePerDay: 700,
        amenities: ['Garden', 'Outdoor Lighting', 'Parking', 'Tent Options'],
        images: [],
      }
    }),
  ])

  // Catering packages
  await Promise.all([
    prisma.cateringPackage.upsert({
      where: { id: 'cat-basic' },
      update: {},
      create: {
        id: 'cat-basic', name: 'Basic Package', pricePerHead: 15, minGuests: 20,
        description: 'Simple yet satisfying buffet spread.',
        menuItems: [
          { name: 'Fried Rice', category: 'Main', isVeg: true },
          { name: 'Grilled Chicken', category: 'Main', isVeg: false },
          { name: 'Garden Salad', category: 'Sides', isVeg: true },
          { name: 'Soft Drinks', category: 'Beverages', isVeg: true },
          { name: 'Fruit Platter', category: 'Dessert', isVeg: true },
        ]
      }
    }),
    prisma.cateringPackage.upsert({
      where: { id: 'cat-standard' },
      update: {},
      create: {
        id: 'cat-standard', name: 'Standard Package', pricePerHead: 28, minGuests: 30,
        description: 'Full buffet with multiple main courses and desserts.',
        menuItems: [
          { name: 'Nasi Lemak', category: 'Main', isVeg: false },
          { name: 'Biryani Rice', category: 'Main', isVeg: false },
          { name: 'Butter Chicken', category: 'Main', isVeg: false },
          { name: 'Vegetable Curry', category: 'Main', isVeg: true },
          { name: 'Coleslaw', category: 'Sides', isVeg: true },
          { name: 'Garlic Bread', category: 'Sides', isVeg: true },
          { name: 'Juice & Soft Drinks', category: 'Beverages', isVeg: true },
          { name: 'Cake Slice', category: 'Dessert', isVeg: true },
          { name: 'Ice Cream', category: 'Dessert', isVeg: true },
        ]
      }
    }),
    prisma.cateringPackage.upsert({
      where: { id: 'cat-premium' },
      update: {},
      create: {
        id: 'cat-premium', name: 'Premium Package', pricePerHead: 55, minGuests: 50,
        description: 'Lavish spread with live stations and premium beverages.',
        menuItems: [
          { name: 'Roast Lamb', category: 'Main', isVeg: false },
          { name: 'Seafood Platter', category: 'Main', isVeg: false },
          { name: 'Pasta Station', category: 'Live Station', isVeg: true },
          { name: 'Sushi Corner', category: 'Live Station', isVeg: false },
          { name: 'Premium Salad Bar', category: 'Sides', isVeg: true },
          { name: 'Mocktails & Juices', category: 'Beverages', isVeg: true },
          { name: 'Dessert Table', category: 'Dessert', isVeg: true },
          { name: 'Custom Cake', category: 'Dessert', isVeg: true },
        ]
      }
    }),
  ])

  console.log('✅ Seed complete!')
  console.log('   Admin:    admin@events99.com / admin123')
  console.log('   Staff:    staff@events99.com / staff123')
  console.log('   Customer: customer@events99.com / customer123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
