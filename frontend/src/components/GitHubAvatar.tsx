'use client'

import { useState } from 'react'

interface GitHubAvatarProps {
  username: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
}

export default function GitHubAvatar({ username, size = 'md', className = '' }: GitHubAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  if (imageError) {
    // Fallback a letra inicial
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${className}`}>
        <span className="text-xs">
          {username.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full border border-gray-200 overflow-hidden ${className}`}>
      {imageLoading && (
        <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>
      )}
      <img
        src={`https://github.com/${username}.png`}
        alt={`${username} avatar`}
        className={`${sizeClasses[size]} object-cover transition-opacity duration-200 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  )
}
