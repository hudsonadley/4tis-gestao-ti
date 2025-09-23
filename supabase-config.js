// Configuração do Supabase
export const SUPABASE_URL = 'https://llnivylstqlkcjgiypzh.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsbml2eWxzdHFsa2NqZ2l5cHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTQyMTUsImV4cCI6MjA2MzkzMDIxNX0.VRgALvxMbm_K0hbwi98aFNXncYdZneVNNrN7Xlz8-14';

// Inicializar cliente Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Configuração do Supabase carregada!");

