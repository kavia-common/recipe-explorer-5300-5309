import { supabase } from '../services/supabaseClient'
import { getURL } from './getURL'

// Error handler for auth flows
export const handleAuthError = (error, navigate) => {
  // eslint-disable-next-line no-console
  console.error('Authentication error:', error)

  const message = String(error?.message || '')
  if (message.toLowerCase().includes('redirect')) {
    navigate('/auth/error?type=redirect')
  } else if (message.toLowerCase().includes('email')) {
    navigate('/auth/error?type=email')
  } else {
    navigate('/auth/error')
  }
}

// Sign up with email/password
export const signUp = async (email, password) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getURL()}auth/callback`,
    },
  })
  return { data, error }
}

// Send password reset
export const resetPassword = async (email) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getURL()}auth/reset-password`,
  })
  return { data, error }
}

// Magic link sign in
export const signInWithMagicLink = async (email) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getURL()}auth/callback`,
    },
  })
  return { data, error }
}

// OAuth sign in
export const signInWithOAuth = async (provider) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getURL()}auth/callback`,
    },
  })
  return { data, error }
}
