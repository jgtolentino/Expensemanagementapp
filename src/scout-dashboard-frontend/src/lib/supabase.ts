import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to invoke Edge Functions
export async function invokeScoutFunction<T = unknown>(
  functionName: string,
  options?: {
    method?: 'GET' | 'POST'
    body?: unknown
  }
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      method: options?.method || 'POST',
      body: options?.body,
    })

    if (error) {
      return { data: null, error }
    }

    return { data: data as T, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
