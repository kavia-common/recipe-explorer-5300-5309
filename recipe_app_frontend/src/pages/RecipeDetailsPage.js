import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchRecipeById,
  fetchIngredientsForRecipe,
  fetchStepsForRecipe,
} from '../services/api';

/**
 * Detailed view for a single recipe, including ingredients and steps.
 */
// PUBLIC_INTERFACE
export default function RecipeDetailsPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [r, ing, st] = await Promise.all([
        fetchRecipeById(Number(id)),
        fetchIngredientsForRecipe(Number(id)),
        fetchStepsForRecipe(Number(id)),
      ]);
      if (mounted) {
        setRecipe(r);
        setIngredients(ing);
        setSteps(st);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return <div className="supabase-status" style={{ padding: '1rem' }}>Loading recipe…</div>;
  }

  if (!recipe) {
    return <div className="supabase-status" style={{ padding: '1rem' }}>Recipe not found.</div>;
  }

  return (
    <article className="details" aria-label={`Recipe details for ${recipe.title}`}>
      <section>
        <img
          className="hero"
          src={recipe.image_url || `https://picsum.photos/seed/recipe-${recipe.id}/1200/800`}
          alt={recipe.title}
        />
        <div className="panel" style={{ marginTop: '1rem' }}>
          <h2 style={{ margin: '0 0 0.5rem' }}>{recipe.title}</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {recipe.description || 'No description available.'}
          </p>
        </div>
        <div className="panel" style={{ marginTop: '1rem' }}>
          <h3>Instructions</h3>
          <ol className="list">
            {steps.map((s) => (
              <li key={s.step_number}>
                {s.instruction}
              </li>
            ))}
          </ol>
          {steps.length === 0 ? <p className="supabase-status">No steps found.</p> : null}
        </div>
      </section>

      <aside>
        <div className="panel">
          <h3>Ingredients</h3>
          <ul className="list">
            {ingredients.map((i, idx) => (
              <li key={`${i.name}-${idx}`}>
                {i.amount ? <strong>{i.amount}</strong> : null} {i.name}
              </li>
            ))}
          </ul>
          {ingredients.length === 0 ? <p className="supabase-status">No ingredients found.</p> : null}
        </div>
      </aside>
    </article>
  );
}
