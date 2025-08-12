import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configured from environment variables.
 * Requires:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY
 *
 * If either value is missing, the client will be null and the app will run in
 * a degraded "offline" mode with sample data.
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Export a possibly-null client. Callers must handle null.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;
