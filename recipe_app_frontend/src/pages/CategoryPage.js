import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRecipes, fetchCategories } from '../services/api';
import RecipeCard from '../components/RecipeCard';

/**
 * Category page displaying recipes for a given category id.
 */
// PUBLIC_INTERFACE
export default function CategoryPage() {
  const { id } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [cats, list] = await Promise.all([fetchCategories(), fetchRecipes({ categoryId: Number(id) })]);
      const cat = cats.find((c) => String(c.id) === String(id));
      if (mounted) {
        setCategoryName(cat?.name || 'Category');
        setRecipes(list);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  return (
    <section aria-label={`Recipes in ${categoryName}`}>
      <h2>{categoryName}</h2>
      {loading ? <div className="supabase-status">Loading recipes...</div> : null}
      <div className="recipes-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
      {!loading && recipes.length === 0 ? (
        <p className="supabase-status">No recipes found for this category.</p>
      ) : null}
    </section>
  );
}
