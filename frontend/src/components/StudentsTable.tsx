'use client'

import { useState, useMemo } from 'react'
import { type Student, type Assignment, type ConsolidatedGrade } from '@/lib/supabase'
import { MagnifyingGlass, Funnel, GithubLogo, Info, CaretUp, CaretDown, X } from 'phosphor-react'
import GitHubTooltip from './GitHubTooltip'
import GitHubAvatar from './GitHubAvatar'

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
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [sortField, setSortField] = useState<SortField>('github_username')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleMouseEnter = (username: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    })
    setSelectedUser(username)
    setIsTooltipVisible(true)
  }

  const handleMouseLeave = () => {
    setIsTooltipVisible(false)
    setSelectedUser(null)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <CaretUp className="h-4 w-4 text-gray-300" weight="bold" />
    }
    return sortDirection === 'asc' 
      ? <CaretUp className="h-4 w-4 text-blue-600" weight="bold" />
      : <CaretDown className="h-4 w-4 text-blue-600" weight="bold" />
  }

  // Generar sugerencias de búsqueda
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return []
    
    const suggestions = new Set<string>()
    const searchLower = searchTerm.toLowerCase()
    
    // Sugerencias de usernames
    grades.forEach(grade => {
      if (grade.github_username.toLowerCase().includes(searchLower)) {
        suggestions.add(grade.github_username)
      }
    })
    
    // Sugerencias de assignments
    grades.forEach(grade => {
      if (grade.assignment_name.toLowerCase().includes(searchLower)) {
        suggestions.add(grade.assignment_name)
      }
    })
    
    return Array.from(suggestions).slice(0, 5) // Máximo 5 sugerencias
  }, [searchTerm, grades])

  // Filter and sort grades
  const filteredAndSortedGrades = useMemo(() => {
    // First filter
    const filtered = grades.filter(grade => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = searchTerm === '' || 
        grade.github_username.toLowerCase().includes(searchLower) ||
        grade.assignment_name.toLowerCase().includes(searchLower)
      const matchesAssignment = !selectedAssignment || grade.assignment_name === selectedAssignment
      return matchesSearch && matchesAssignment
    })

    // Then sort
    return filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'github_username':
          aValue = a.github_username.toLowerCase()
          bValue = b.github_username.toLowerCase()
          break
        case 'assignment_name':
          aValue = a.assignment_name.toLowerCase()
          bValue = b.assignment_name.toLowerCase()
          break
        case 'points_awarded':
          aValue = a.points_awarded ?? 0
          bValue = b.points_awarded ?? 0
          break
        case 'points_available':
          aValue = a.points_available ?? 0
          bValue = b.points_available ?? 0
          break
        case 'percentage':
          aValue = a.percentage ?? 0
          bValue = b.percentage ?? 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [grades, searchTerm, selectedAssignment, sortField, sortDirection])

  // Get unique students from filtered grades (for future use)
  // const uniqueStudents = Array.from(
  //   new Set(filteredGrades.map(grade => grade.github_username))
  // ).map(username => students.find(s => s.github_username === username)).filter(Boolean) as Student[]

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MagnifyingGlass className="h-5 w-5 text-gray-600" weight="duotone" />
            </div>
            Base de Datos de Estudiantes
          </h3>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {filteredAndSortedGrades.length} registro{filteredAndSortedGrades.length !== 1 ? 's' : ''}
                    </div>
                    {searchTerm && (
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <MagnifyingGlass className="h-3 w-3" weight="bold" />
                        <span>Buscando: &ldquo;{searchTerm}&rdquo;</span>
                      </div>
                    )}
                    {sortField && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <span>Ordenado por: {sortField === 'github_username' ? 'Username' : 
                                          sortField === 'assignment_name' ? 'Assignment' :
                                          sortField === 'points_awarded' ? 'Score' :
                                          sortField === 'points_available' ? 'Max' : 'Percent'}</span>
                        {sortDirection === 'asc' ? 
                          <CaretUp className="h-3 w-3" weight="bold" /> : 
                          <CaretDown className="h-3 w-3" weight="bold" />
                        }
                      </div>
                    )}
                  </div>
        </div>
        
        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" weight="duotone" />
            <input
              type="text"
              placeholder="Buscar por estudiante o assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            )}
            
            {/* Sugerencias de búsqueda */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion)
                      setShowSuggestions(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                  >
                    <MagnifyingGlass className="h-4 w-4 text-gray-400" weight="duotone" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative">
            <Funnel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" weight="duotone" />
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
            >
              <option value="">All assignments</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.name}>
                  {assignment.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('github_username')}
                      >
                        <div className="flex items-center gap-2">
                          Username
                          {getSortIcon('github_username')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('assignment_name')}
                      >
                        <div className="flex items-center gap-2">
                          Assignment
                          {getSortIcon('assignment_name')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('points_awarded')}
                      >
                        <div className="flex items-center gap-2">
                          Score
                          {getSortIcon('points_awarded')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('points_available')}
                      >
                        <div className="flex items-center gap-2">
                          Max
                          {getSortIcon('points_available')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('percentage')}
                      >
                        <div className="flex items-center gap-2">
                          Percent
                          {getSortIcon('percentage')}
                        </div>
                      </th>
                    </tr>
                  </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedGrades.map((grade, index) => (
              <tr key={`${grade.github_username}-${grade.assignment_name}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <GitHubAvatar 
                      username={grade.github_username} 
                      size="md"
                      className="flex-shrink-0"
                    />
                    <div className="ml-3 flex items-center gap-2">
                      <a
                        href={`https://github.com/${grade.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200"
                      >
                        {grade.github_username}
                        <GithubLogo className="h-4 w-4 text-gray-400 hover:text-blue-600 transition-colors duration-200" weight="duotone" />
                      </a>
                      <div
                        onMouseEnter={(e) => handleMouseEnter(grade.github_username, e)}
                        onMouseLeave={handleMouseLeave}
                        className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 cursor-pointer"
                        title="Hover para ver resumen de contribuciones"
                      >
                        <Info className="h-4 w-4 text-gray-400 hover:text-blue-600 transition-colors duration-200" weight="duotone" />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {grade.assignment_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {grade.points_awarded ?? '--'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {grade.points_available ?? '--'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (grade.percentage || 0) >= 80 ? 'bg-green-100 text-green-800' :
                    (grade.percentage || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {grade.percentage ? `${Math.round(grade.percentage)}%` : '--'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
                {filteredAndSortedGrades.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No data found</p>
          </div>
        )}
      </div>

      {/* GitHub Profile Tooltip */}
      <GitHubTooltip
        username={selectedUser || ''}
        isVisible={isTooltipVisible}
        position={tooltipPosition}
      />
    </div>
  )
}
