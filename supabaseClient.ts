/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// ...existing code...
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || 'https://zridyhrzrmxhzubcqrtl.supabase.co';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZnucTHhevvgFO_DPoxfz_g_pB9q-WOx';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);