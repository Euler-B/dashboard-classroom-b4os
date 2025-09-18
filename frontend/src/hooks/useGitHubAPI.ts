import { useState, useEffect } from 'react'

interface GitHubProfile {
  login: string
  name: string
  bio: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  avatar_url: string
  html_url: string
}

interface GitHubRepo {
  name: string
  description: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string
  updated_at: string
  html_url: string
}

// Cache global
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const useGitHubAPI = (username: string, enabled: boolean = true) => {
  const [profile, setProfile] = useState<GitHubProfile | null>(null)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'B4OS-Dashboard/1.0',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })

        if (response.status === 404) {
          throw new Error('Usuario no encontrado')
        }
        
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
          const rateLimitReset = response.headers.get('X-RateLimit-Reset')
          
          if (rateLimitRemaining === '0' && rateLimitReset) {
            const resetTime = new Date(parseInt(rateLimitReset) * 1000)
            throw new Error(`Límite de API alcanzado. Intenta después de ${new Date(resetTime).toLocaleTimeString()}`)
          }
          
          if (i < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
            continue
          }
          throw new Error('Límite de API alcanzado')
        }

        if (response.status === 422) {
          throw new Error('Username inválido')
        }

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        if (i === retries) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
    throw new Error('Máximo de reintentos alcanzado')
  }

  const getCachedData = (key: string) => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  const setCachedData = (key: string, data: GitHubProfile | GitHubRepo[]) => {
    cache.set(key, { data, timestamp: Date.now() })
  }

  useEffect(() => {
    if (!enabled || !username) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Verificar cache para profile
        const profileKey = `profile-${username}`
        const cachedProfile = getCachedData(profileKey)
        
        if (cachedProfile) {
          setProfile(cachedProfile)
        } else {
          const profileData = await fetchWithRetry<GitHubProfile>(`https://api.github.com/users/${username}`)
          setProfile(profileData)
          setCachedData(profileKey, profileData)
        }

        // Verificar cache para repos
        const reposKey = `repos-${username}`
        const cachedRepos = getCachedData(reposKey)
        
        if (cachedRepos) {
          setRepos(cachedRepos)
        } else {
          try {
            const reposData = await fetchWithRetry<GitHubRepo[]>(`https://api.github.com/users/${username}/repos?sort=stars&per_page=3`)
            setRepos(reposData)
            setCachedData(reposKey, reposData)
          } catch (reposError) {
            console.warn('No se pudieron cargar los repositorios:', reposError)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username, enabled])

  return { profile, repos, loading, error }
}

// Función para limpiar cache manualmente
export const clearGitHubCache = () => {
  cache.clear()
}

// Función para obtener estadísticas del cache
export const getCacheStats = () => {
  const now = Date.now()
  const entries = Array.from(cache.entries())
  const validEntries = entries.filter(([_, value]) => now - value.timestamp < CACHE_DURATION)
  
  return {
    totalEntries: entries.length,
    validEntries: validEntries.length,
    expiredEntries: entries.length - validEntries.length
  }
}
