import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing! Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
