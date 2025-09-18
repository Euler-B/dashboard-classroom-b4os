'use client'

import { useState, useEffect } from 'react'
import { Warning, CheckCircle, Clock } from 'phosphor-react'

interface RateLimitInfo {
  remaining: number
  reset: number
  limit: number
}

export default function RateLimitMonitor() {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Verificar rate limit al cargar
    checkRateLimit()
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkRateLimit, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkRateLimit = async () => {
    try {
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'B4OS-Dashboard/1.0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const core = data.resources.core
        
        setRateLimitInfo({
          remaining: core.remaining,
          reset: core.reset,
          limit: core.limit
        })
        
        // Mostrar si estamos cerca del límite
        setIsVisible(core.remaining < 10)
      }
    } catch (error) {
      console.warn('No se pudo verificar el rate limit:', error)
    }
  }

  if (!isVisible || !rateLimitInfo) return null

  const resetTime = new Date(rateLimitInfo.reset * 1000)
  const timeUntilReset = resetTime.getTime() - Date.now()
  const minutesUntilReset = Math.ceil(timeUntilReset / (1000 * 60))

  const getStatusColor = () => {
    if (rateLimitInfo.remaining < 5) return 'text-red-600'
    if (rateLimitInfo.remaining < 20) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusIcon = () => {
    if (rateLimitInfo.remaining < 5) return <Warning className="h-4 w-4" />
    if (rateLimitInfo.remaining < 20) return <Clock className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 max-w-sm">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            GitHub API Status
          </div>
          <div className="text-xs text-gray-600">
            {rateLimitInfo.remaining} / {rateLimitInfo.limit} requests restantes
          </div>
          {rateLimitInfo.remaining < 20 && (
            <div className="text-xs text-gray-500 mt-1">
              Reset en {minutesUntilReset} min
            </div>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      {/* Barra de progreso */}
      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            rateLimitInfo.remaining < 5 ? 'bg-red-500' :
            rateLimitInfo.remaining < 20 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{
            width: `${(rateLimitInfo.remaining / rateLimitInfo.limit) * 100}%`
          }}
        />
      </div>
    </div>
  )
}
