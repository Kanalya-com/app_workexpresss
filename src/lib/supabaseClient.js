import { createClient } from '@supabase/supabase-js'

// ✅ Usa variables de entorno seguras (.env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// 🔹 Inicializa el cliente de Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
