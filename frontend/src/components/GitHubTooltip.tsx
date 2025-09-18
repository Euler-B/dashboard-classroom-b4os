'use client'

import { useState, useEffect, useRef } from 'react'
import { GithubLogo, Calendar, Star, GitFork, Eye } from 'phosphor-react'
import GitHubAvatar from './GitHubAvatar'

interface GitHubTooltipProps {
  username: string
  isVisible: boolean
  position: { x: number; y: number }
}

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

// Cache global para evitar llamadas repetidas
const profileCache = new Map<string, { data: GitHubProfile; timestamp: number }>()
const reposCache = new Map<string, { data: GitHubRepo[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export default function GitHubTooltip({ username, isVisible, position }: GitHubTooltipProps) {
  const [profile, setProfile] = useState<GitHubProfile | null>(null)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && username) {
      fetchGitHubData()
    }
  }, [isVisible, username])

  const fetchGitHubData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Verificar cache para profile
      const cachedProfile = profileCache.get(username)
      if (cachedProfile && Date.now() - cachedProfile.timestamp < CACHE_DURATION) {
        setProfile(cachedProfile.data)
      } else {
        const profileData = await fetchWithRetry<GitHubProfile>(`https://api.github.com/users/${username}`)
        setProfile(profileData)
        profileCache.set(username, { data: profileData, timestamp: Date.now() })
      }

      // Verificar cache para repos
      const cachedRepos = reposCache.get(username)
      if (cachedRepos && Date.now() - cachedRepos.timestamp < CACHE_DURATION) {
        setRepos(cachedRepos.data)
      } else {
        try {
          const reposData = await fetchWithRetry<GitHubRepo[]>(`https://api.github.com/users/${username}/repos?sort=stars&per_page=3`)
          setRepos(reposData)
          reposCache.set(username, { data: reposData, timestamp: Date.now() })
        } catch (reposError) {
          console.warn('No se pudieron cargar los repositorios:', reposError)
          // Continuar sin repos - el perfil es suficiente
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

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

        // Manejar diferentes códigos de estado
        if (response.status === 404) {
          throw new Error('Usuario no encontrado')
        }
        
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
          const rateLimitReset = response.headers.get('X-RateLimit-Reset')
          
          if (rateLimitRemaining === '0' && rateLimitReset) {
            const resetTime = new Date(parseInt(rateLimitReset) * 1000)
            const waitTime = resetTime.getTime() - Date.now() + 1000 // +1 segundo de buffer
            throw new Error(`Límite de API alcanzado. Intenta después de ${new Date(resetTime).toLocaleTimeString()}`)
          }
          
          if (i < retries) {
            // Esperar antes del reintento
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
        // Esperar antes del reintento con backoff exponencial
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
    throw new Error('Máximo de reintentos alcanzado')
  }

  if (!isVisible) return null

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm w-80"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Cargando...</span>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      ) : profile ? (
        <div className="space-y-3">
          {/* Profile Header */}
          <div className="flex items-center gap-3">
            <GitHubAvatar 
              username={profile.login} 
              size="lg"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{profile.name || profile.login}</h3>
              <p className="text-sm text-gray-600">@{profile.login}</p>
            </div>
            <a
              href={profile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <GithubLogo className="h-4 w-4" />
            </a>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-700 line-clamp-2">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-gray-900">{profile.public_repos}</div>
              <div className="text-xs text-gray-600">Repos</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-gray-900">{profile.followers}</div>
              <div className="text-xs text-gray-600">Followers</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-gray-900">{profile.following}</div>
              <div className="text-xs text-gray-600">Following</div>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>Miembro desde {new Date(profile.created_at).getFullYear()}</span>
          </div>

          {/* Top Repositories */}
          {repos.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Repos destacados</h4>
              <div className="space-y-2">
                {repos.map((repo) => (
                  <div key={repo.name} className="border border-gray-200 rounded-lg p-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm truncate block"
                        >
                          {repo.name}
                        </a>
                        {repo.description && (
                          <p className="text-gray-600 text-xs mt-1 line-clamp-1">{repo.description}</p>
                        )}
                        {repo.language && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded mt-1">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 ml-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          {repo.forks_count}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
