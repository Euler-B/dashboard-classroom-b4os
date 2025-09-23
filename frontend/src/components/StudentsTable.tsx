'use client'

import { useState, useMemo } from 'react'
import { type Student, type Assignment, type ConsolidatedGrade } from '@/lib/supabase'
import { MagnifyingGlass, Funnel, Info, CaretUp, CaretDown } from 'phosphor-react'

interface StudentsTableProps {
  students: Student[]
  assignments: Assignment[]
  grades: ConsolidatedGrade[]
}

type SortField = 'github_username' | 'assignment_name' | 'points_awarded' | 'points_available' | 'percentage'
type SortDirection = 'asc' | 'desc'

export default function StudentsTable({ assignments, grades }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [sortField, setSortField] = useState<SortField>('github_username')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Calculate percentage
  const calculatePercentage = (pointsAwarded: number, pointsAvailable: number) => {
    if (pointsAvailable > 0) {
      return Math.round((pointsAwarded / pointsAvailable) * 100)
    } else if (pointsAwarded > 0) {
      return 100
    }
    return 0
  }

  // Filter and sort data
  const filteredAndSortedGrades = useMemo(() => {
    let filtered = grades

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(grade => 
        grade.github_username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by assignment
    if (selectedAssignment) {
      filtered = filtered.filter(grade => 
        grade.assignment_name === selectedAssignment
      )
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] as string | number
      let bValue: string | number = b[sortField] as string | number

      if (sortField === 'percentage') {
        aValue = calculatePercentage(a.points_awarded || 0, a.points_available || 0)
        bValue = calculatePercentage(b.points_awarded || 0, b.points_available || 0)
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [grades, searchTerm, selectedAssignment, sortField, sortDirection])


  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <CaretUp size={16} /> : <CaretDown size={16} />
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-700'
    if (percentage >= 60) return 'text-yellow-700'
    if (percentage >= 40) return 'text-orange-700'
    return 'text-red-700'
  }

  const getGradeBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100'
    if (percentage >= 60) return 'bg-yellow-100'
    if (percentage >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Info size={24} className="text-blue-600" />
            Challenges de Estudiantes
          </h2>
          
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlass 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Buscar por nombre de usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Assignment Filter */}
          <div className="relative">
            <Funnel size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-[200px]"
            >
              <option value="">Todos los challenges</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.name}>
                  {assignment.name} ({assignment.points_available} pts)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('github_username')}
              >
                <div className="flex items-center gap-2">
                  Usuario
                  {getSortIcon('github_username')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('assignment_name')}
              >
                <div className="flex items-center gap-2">
                  Challenge
                  {getSortIcon('assignment_name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('points_awarded')}
              >
                <div className="flex items-center gap-2">
                  Puntos Obtenidos
                  {getSortIcon('points_awarded')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('points_available')}
              >
                <div className="flex items-center gap-2">
                  Puntos Disponibles
                  {getSortIcon('points_available')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('percentage')}
              >
                <div className="flex items-center gap-2">
                  Porcentaje
                  {getSortIcon('percentage')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedGrades.map((grade, index) => {
              const percentage = calculatePercentage(grade.points_awarded || 0, grade.points_available || 0)
              return (
                <tr key={`${grade.github_username}-${grade.assignment_name}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {grade.github_username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.github_username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {grade.assignment_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grade.points_awarded || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {grade.points_available || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* Barra de progreso */}
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percentage >= 80 ? 'bg-green-500' :
                            percentage >= 60 ? 'bg-yellow-500' :
                            percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{width: `${Math.min(percentage, 100)}%`}}
                        ></div>
                      </div>
                      {/* Porcentaje con pill */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeBgColor(percentage)} ${getGradeColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {filteredAndSortedGrades.length} de {grades.length} registros
          </span>
          <div className="flex items-center gap-4">
            <span>Ordenar por: {sortField}</span>
            <span>Dirección: {sortDirection === 'asc' ? 'Ascendente' : 'Descendente'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}