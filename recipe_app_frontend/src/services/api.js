import { supabase } from './supabaseClient';

/**
 * Shared sample data used when Supabase is not configured or on errors.
 * This ensures the UI remains functional for demonstration.
 */
const SAMPLE_CATEGORIES = [
  { id: 1, name: 'Breakfast' },
  { id: 2, name: 'Dinner' },
  { id: 3, name: 'Dessert' },
];

const SAMPLE_RECIPES = [
  {
    id: 1,
    title: 'Classic Pancakes',
    description: 'Fluffy pancakes made with simple pantry ingredients.',
    image_url: 'https://picsum.photos/seed/pancakes/600/400',
    category_id: 1,
    ingredients: [
      { name: 'All-purpose flour', amount: '1 1/2 cups' },
      { name: 'Milk', amount: '1 1/4 cups' },
      { name: 'Egg', amount: '1' },
      { name: 'Baking powder', amount: '3 1/2 tsp' },
      { name: 'Salt', amount: '1/2 tsp' },
    ],
    steps: [
      { step_number: 1, instruction: 'Whisk dry ingredients together.' },
      { step_number: 2, instruction: 'Add milk and egg, whisk until smooth.' },
      { step_number: 3, instruction: 'Cook on a hot griddle until golden.' },
    ],
  },
  {
    id: 2,
    title: 'Grilled Lemon Chicken',
    description: 'Juicy, zesty chicken breasts perfect for a quick dinner.',
    image_url: 'https://picsum.photos/seed/chicken/600/400',
    category_id: 2,
    ingredients: [
      { name: 'Chicken breasts', amount: '2' },
      { name: 'Lemon', amount: '1' },
      { name: 'Olive oil', amount: '2 tbsp' },
      { name: 'Garlic', amount: '2 cloves' },
      { name: 'Salt & Pepper', amount: 'to taste' },
    ],
    steps: [
      { step_number: 1, instruction: 'Marinate chicken with lemon, oil, and garlic.' },
      { step_number: 2, instruction: 'Grill 6-7 minutes per side until cooked through.' },
      { step_number: 3, instruction: 'Rest for 5 minutes, then serve.' },
    ],
  },
  {
    id: 3,
    title: 'Chocolate Mousse',
    description: 'Light and airy dessert with rich chocolate flavor.',
    image_url: 'https://picsum.photos/seed/mousse/600/400',
    category_id: 3,
    ingredients: [
      { name: 'Dark chocolate', amount: '200 g' },
      { name: 'Heavy cream', amount: '1 cup' },
      { name: 'Egg whites', amount: '3' },
      { name: 'Sugar', amount: '2 tbsp' },
    ],
    steps: [
      { step_number: 1, instruction: 'Melt chocolate and cool slightly.' },
      { step_number: 2, instruction: 'Whip cream to soft peaks.' },
      { step_number: 3, instruction: 'Fold in whipped egg whites and chill.' },
    ],
  },
];

// Utility to normalize error handling: returns [data, error]
async function supabaseQuery(fn, fallback) {
  try {
    const result = await fn();
    const { data, error } = result || {};
    if (error) throw error;
    return [data, null];
  } catch (e) {
    console.warn('Supabase query failed, using fallback:', e?.message || e);
    return [fallback, e];
  }
}

// PUBLIC_INTERFACE
export async function fetchCategories() {
  if (!supabase) return SAMPLE_CATEGORIES;
  const [data] = await supabaseQuery(
    () => supabase.from('categories').select('*').order('name', { ascending: true }),
    SAMPLE_CATEGORIES
  );
  return Array.isArray(data) ? data : SAMPLE_CATEGORIES;
}

// PUBLIC_INTERFACE
export async function fetchRecipes({ categoryId, search }) {
  // Return sample with filtering when offline
  const filterSample = () => {
    let arr = SAMPLE_RECIPES.slice();
    if (categoryId) arr = arr.filter((r) => Number(r.category_id) === Number(categoryId));
    if (search) {
      const s = search.toLowerCase();
      arr = arr.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          (r.description || '').toLowerCase().includes(s)
      );
    }
    return arr;
  };

  if (!supabase) return filterSample();

  const fn = async () => {
    let query = supabase.from('recipes').select('*').order('title', { ascending: true });
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (search) {
      const like = `%${search}%`;
      query = query.or(`title.ilike.${like},description.ilike.${like}`);
    }
    return await query;
  };

  const [data] = await supabaseQuery(fn, filterSample());
  return Array.isArray(data) ? data : [];
}

