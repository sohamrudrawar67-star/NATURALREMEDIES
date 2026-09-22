import { Product } from '@/store/useCartStore'

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Neem Soap',
    price: 150,
    description: 'Pure organic neem soap for healthy, glowing skin. Naturally antibacterial and soothing.',
    image: '/assets/soap.jpg'
  },
  {
    id: '2',
    name: 'Herbal Hair Oil',
    price: 250,
    description: 'Traditional blend of herbs to promote hair growth and reduce hair fall.',
    image: '/assets/oil.jpg'
  },
  {
    id: '3',
    name: 'Ayurvedic Shikakai Shampoo',
    price: 300,
    description: 'Gentle cleansing shampoo made from natural shikakai pods and amla.',
    image: '/assets/shampoo.jpg'
  }
]
