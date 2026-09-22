'use client'

import { useUserStore } from '@/store/useUserStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, updateProfile } = useUserStore()
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setPhone(user.phone)
      setAddress(user.address)
    }
  }, [user])

  if (!mounted) return <div className="container mx-auto px-4 py-16 text-center">Loading profile...</div>

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">Please Log In</h1>
        <p className="text-foreground/70 mb-8">
          You need to be logged in to view your profile.
        </p>
      </div>
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !address) return
    
    updateProfile({ name, phone, address })
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-card p-8 rounded-3xl shadow-sm border border-border">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Your Profile</h1>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-primary font-medium hover:underline"
            >
              Edit Details
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-medium text-foreground/80">Full Name</label>
              <input 
                id="name"
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="font-medium text-foreground/80">Phone Number</label>
              <input 
                id="phone"
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="address" className="font-medium text-foreground/80">Delivery Address</label>
              <textarea 
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={4}
                className="px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
              <button 
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setName(user.name)
                  setPhone(user.phone)
                  setAddress(user.address)
                }}
                className="flex-1 bg-accent text-accent-foreground py-3 rounded-xl font-bold hover:bg-accent/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
              <div className="text-foreground/70 font-medium">Name</div>
              <div className="col-span-2 font-medium">{user.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
              <div className="text-foreground/70 font-medium">Phone</div>
              <div className="col-span-2 font-medium">{user.phone}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
              <div className="text-foreground/70 font-medium">Address</div>
              <div className="col-span-2 font-medium">{user.address}</div>
            </div>

            <button 
              onClick={handleLogout}
              className="mt-4 w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
