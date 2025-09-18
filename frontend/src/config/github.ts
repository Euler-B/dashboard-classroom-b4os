// Configuración para la API de GitHub
export const GITHUB_CONFIG = {
  // URLs base
  BASE_URL: 'https://api.github.com',
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'B4OS-Dashboard/1.0',
    'X-GitHub-Api-Version': '2022-11-28'
  },
  
  // Configuración de cache
  CACHE: {
    DURATION: 5 * 60 * 1000, // 5 minutos
    MAX_ENTRIES: 100, // Máximo 100 entradas en cache
  },
  
  // Configuración de reintentos
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000, // 1 segundo
    MAX_DELAY: 10000, // 10 segundos máximo
  },
  
  // Límites de rate limiting
  RATE_LIMITS: {
    REQUESTS_PER_HOUR: 60, // Límite conservador
    BURST_LIMIT: 10, // Máximo 10 requests en burst
  }
}

// Función para calcular delay con backoff exponencial
export const calculateDelay = (attempt: number): number => {
  const { BASE_DELAY, MAX_DELAY } = GITHUB_CONFIG.RETRY
  const delay = BASE_DELAY * Math.pow(2, attempt)
  return Math.min(delay, MAX_DELAY)
}

// Función para verificar si estamos cerca del límite de rate
export const isNearRateLimit = (remaining: string | null, reset: string | null): boolean => {
  if (!remaining || !reset) return false
  
  const remainingCount = parseInt(remaining)
  const resetTime = parseInt(reset) * 1000
  const timeUntilReset = resetTime - Date.now()
  
  // Si quedan menos de 10 requests y faltan más de 5 minutos para reset
  return remainingCount < 10 && timeUntilReset > 5 * 60 * 1000
}

// Función para obtener mensaje de error amigable
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message
    
    if (message.includes('404')) {
      return 'Usuario no encontrado en GitHub'
    }
    
    if (message.includes('403')) {
      return 'Límite de API alcanzado. Intenta más tarde'
    }
    
    if (message.includes('422')) {
      return 'Username inválido'
    }
    
    if (message.includes('Failed to fetch')) {
      return 'Error de conexión. Verifica tu internet'
    }
    
    return message
  }
  
  return 'Error desconocido'
}
