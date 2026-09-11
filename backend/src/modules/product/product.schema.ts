import { z } from 'zod'

export const createProductSchema = z.object({
  sku: z
    .string('SKU wajib diisi')
    .trim()
    .min(1, 'SKU wajib diisi')
    .max(50, 'SKU maksimal 50 karakter')
    .toUpperCase(),
  name: z
    .string('Nama wajib diisi')
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(200, 'Nama maksimal 200 karakter'),
  description: z.string('Deskripsi harus berupa teks').trim().max(2000, 'Deskripsi maksimal 2000 karakter').nullish(),
  price: z
    .number('Harga harus berupa angka')
    .nonnegative('Harga tidak boleh negatif')
    .max(9_999_999_999.99, 'Harga maksimal 9.999.999.999,99')
    .multipleOf(0.01, 'Harga maksimal 2 desimal'),
  stock: z
    .number('Stok harus berupa angka')
    .int('Stok harus bilangan bulat')
    .nonnegative('Stok tidak boleh negatif')
    .max(2_147_483_647, 'Stok maksimal 2.147.483.647'),
  category: z.string('Kategori harus berupa teks').trim().max(100, 'Kategori maksimal 100 karakter').nullish(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Minimal satu field harus diisi')

export const productIdParamSchema = z.object({
  id: z.uuid('ID produk tidak valid'),
})

export const listProductsQuerySchema = z.object({
  page: z.coerce.number('Page harus berupa angka').int('Page harus bilangan bulat').min(1, 'Page minimal 1').default(1),
  limit: z.coerce
    .number('Limit harus berupa angka')
    .int('Limit harus bilangan bulat')
    .min(1, 'Limit minimal 1')
    .max(100, 'Limit maksimal 100')
    .default(10),
  search: z
    .string('Pencarian harus berupa teks')
    .trim()
    .min(1, 'Pencarian minimal 1 karakter')
    .max(200, 'Pencarian maksimal 200 karakter')
    .optional(),
  category: z
    .string('Kategori harus berupa teks')
    .trim()
    .min(1, 'Kategori minimal 1 karakter')
    .max(100, 'Kategori maksimal 100 karakter')
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE'], { error: 'Status harus ACTIVE atau INACTIVE' }).optional(),
  sortBy: z
    .enum(['name', 'price', 'stock', 'createdAt', 'updatedAt'], { error: 'sortBy tidak valid' })
    .default('createdAt'),
  order: z.enum(['asc', 'desc'], { error: 'order harus asc atau desc' }).default('desc'),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ListProductsQueryInput = z.infer<typeof listProductsQuerySchema>
