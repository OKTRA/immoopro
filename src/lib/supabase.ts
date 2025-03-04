
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hzbogwleoszwtneveuvx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Ym9nd2xlb3N6d3RuZXZldXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDk2NjMsImV4cCI6MjA1NjA4NTY2M30.JLSK18Kn9GXxF0hZkNqhGOMFohui10N5Mbswz0uAKWc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
