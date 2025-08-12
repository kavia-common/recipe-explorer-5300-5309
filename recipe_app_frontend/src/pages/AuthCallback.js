import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { handleAuthError } from '../utils/auth'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      if (!supabase) {
        navigate('/auth/error?type=config')
        return
      }

      try {
        // For Supabase JS v2: exchange the code from the URL for a session (OAuth / Magic links)
        // Try hash first (implicit grant), then search params (?code=).
        const hash = window.location.hash
        const search = window.location.search

        // Attempt exchanging code if no active session exists
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData?.session) {
          if (hash && hash.includes('access_token')) {
            await supabase.auth.exchangeCodeForSession(hash)
          } else if (search && (search.includes('code=') || search.includes('token='))) {
            await supabase.auth.exchangeCodeForSession(search)
          }
        }

        // Clean the URL
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        // Fetch latest session and redirect accordingly
        const { data: latest } = await supabase.auth.getSession()
        if (latest?.session) {
          navigate('/'); // or '/dashboard' if exists
        } else {
          navigate('/auth/error?type=session')
        }
      } catch (error) {
        handleAuthError(error, navigate)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div className="supabase-status" style={{ padding: '1rem' }}>Processing authentication...</div>
}
