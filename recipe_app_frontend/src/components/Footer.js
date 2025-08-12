import React from 'react';

/**
 * Simple footer with attribution.
 */
// PUBLIC_INTERFACE
export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <span>© {new Date().getFullYear()} Recipe Explorer</span>
      <span>Powered by Supabase</span>
    </footer>
  );
}
