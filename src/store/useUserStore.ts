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
  
  // UI State
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      login: (profile) => set({ user: profile }),
      logout: () => set({ user: null }),
      updateProfile: (profile) => set({ user: profile }),
      
      isLoginModalOpen: false,
      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
