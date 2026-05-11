"use client"

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'info' } | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) setEmail(emailParam)
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already registered')) {
        setMessage({ text: 'Account already exists, signing in...', type: 'info' })
        
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          setMessage({ text: 'Account already exists with this email. Redirecting to sign in...', type: 'error' })
          setTimeout(() => {
            router.push(`/login?email=${encodeURIComponent(email)}&error=wrong_password`)
          }, 2000)
        } else {
          setMessage({ text: 'Signed in successfully! Redirecting...', type: 'success' })
          setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
          }, 1000)
        }
      } else {
        setMessage({ text: signUpError.message, type: 'error' })
        setLoading(false)
      }
    } else {
      setMessage({ text: 'Account created successfully! Redirecting...', type: 'success' })
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1000)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in">
        <div className="text-center mb-8">
          <img src="/spotlex_logo.jpg" alt="Logo" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-sm object-cover" />
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-2">Join Spotlex World Management System</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <form onSubmit={handleSignup} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="email" required 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="staff@spotlex.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Create Password</label>
              <input 
                type="password" required minLength={6}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {message && (
              <div className={`p-3 border text-xs font-medium rounded-lg animate-in ${
                message.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' :
                message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                'bg-blue-50 border-blue-100 text-blue-600'
              }`}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:opacity-80">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center relative z-20">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              {/* THE FIX: Replaced <Link> with native button routing */}
              <button 
                type="button" 
                onClick={() => router.push('/login')} 
                className="text-emerald-600 font-bold hover:underline cursor-pointer focus:outline-none"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>}>
      <SignupForm />
    </Suspense>
  )
}