
/**
 * Supabase Client Configuration
 */

const SUPABASE_URL = 'https://aalwzvektrvegfakirjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbHd6dmVrdHJ2ZWdmYWtpcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjExMDYsImV4cCI6MjA3OTQ5NzEwNn0.ilL8I6iBYY24_TTK7jeVxJoUCd7ZC464_M-tKVTNo-Q';

// Initialize the Supabase client
const { createClient } = supabase;
window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized');
