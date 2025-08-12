import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'

export default function AuthError() {
  const [params] = useSearchParams()
  const type = params.get('type') || 'generic'

  const messages = {
    redirect: 'The redirect URL is not in your Supabase allowlist. Please configure Authentication > URL Configuration in the Supabase Dashboard.',
    email: 'There was a problem sending or confirming your email.',
    session: 'We could not obtain a valid session from Supabase.',
    config: 'Supabase is not configured. Please set environment variables.',
    generic: 'An authentication error occurred.',
  }

  return (
    <section style={{ padding: '1rem' }}>
      <h2>Authentication Error</h2>
      <p className="supabase-status">{messages[type] || messages.generic}</p>
      <p><Link className="link" to="/">Go back home</Link></p>
    </section>
  )
}
