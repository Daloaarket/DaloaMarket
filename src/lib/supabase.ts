import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These environment variables will be set after connecting to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars manquantes', { supabaseUrl, supabaseAnonKey });
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);