'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { X } from 'lucide-react'

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const login = useUserStore((state) => state.login)
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !address) return
    
    login({ name, phone, address })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-primary">Login</h2>
          <button onClick={onClose} className="text-foreground/60 hover:text-foreground transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-medium text-sm text-foreground/80">Full Name</label>
            <input 
              id="name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="px-4 py-3 rounded-xl border border-border bg-accent/50 focus:bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="font-medium text-sm text-foreground/80">Phone Number</label>
            <input 
              id="phone"
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
              className="px-4 py-3 rounded-xl border border-border bg-accent/50 focus:bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="font-medium text-sm text-foreground/80">Delivery Address</label>
            <textarea 
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address"
              required
              rows={3}
              className="px-4 py-3 rounded-xl border border-border bg-accent/50 focus:bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            className="mt-2 w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  )
}
