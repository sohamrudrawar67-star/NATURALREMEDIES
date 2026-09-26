'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { X, Loader2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const login = useUserStore((state) => state.login)
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !address) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Use phone number as the document ID for easy lookup in the database
      const cleanPhone = phone.replace(/\D/g, '')
      const userDocRef = doc(db, 'users', cleanPhone)
      
      // Save or update user in Firestore
      await setDoc(userDocRef, {
        name,
        phone,
        address,
        lastLogin: new Date().toISOString()
      }, { merge: true }) // merge: true ensures we don't overwrite other fields if they exist

      // Log them in locally
      login({ name, phone, address })
      onClose()
    } catch (err: any) {
      console.error('Error saving user:', err)
      setError('Failed to save details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-primary">Your Details</h2>
          <button onClick={onClose} className="text-foreground/60 hover:text-foreground transition-colors p-1 disabled:opacity-50" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

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
            <label htmlFor="phone" className="font-medium text-sm text-foreground/80">WhatsApp Number</label>
            <input 
              id="phone"
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9999999999"
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
            disabled={loading}
            className="mt-2 w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  )
}
