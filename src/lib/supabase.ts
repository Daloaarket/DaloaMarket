import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These environment variables will be set after connecting to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are properly configured
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  isValidUrl(supabaseUrl);

if (!hasValidCredentials) {
  console.error('Supabase configuration error: Please set up your Supabase credentials in the .env file');
  console.error('Current values:', { 
    supabaseUrl: supabaseUrl || 'missing', 
    supabaseAnonKey: supabaseAnonKey ? 'present but invalid' : 'missing' 
  });
}

// Create a mock client if credentials are not valid to prevent app crash
export const supabase = hasValidCredentials 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');