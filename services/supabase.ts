import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// const SUPABASE_URL = 'https://nazwjoeruujlkqvduqzn.supabase.co';
// const SUPABASE_ANON_KEY ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hendqb2VydXVqbGtxdmR1cXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjU4NTAsImV4cCI6MjA2MDY0MTg1MH0.fZDxWJRvbU3Qwl0mXAqMVTmvU62kLTujQQi3FIVVt8Y'

console.log('Supabase Key', SUPABASE_URL, SUPABASE_ANON_KEY);
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
