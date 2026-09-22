import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  name: string
  phone: string
  address: string
}

interface UserStore {
  user: UserProfile | null
  login: (profile: UserProfile) => void
  logout: () => void
  updateProfile: (profile: UserProfile) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      login: (profile) => set({ user: profile }),
      logout: () => set({ user: null }),
      updateProfile: (profile) => set({ user: profile }),
    }),
    {
      name: 'user-storage',
    }
  )
)
