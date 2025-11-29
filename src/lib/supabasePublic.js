import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cliente que NO usa Auth — solo invoke()
export const supabasePublic = createClient(supabaseUrl, supabaseAnon, {
  auth: { persistSession: false }
});
