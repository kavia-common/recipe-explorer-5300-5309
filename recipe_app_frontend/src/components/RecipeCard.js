import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Card view for a recipe item.
 *
 * Props:
 * - recipe: { id, title, description, image_url }
 */
// PUBLIC_INTERFACE
export default function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <img
        src={recipe.image_url || `https://picsum.photos/seed/recipe-${recipe.id}/600/400`}
        alt={recipe.title}
        loading="lazy"
      />
      <div className="card-content">
        <h4>{recipe.title}</h4>
        <p>{recipe.description || 'No description available.'}</p>
        <Link className="link" to={`/recipe/${recipe.id}`} aria-label={`View ${recipe.title}`}>View details →</Link>
      </div>
    </div>
  );
}
