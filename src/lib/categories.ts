export const PRODUCT_CATEGORIES = [
  'Ayurvedic Herbal Powder',
  'Ayurvedic Akhand Medicine',
  'Ayurvedic Herbal Cosmetics',
  'Organic Products',
  'Ayurvedic Medicines',
  'Festival Celebrations',
  'Miscellaneous Products',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const DEFAULT_CATEGORY: ProductCategory = 'Miscellaneous Products'
