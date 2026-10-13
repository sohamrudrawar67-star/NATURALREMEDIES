import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  slug?: string
}

export interface Order {
  id: string
  createdAt: string
  items: OrderItem[]
  subtotal: number
  totalItems: number
  customerName: string
  customerPhone: string
  customerAddress: string
  status: 'Sent on WhatsApp' | 'Delivered' | 'In Progress'
}

interface OrderStore {
  orders: Order[]
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order
  clearOrders: () => void
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (data) => {
        // Generate a friendly reference number e.g. NR-742918
        const randomNum = Math.floor(100000 + Math.random() * 900000)
        const id = `NR-${randomNum}`
        const newOrder: Order = {
          ...data,
          id,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }))
        return newOrder
      },
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: 'order-storage',
    }
  )
)
