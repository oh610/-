import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 스키마가 안정화되면 `supabase gen types typescript`로 타입을 생성해 createClient<Database>로 교체.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
