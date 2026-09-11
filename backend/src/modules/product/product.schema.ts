import { z } from 'zod'

export const createProductSchema = z.object({
  sku: z.string('SKU wajib diisi').trim().min(1, 'SKU wajib diisi').max(50, 'SKU maksimal 50 karakter'),
  name: z
    .string('Nama wajib diisi')
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(200, 'Nama maksimal 200 karakter'),
  description: z.string('Deskripsi harus berupa teks').trim().max(2000, 'Deskripsi maksimal 2000 karakter').nullish(),
  price: z
    .number('Harga harus berupa angka')
    .nonnegative('Harga tidak boleh negatif')
    .multipleOf(0.01, 'Harga maksimal 2 desimal'),
  stock: z
    .number('Stok harus berupa angka')
    .int('Stok harus bilangan bulat')
    .nonnegative('Stok tidak boleh negatif'),
  category: z.string('Kategori harus berupa teks').trim().max(100, 'Kategori maksimal 100 karakter').nullish(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Minimal satu field harus diisi')

export const productIdParamSchema = z.object({
  id: z.uuid('ID produk tidak valid'),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
