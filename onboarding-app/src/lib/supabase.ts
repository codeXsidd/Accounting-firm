import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy singleton for browser usage
let _supabase: SupabaseClient | null = null;
export function getSupabase() {
  if (!_supabase) _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) { return getSupabase()[prop as keyof SupabaseClient]; },
});

// Server-side client with service role for elevated operations
export const createServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    { auth: { persistSession: false } }
  );
};

// Types
export type ClientStatus = 'Not Started' | 'In Progress' | 'Completed';
export type ClientType = 'individual' | 'business' | 'nonprofit';

export interface Client {
  id: string;
  name: string;
  email: string;
  notion_page_id: string;
  status: ClientStatus;
  created_at: string;
}

export interface OnboardingData {
  id: string;
  client_id: string;
  client_type: ClientType;
  basic_info: Record<string, unknown>;
  business_info: Record<string, unknown>;
  tax_info: Record<string, unknown>;
  financial_info: Record<string, unknown>;
  signature: string;
  created_at: string;
}

export interface Document {
  id: string;
  client_id: string;
  file_type: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}
