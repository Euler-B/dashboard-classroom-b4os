import { Icon } from 'phosphor-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: Icon
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const colorClasses = {
  blue: 'text-gray-600 bg-gray-100',
  green: 'text-gray-600 bg-gray-100',
  purple: 'text-gray-600 bg-gray-100',
  orange: 'text-gray-600 bg-gray-100'
}

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const getEmoji = (title: string) => {
    switch (title) {
      case 'Estudiantes': return '👥'
      case 'Challenges liberados': return '📚'
      case 'Challenges resueltos/en-progreso': return '🎓'
      case 'Promedio': return '📊'
      default: return '📈'
    }
  }

  const getDescription = (title: string, value: string | number) => {
    switch (title) {
      case 'Estudiantes': return `${value} desarrolladores en formación`
      case 'Challenges liberados': return `${value} challenge${value !== 1 ? 's' : ''} activo${value !== 1 ? 's' : ''}`
      case 'Challenges resueltos/en-progreso': return `${value} evaluación${value !== 1 ? 'es' : ''} completada${value !== 1 ? 's' : ''}`
      case 'Promedio': return `Rendimiento general del curso`
      default: return 'Métrica del sistema'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[1]} shadow-sm`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[0]}`} weight="duotone" />
        </div>
        <span className="text-2xl">{getEmoji(title)}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{getDescription(title, value)}</p>
      </div>
    </div>
  )
}
