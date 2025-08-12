import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCategories, createRecipe } from '../services/api';
import { supabase } from '../services/supabaseClient';

/**
 * Page component to add a new recipe.
 * Includes fields for title, category, description, optional image URL,
 * structured ingredient rows (name, amount), and step rows (instruction).
 * Submits data to Supabase to create records in recipes, recipe_ingredients, and recipe_steps.
 */
// PUBLIC_INTERFACE
export default function AddRecipePage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState([{ instruction: '' }]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const supabaseConnected = useMemo(() => Boolean(supabase), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCats(true);
      const cats = await fetchCategories();
      if (mounted) {
        setCategories(cats || []);
        setLoadingCats(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, { name: '', amount: '' }]);
  };
  const removeIngredientRow = (idx) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateIngredient = (idx, field, value) => {
    setIngredients((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const addStepRow = () => {
    setSteps((prev) => [...prev, { instruction: '' }]);
  };
  const removeStepRow = (idx) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateStep = (idx, value) => {
    setSteps((prev) => prev.map((row, i) => (i === idx ? { instruction: value } : row)));
  };

  const validate = () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a title.');
      return false;
    }
    if (!String(categoryId)) {
      setErrorMsg('Please choose a category.');
      return false;
    }
    const hasStep = steps.some((s) => s.instruction && s.instruction.trim());
    if (!hasStep) {
      setErrorMsg('Please add at least one instruction step.');
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (!supabaseConnected) {
      setErrorMsg('Supabase is not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env to add recipes.');
      return;
    }

    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category_id: Number(categoryId),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        ingredients: ingredients
          .filter((r) => (r.name || '').trim())
          .map((r) => ({ name: r.name.trim(), amount: (r.amount || '').trim() || null })),
        steps: steps
          .filter((s) => (s.instruction || '').trim())
          .map((s, idx) => ({ step_number: idx + 1, instruction: s.instruction.trim() })),
      };

      const { data, error } = await createRecipe(payload);
      if (error) {
        setErrorMsg(error.message || 'Failed to create recipe.');
        setSaving(false);
        return;
      }

      setMessage('Recipe created successfully!');
      // Redirect to details page after a brief moment
      setTimeout(() => {
        navigate(`/recipe/${data.id}`);
      }, 600);
    } catch (err) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
      setSaving(false);
    }
  };

  return (
    <section aria-label="Add new recipe" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <h2 style={{ margin: 0 }}>Add Recipe</h2>
        <Link className="link" to="/" style={{ marginLeft: 'auto' }}>← Back to Home</Link>
      </header>

      {!supabaseConnected ? (
        <div className="supabase-status" style={{ marginBottom: '1rem' }}>
          Supabase is not connected. Configure environment variables to enable adding recipes.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="panel" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem' }}>
          <div>
            <label htmlFor="title"><strong>Title</strong></label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spaghetti Carbonara"
              required
              style={{
                marginTop: 6,
                width: '100%',
                background: 'var(--bg-soft)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: 10,
                padding: '0.55rem 0.75rem',
              }}
            />
          </div>

          <div>
            <label htmlFor="category"><strong>Category</strong></label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={{
                marginTop: 6,
                width: '100%',
                background: 'var(--bg-soft)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: 10,
                padding: '0.55rem 0.75rem',
              }}
            >
              <option value="" disabled>{loadingCats ? 'Loading...' : 'Select a category'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description"><strong>Description</strong> <span className="supabase-status">(optional)</span></label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Short description of the recipe..."
            style={{
              marginTop: 6,
              width: '100%',
              background: 'var(--bg-soft)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              borderRadius: 10,
              padding: '0.55rem 0.75rem',
            }}
          />
        </div>

        <div>
          <label htmlFor="imageUrl"><strong>Image URL</strong> <span className="supabase-status">(optional)</span></label>
          <input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={{
              marginTop: 6,
              width: '100%',
              background: 'var(--bg-soft)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              borderRadius: 10,
              padding: '0.55rem 0.75rem',
            }}
          />
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Ingredients</h3>
          <div role="table" aria-label="Ingredients table" style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 86px', gap: 0, background: 'var(--bg-soft)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
              <div role="columnheader">Name</div>
              <div role="columnheader">Amount</div>
              <div role="columnheader">Action</div>
            </div>
            {ingredients.map((row, idx) => (
              <div role="row" key={`ing-${idx}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 86px', gap: 0, padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
                <div role="cell" style={{ paddingRight: 8 }}>
                  <input
                    aria-label={`Ingredient ${idx + 1} name`}
                    value={row.name}
                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    placeholder="e.g., All-purpose flour"
                    style={{
                      width: '100%',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      borderRadius: 8,
                      padding: '0.45rem 0.6rem',
                    }}
                  />
                </div>
                <div role="cell" style={{ paddingRight: 8 }}>
                  <input
                    aria-label={`Ingredient ${idx + 1} amount`}
                    value={row.amount}
                    onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                    placeholder="e.g., 1 1/2 cups"
                    style={{
                      width: '100%',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      borderRadius: 8,
                      padding: '0.45rem 0.6rem',
                    }}
                  />
                </div>
                <div role="cell" style={{ display: 'flex', alignItems: 'center' }}>
                  <button type="button" className="btn" onClick={() => removeIngredientRow(idx)} disabled={ingredients.length === 1}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <button type="button" className="btn" onClick={addIngredientRow}>＋ Add ingredient</button>
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Steps</h3>
          <div role="table" aria-label="Steps table" style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div role="row" style={{ display: 'grid', gridTemplateColumns: '70px 1fr 86px', gap: 0, background: 'var(--bg-soft)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
              <div role="columnheader">Step</div>
              <div role="columnheader">Instruction</div>
              <div role="columnheader">Action</div>
            </div>
            {steps.map((row, idx) => (
              <div role="row" key={`step-${idx}`} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 86px', gap: 0, padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
                <div role="cell" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                  {idx + 1}
                </div>
                <div role="cell" style={{ paddingRight: 8 }}>
                  <textarea
                    aria-label={`Step ${idx + 1} instruction`}
                    value={row.instruction}
                    onChange={(e) => updateStep(idx, e.target.value)}
                    rows={2}
                    placeholder="Describe this step..."
                    style={{
                      width: '100%',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      borderRadius: 8,
                      padding: '0.45rem 0.6rem',
                      resize: 'vertical',
                    }}
                  />
                </div>
                <div role="cell" style={{ display: 'flex', alignItems: 'center' }}>
                  <button type="button" className="btn" onClick={() => removeStepRow(idx)} disabled={steps.length === 1}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <button type="button" className="btn" onClick={addStepRow}>＋ Add step</button>
          </div>
        </div>

        {errorMsg ? (
          <div className="supabase-status" role="alert" style={{ color: '#b91c1c' }}>
            {errorMsg}
          </div>
        ) : null}
        {message ? (
          <div className="supabase-status" role="status" style={{ color: '#065f46' }}>
            {message}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save Recipe'}
          </button>
          <Link to="/" className="btn secondary" aria-label="Cancel and go back" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
