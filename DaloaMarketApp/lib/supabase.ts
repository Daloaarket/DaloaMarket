import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://exnxmwkrgyidlauqmtuh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bnhtd2tyZ3lpZGxhdXFtdHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNjY1MjYsImV4cCI6MjA2Mzk0MjUyNn0.PgHDefYstXTOZuQEt4bhZX64glhaaXDjuYoDvJL3Nmw';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});