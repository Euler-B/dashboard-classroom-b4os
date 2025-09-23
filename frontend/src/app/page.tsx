'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase, type Student, type Assignment, type ConsolidatedGrade } from '@/lib/supabase'
import { Users, BookOpen, Medal, TrendUp } from 'phosphor-react'
import StatsCard from '@/components/StatsCard'
import StudentsTable from '@/components/StudentsTable'

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [grades, setGrades] = useState<ConsolidatedGrade[]>([])
  const [lastSync, setLastSync] = useState<string>('')

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [studentsResult, assignmentsResult, gradesResult] = await Promise.all([
        supabase.from('students').select('*').order('github_username'),
        supabase.from('assignments').select('*').order('name'),
        supabase.from('consolidated_grades').select('*').order('github_username')
      ])

      if (studentsResult.error) throw studentsResult.error
      if (assignmentsResult.error) throw assignmentsResult.error
      if (gradesResult.error) throw gradesResult.error

      setStudents(studentsResult.data || [])
      setAssignments(assignmentsResult.data || [])
      setGrades(gradesResult.data || [])
      
      setLastSync(new Date().toLocaleString('es-ES'))
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Calculate statistics with proper percentage calculation
  const calculatePercentage = (pointsAwarded: number, pointsAvailable: number) => {
    if (pointsAvailable > 0) {
      return (pointsAwarded / pointsAvailable) * 100
    } else if (pointsAwarded > 0) {
      return 100 // Si hay puntos otorgados pero no disponibles, considerar 100%
    }
    return 0
  }

  const validGrades = grades.filter(grade => {
    const pointsAwarded = grade.points_awarded || 0
    const pointsAvailable = grade.points_available || 0
    return pointsAwarded > 0 || pointsAvailable > 0
  })

  const stats = {
    totalStudents: students.length,
    totalAssignments: assignments.length,
    totalGrades: validGrades.length,
    averageGrade: validGrades.length > 0 
      ? Math.round(validGrades.reduce((sum, grade) => {
          const percentage = calculatePercentage(grade.points_awarded || 0, grade.points_available || 0)
          return sum + percentage
        }, 0) / validGrades.length)
      : 0
  }

  useEffect(() => {
    fetchData()
  }, [])


  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-8 lg:mb-0">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <Image 
                  src="/web-app-manifest-192x192.png" 
                  alt="$B4OS Logo" 
                  width={48}
                  height={48}
                  className="mr-3"
                />
              </div>
              <h3 className="text-2xl font-semibold text-orange-400 mb-2">
                Bitcoin 4 Open Source estado de los challenges
              </h3>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Última sync: {lastSync || 'Nunca'}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 shadow-xl">
              <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Estado del Curso
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 px-4 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300 font-medium">Estudiantes activos:</span>
                  <span className="text-orange-400 font-bold text-xl ml-4">{stats.totalStudents}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300 font-medium">Challenges liberados:</span>
                  <span className="text-blue-400 font-bold text-xl ml-4">{stats.totalAssignments}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300 font-medium">Challenges resueltos/en-progreso:</span>
                  <span className="text-green-400 font-bold text-xl ml-4">{stats.totalGrades}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Estudiantes"
            value={stats.totalStudents}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Challenges liberados"
            value={stats.totalAssignments}
            icon={BookOpen}
            color="green"
          />
          <StatsCard
            title="Challenges resueltos/en-progreso"
            value={stats.totalGrades}
            icon={Medal}
            color="purple"
          />
          <StatsCard
            title="Promedio"
            value={`${stats.averageGrade}%`}
            icon={TrendUp}
            color="orange"
          />
        </div>


        {/* Students Table */}
        <StudentsTable 
          students={students}
          assignments={assignments}
          grades={grades}
        />
      </div>
    </div>
  )
}