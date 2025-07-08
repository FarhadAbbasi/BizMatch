// Polyfills
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fix for web platform
if (Platform.OS === 'web') {
  (window as any).global = window;
  (window as any).process = {
    env: { DEBUG: undefined },
  };
}

const supabaseUrl = 'https://nazwjoeruujlkqvduqzn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hendqb2VydXVqbGtxdmR1cXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MjI0MDAsImV4cCI6MjAyNTM5ODQwMH0.Qm9Ys0hqJeaRGZbR7bAVYGwMbl1EWtGqKDeeGhvqY0c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 