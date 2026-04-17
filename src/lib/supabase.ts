import { createClient } from '@supabase/supabase-js';

// Production-ready Supabase Client
// It prioritizes VITE_ environment variables (standard for Vite/Vercel)
// but keeps the verified values as fallback for AI Studio Preview.

const projectID = 'fmcltrjnuvuooarkvufn';
const supabaseUrl = `https://${projectID}.supabase.co`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY2x0cmpudXZ1b29hcmt2dWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzY3MDQsImV4cCI6MjA5MDcxMjcwNH0.PkSgBAZx41X4sZurfyOdxCVa01hkKTkyBhVkGzx_4y4';

console.log('Connecting to Supabase:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Self-executing connection test
(async () => {
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      if (error.message === 'Failed to fetch') {
        console.error('CRITICAL: Network error. Please check if your project is PAUSED or if an Adblocker is blocking "supabase.co"');
      } else {
        console.warn('Database connection check:', error.message);
      }
    } else {
      console.log('✅ Supabase connection verified successfully!');
    }
  } catch (err) {
    console.error('Supabase initialization failed:', err);
  }
})();
