import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

/**
 * Navbar with brand, search form, theme toggle, and Supabase connection status.
 * Provides top-level navigation and search across recipes.
 *
 * Props:
 * - onToggleTheme: function to toggle light/dark
 * - theme: current theme string ('light'|'dark')
 */
// PUBLIC_INTERFACE
export default function Navbar({ onToggleTheme, theme }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const existing = params.get('q') || '';
    setQ(existing);
  }, [params]);

  const connected = useMemo(() => Boolean(supabase), []);

  const onSubmit = (e) => {
    e.preventDefault();
    const query = (q || '').trim();
    if (!query) {
      navigate('/');
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Primary">
      <Link to="/" className="brand" aria-label="Recipe Explorer Home">
        🥗 Recipe Explorer
      </Link>

      <form className="search" onSubmit={onSubmit} role="search" aria-label="Search recipes">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search recipes..."
          aria-label="Search recipes"
        />
        <button className="btn" type="submit" aria-label="Search">
          Search
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
        <Link to="/add" className="btn" aria-label="Add a new recipe" style={{ textDecoration: 'none' }}>
          ＋ Add Recipe
        </Link>
        <span className="supabase-status" title={connected ? 'Supabase connected' : 'Supabase not configured'}>
          {connected ? 'Online' : 'Offline'}
        </span>
        <button
          className="btn secondary"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
