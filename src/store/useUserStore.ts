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
      // Older versions stored an isAdmin flag client-side. It grants nothing now; drop it.
      merge: (persisted, current) => {
        const user = (persisted as { user?: UserProfile & { isAdmin?: boolean } } | undefined)?.user
        if (!user) return current
        const { name, phone, address } = user
        return { ...current, user: { name, phone, address } }
      },
    }
  )
)
