import React, { useEffect, useState } from 'react';
import { fetchRecipes } from '../services/api';
import RecipeCard from '../components/RecipeCard';

/**
 * Home page showing all recipes in a grid.
 */
// PUBLIC_INTERFACE
export default function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const list = await fetchRecipes({});
      if (mounted) {
        setRecipes(list);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section aria-label="All recipes">
      <h2>All Recipes</h2>
      {loading ? <div className="supabase-status">Loading recipes...</div> : null}
      <div className="recipes-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
      {!loading && recipes.length === 0 ? (
        <p className="supabase-status">No recipes found. Ensure Supabase is configured or add some data.</p>
      ) : null}
    </section>
  );
}
