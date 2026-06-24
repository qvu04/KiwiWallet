import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[CANH BAO] Thieu SUPABASE_URL hoac SUPABASE_SERVICE_ROLE_KEY trong file .env'
  );
}

// Dung service role key -> backend co toan quyen truy van (bo qua RLS).
// Tuyet doi KHONG dat key nay o frontend.
export const supabase = createClient(
  SUPABASE_URL || 'http://localhost',
  SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  { auth: { persistSession: false } }
);
