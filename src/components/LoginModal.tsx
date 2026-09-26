'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { X, Loader2 } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

type Step = 'PHONE' | 'OTP' | 'PROFILE'

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const login = useUserStore((state) => state.login)
  
  const [step, setStep] = useState<Step>('PHONE')
  const [phone, setPhone] = useState('+91')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [uid, setUid] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('PHONE')
      setPhone('+91')
      setOtp('')
      setName('')
      setAddress('')
      setError('')
      setLoading(false)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      })
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      setupRecaptcha()
      const appVerifier = window.recaptchaVerifier
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier)
      setConfirmationResult(confirmation)
      setStep('OTP')
    } catch (err: any) {
      console.error('Error during SMS:', err)
      setError(err.message || 'Failed to send OTP. Please try again.')
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmationResult || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await confirmationResult.confirm(otp)
      const user = result.user
      setUid(user.uid)

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        login({ name: data.name, phone: user.phoneNumber || phone, address: data.address })
        onClose()
      } else {
        // New user, go to profile setup
        setStep('PROFILE')
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err)
      setError('Invalid OTP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !address || !uid) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    try {
      // Save to Firestore
      const userDocRef = doc(db, 'users', uid)
      await setDoc(userDocRef, {
        name,
        phone,
        address,
        createdAt: new Date().toISOString()
      })

      // Login locally
      login({ name, phone, address })
      onClose()
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-primary">
            {step === 'PHONE' && 'Login'}
            {step === 'OTP' && 'Verify Phone'}
            {step === 'PROFILE' && 'Complete Profile'}
          </h2>
          <button onClick={onClose} className="text-foreground/60 hover:text-foreground transition-colors p-1 disabled:opacity-50" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Invisible Recaptcha */}
          <div id="recaptcha-container"></div>

          {step === 'PHONE' && (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="font-medium text-sm text-foreground/80">Phone Number</label>
                <input 
                  id="phone"
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9999999999"
                  required
                  className="px-4 py-3 rounded-xl border border-border bg-accent/50 focus:bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">Please include country code (e.g. +91)</p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="mt-2 w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Send OTP
              </button>
            </form>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
              <p className="text-sm text-foreground/80 mb-2">We sent a verification code to <strong>{phone}</strong>.</p>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="otp" className="font-medium text-sm text-foreground/80">Enter OTP</label>
                <input 
                  id="otp"
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  required
                  className="px-4 py-3 rounded-xl border border-border bg-accent/50 focus:bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-center tracking-[1em] font-mono text-xl"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || otp.length < 6}
                className="mt-2 w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Verify & Login
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep('PHONE')}
                className="text-sm text-primary font-medium hover:underline text-center"
                disabled={loading}
              >
                Change Phone Number
              </button>
            </form>
          )}

          {step === 'PROFILE' && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <p className="text-sm text-foreground/80 mb-2">Just one more step! Since you are new here, please tell us where to deliver.</p>
              
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
                Complete Setup
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
