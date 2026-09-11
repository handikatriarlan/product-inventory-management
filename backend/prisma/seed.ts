import { prisma } from '../src/lib/prisma.ts'
import type { Prisma } from '../src/generated/prisma/client.ts'

const products: Prisma.ProductCreateManyInput[] = [
  {
    sku: 'SKU-0001',
    name: 'Laptop Pro 14',
    description: 'Laptop 14 inci, RAM 16GB, SSD 512GB.',
    price: 12_500_000,
    stock: 0,
    category: 'Electronics',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0002',
    name: 'Smartphone X1',
    description: 'Layar 6,5 inci, baterai 5000mAh.',
    price: 6_750_000,
    stock: 0,
    category: 'Electronics',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0003',
    name: 'Headphone Bluetooth',
    price: 899_000,
    stock: 0,
    category: 'Electronics',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0004',
    name: 'Keyboard Mekanik',
    description: 'Switch brown, layout 75%.',
    price: 1_250_000,
    stock: 2,
    category: 'Electronics',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0005',
    name: 'Mouse Wireless',
    price: 275_000,
    stock: 3,
    category: 'Electronics',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0006',
    name: 'Kursi Ergonomis',
    description: 'Sandaran mesh, tinggi dapat diatur.',
    price: 2_150_000,
    stock: 5,
    category: 'Furniture',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0007',
    name: 'Meja Kerja',
    description: 'Meja 120x60 cm, rangka besi.',
    price: 1_800_000,
    stock: 20,
    category: 'Furniture',
    status: 'INACTIVE',
  },
  {
    sku: 'SKU-0008',
    name: 'Lemari Arsip',
    price: 2_650_000,
    stock: 8,
    category: 'Furniture',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0009',
    name: 'Rak Buku',
    price: 950_000,
    stock: 35,
    category: 'Furniture',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0010',
    name: 'Buku Tulis A5',
    description: 'Isi 100 lembar, sampul tebal.',
    price: 25_000,
    stock: 200,
    category: 'Stationery',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0011',
    name: 'Pulpen Gel',
    price: 15_000,
    stock: 500,
    category: 'Stationery',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0012',
    name: 'Stabilo Warna',
    description: 'Satu set berisi 6 warna.',
    price: 45_000,
    stock: 120,
    category: 'Stationery',
    status: 'INACTIVE',
  },
  {
    sku: 'SKU-0013',
    name: 'Papan Tulis',
    description: 'Papan putih 90x120 cm.',
    price: 320_000,
    stock: 18,
    category: 'Stationery',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0014',
    name: 'Kemeja Formal',
    description: 'Bahan katun, ukuran M sampai XL.',
    price: 280_000,
    stock: 40,
    category: 'Apparel',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0015',
    name: 'Jaket Bomber',
    price: 425_000,
    stock: 25,
    category: 'Apparel',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0016',
    name: 'Sepatu Sneakers',
    description: 'Sol karet, tersedia ukuran 39-44.',
    price: 750_000,
    stock: 30,
    category: 'Apparel',
    status: 'INACTIVE',
  },
  {
    sku: 'SKU-0017',
    name: 'Topi Baseball',
    price: 95_000,
    stock: 60,
    category: 'Apparel',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0018',
    name: 'Panci Set',
    description: 'Satu set berisi 4 panci.',
    price: 680_000,
    stock: 15,
    category: 'Kitchen',
    status: 'ACTIVE',
  },
  {
    sku: 'SKU-0019',
    name: 'Blender',
    price: 540_000,
    stock: 10,
    category: 'Kitchen',
    status: 'INACTIVE',
  },
  {
    sku: 'SKU-0020',
    name: 'Air Fryer',
    description: 'Kapasitas 4 liter, 1400 watt.',
    price: 1_100_000,
    stock: 12,
    category: 'Kitchen',
    status: 'ACTIVE',
  },
]

async function main() {
  await prisma.product.deleteMany()
  await prisma.product.createMany({ data: products })
  const total = await prisma.product.count()
  console.log(`Seed selesai: ${total} produk`)
}

main()
  .catch((error) => {
    console.error('Seed gagal:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
