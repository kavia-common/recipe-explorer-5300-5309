import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchCategories } from '../services/api';

/**
 * Sidebar listing recipe categories.
 * Active route highlighting is based on location.
 */
// PUBLIC_INTERFACE
export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const cats = await fetchCategories();
      if (mounted) {
        setCategories(cats);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <aside className="sidebar" aria-label="Recipe categories">
      <h3>Categories</h3>
      {loading ? <div className="supabase-status">Loading categories...</div> : null}
      <ul className="category-list">
        <li className="category-item">
          <Link to="/" className={loc.pathname === '/' ? 'active' : ''}>All Recipes</Link>
        </li>
        {categories.map((c) => (
          <li key={c.id} className="category-item">
            <Link to={`/category/${c.id}`} className={loc.pathname === `/category/${c.id}` ? 'active' : ''}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
