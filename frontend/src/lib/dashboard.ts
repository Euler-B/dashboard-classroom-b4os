import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from './auth-config'
import type { Student, Assignment, ConsolidatedGrade, StudentFeedback } from './supabase'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

// Create Supabase client for server-side operations
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DashboardData {
  students: Student[]
  assignments: Assignment[]
  grades: ConsolidatedGrade[]
  feedback: StudentFeedback[]
}

// Helper function to get full leaderboard (admin/instructor only)
async function getFullLeaderboard(): Promise<DashboardData> {
  const [studentsResult, assignmentsResult, gradesResult, feedbackResult] = await Promise.all([
    supabase.from('students').select('*').order('github_username'),
    supabase.from('assignments').select('*').order('name'),
    supabase.from('consolidated_grades').select('*').order('github_username'),
    supabase.from('student_reviewers')
      .select('id, student_username, reviewer_username, assignment_name, feedback_for_student, status, completed_at')
      .not('feedback_for_student', 'is', null)
  ])

  if (studentsResult.error) {
    console.error('Error fetching students:', studentsResult.error)
    throw studentsResult.error
  }
  if (assignmentsResult.error) {
    console.error('Error fetching assignments:', assignmentsResult.error)
    throw assignmentsResult.error
  }
  if (gradesResult.error) {
    console.error('Error fetching grades:', gradesResult.error)
    throw gradesResult.error
  }
  if (feedbackResult.error) {
    console.error('Error fetching feedback:', feedbackResult.error)
    // Don't throw - feedback is optional
  }

  return {
    students: studentsResult.data || [],
    assignments: assignmentsResult.data || [],
    grades: gradesResult.data || [],
    feedback: feedbackResult.data || []
  }
}

// Helper function to get anonymized leaderboard (students only see their own data)
async function getAnonymizedLeaderboard(currentUsername?: string): Promise<DashboardData> {
  if (!currentUsername) {
    return {
      students: [],
      assignments: [],
      grades: [],
      feedback: []
    }
  }

  // Fetch all data in parallel
  const [assignmentsResult, gradesResult, studentResult, feedbackResult] = await Promise.all([
    // Get assignments (students can see all assignments)
    supabase.from('assignments').select('*').order('name'),
    // Get only the current user's grades
    supabase.from('consolidated_grades')
      .select('*')
      .eq('github_username', currentUsername)
      .order('assignment_name'),
    // Get only the current user's student record
    supabase.from('students')
      .select('*')
      .eq('github_username', currentUsername)
      .single(),
    // Get feedback for the current user
    supabase.from('student_reviewers')
      .select('id, student_username, reviewer_username, assignment_name, feedback_for_student, status, completed_at')
      .eq('student_username', currentUsername)
      .not('feedback_for_student', 'is', null)
  ])

  if (assignmentsResult.error) {
    console.error('Error fetching assignments:', assignmentsResult.error)
    throw assignmentsResult.error
  }

  if (gradesResult.error) {
    console.error('Error fetching grades:', gradesResult.error)
    throw gradesResult.error
  }

  if (studentResult.error && studentResult.error.code !== 'PGRST116') {
    console.error('Error fetching student:', studentResult.error)
    throw studentResult.error
  }

  if (feedbackResult.error) {
    console.error('Error fetching feedback:', feedbackResult.error)
    // Don't throw - feedback is optional
  }

  return {
    students: studentResult.data ? [studentResult.data] : [],
    assignments: assignmentsResult.data || [],
    grades: gradesResult.data || [],
    feedback: feedbackResult.data || []
  }
}

// Main function to get dashboard data based on user role
export async function getDashboardData(): Promise<DashboardData> {
  const session: Session | null = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Check user role - only administrators can see full leaderboard
  const userRole = session.user.role
  const isAdministrator = userRole === 'administrator'
  
  // Get leaderboard - students only see their own data
  return isAdministrator
    ? await getFullLeaderboard()
    : await getAnonymizedLeaderboard(session.user.githubUsername)
}

