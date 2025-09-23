import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Student {
  github_username: string
  updated_at: string
}

export interface Assignment {
  id: number
  name: string
  points_available: number | null
  updated_at: string
}

export interface Grade {
  id: number
  github_username: string
  assignment_name: string
  points_awarded: number | null
  updated_at: string
}

export interface ConsolidatedGrade {
  github_username: string
  assignment_name: string
  points_awarded: number | null
  points_available: number | null
  percentage: number | null
  grade_updated_at: string
}