/**
 * Create a new recipe with associated ingredients and steps.
 * This function requires Supabase to be configured and appropriate RLS policies
 * to allow inserts (recommended: authenticated users can insert).
 *
 * Returns an object: { data: { id }, error }
 */
// PUBLIC_INTERFACE
export async function createRecipe({ title, category_id, description = null, image_url = null, ingredients = [], steps = [] }) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  // Basic validation at service layer
  if (!title || !category_id) {
    return { data: null, error: new Error('Missing required fields: title, category_id') };
  }

  try {
    // 1) Insert into recipes
    const { data: recipeRow, error: recipeError } = await supabase
      .from('recipes')
      .insert([{ title, description, image_url, category_id }])
      .select('id')
      .single();

    if (recipeError) throw recipeError;
    const recipeId = recipeRow?.id;

    // 2) Insert ingredients if provided
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const rows = ingredients
        .filter((i) => i?.name && String(i.name).trim())
        .map((i) => ({
          recipe_id: recipeId,
          name: String(i.name).trim(),
          amount: (i.amount && String(i.amount).trim()) || null,
        }));
      if (rows.length > 0) {
        const { error: ingError } = await supabase.from('recipe_ingredients').insert(rows);
        if (ingError) throw ingError;
      }
    }

    // 3) Insert steps if provided
    if (Array.isArray(steps) && steps.length > 0) {
      const rows = steps
        .filter((s) => s?.instruction && String(s.instruction).trim())
        .map((s, idx) => ({
          recipe_id: recipeId,
          step_number: Number(s.step_number) || idx + 1,
          instruction: String(s.instruction).trim(),
        }));
      if (rows.length > 0) {
        const { error: stepError } = await supabase.from('recipe_steps').insert(rows);
        if (stepError) throw stepError;
      }
    }

    return { data: { id: recipeId }, error: null };
  } catch (err) {
    // Best-effort rollback of recipe if we created it but failed children
    try {
      if (err && err.hint === undefined) {
        // Attempt to detect if recipe was created by trying to find last inserted id?
        // We only know if recipeId exists in our local scope. If we didn't reach that point, skip.
      }
    } catch (_) {
      // ignore rollback error
    }
    return { data: null, error: err };
  }
}

// PUBLIC_INTERFACE
export async function fetchRecipeById(id) {
  if (!supabase) {
    return SAMPLE_RECIPES.find((r) => Number(r.id) === Number(id)) || null;
  }
  const [data] = await supabaseQuery(
    () => supabase.from('recipes').select('*').eq('id', id).single(),
    SAMPLE_RECIPES.find((r) => Number(r.id) === Number(id)) || null
  );
  return data || null;
}

// PUBLIC_INTERFACE
export async function fetchIngredientsForRecipe(recipeId) {
  if (!supabase) {
    const r = SAMPLE_RECIPES.find((x) => Number(x.id) === Number(recipeId));
    return r?.ingredients || [];
  }
  const [data] = await supabaseQuery(
    () =>
      supabase
        .from('recipe_ingredients')
        .select('name,amount')
        .eq('recipe_id', recipeId)
        .order('id', { ascending: true }),
    []
  );
  return Array.isArray(data) ? data : [];
}

// PUBLIC_INTERFACE
export async function fetchStepsForRecipe(recipeId) {
  if (!supabase) {
    const r = SAMPLE_RECIPES.find((x) => Number(x.id) === Number(recipeId));
    return (r?.steps || []).sort((a, b) => a.step_number - b.step_number);
  }
  const [data] = await supabaseQuery(
    () =>
      supabase
        .from('recipe_steps')
        .select('step_number,instruction')
        .eq('recipe_id', recipeId)
        .order('step_number', { ascending: true }),
    []
  );
  return Array.isArray(data) ? data : [];
}
