import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchRecipes } from '../services/api';
import RecipeCard from '../components/RecipeCard';

/**
 * Search page displaying recipes matching a text query.
 */
// PUBLIC_INTERFACE
export default function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!q) {
        setRecipes([]);
        return;
      }
      setLoading(true);
      const list = await fetchRecipes({ search: q });
      if (mounted) {
        setRecipes(list);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [q]);

  return (
    <section aria-label={`Search results for ${q || ''}`}>
      <h2>Search {q ? `“${q}”` : ''}</h2>
      {loading ? <div className="supabase-status">Searching...</div> : null}
      <div className="recipes-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
      {!loading && q && recipes.length === 0 ? (
        <p className="supabase-status">No results. Try a different keyword.</p>
      ) : null}
      {!q ? <p className="supabase-status">Enter a search term in the search bar above.</p> : null}
    </section>
  );
}
