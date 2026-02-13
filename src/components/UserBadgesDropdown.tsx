'use client'

import { useTranslations } from 'next-intl'
import { BADGE_DEFINITIONS, BadgeInfo } from '@/lib/badges'
import { Trophy, Lock } from 'phosphor-react'

interface UserBadgesDropdownProps {
  readonly badges: BadgeInfo[];
  readonly currentPoints: number;
}

export default function UserBadgesDropdown({ badges, currentPoints }: UserBadgesDropdownProps) {
  const t = useTranslations('badges')
  const tc = useTranslations('common')

  const earnedCount = badges.filter(b => b.earned).length
  const nextBadge = badges.find(b => !b.earned)
  const progressPercentage = Math.round((earnedCount / BADGE_DEFINITIONS.length) * 100)

  return (
    <div className="mt-3">
      {/* Header with Trophy icon */}
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} className="text-amber-400" />
        <span className="text-sm font-semibold text-gray-800">
          {t('title')}
        </span>
        <span className="text-xs text-gray-500">
          ({earnedCount}/{BADGE_DEFINITIONS.length})
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{tc('yourScore')}: {currentPoints} pts</span>
          {nextBadge && (
            <span>{nextBadge.level - currentPoints} pts to next</span>
          )}
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Compact Badges Grid */}
      <div className="flex gap-1.5">
        {BADGE_DEFINITIONS.map((def) => {
          const badge = badges.find(b => b.level === def.level)
          const isEarned = badge?.earned

          return (
            <div
              key={def.level}
              className={`
                relative flex flex-col items-center p-1.5 rounded-lg border transition-all duration-300 flex-1
                ${isEarned 
                  ? 'bg-amber-50 border-amber-300' 
                  : 'bg-gray-100 border-gray-200 opacity-60'
                }
              `}
              title={`${def.name}: ${def.level} pts - ${isEarned ? def.description : 'Locked'}`}
            >
              {/* Badge icon */}
              <div className="text-lg mb-0.5">
                {isEarned ? def.icon : <Lock size={12} className="text-gray-400" />}
              </div>

              {/* Earned indicator */}
              {isEarned && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>
          )
        })}
      </div>

      {/* Next badge info */}
      {nextBadge && (
        <div className="mt-2 p-2 bg-amber-50 rounded-lg text-center">
          <p className="text-xs text-amber-700">
            <span className="font-bold">{nextBadge.level - currentPoints}</span>
            {' '}pts to unlock {nextBadge.icon} <span className="font-medium">{nextBadge.name}</span>
          </p>
        </div>
      )}

      {/* All earned celebration */}
      {!nextBadge && earnedCount === BADGE_DEFINITIONS.length && (
        <div className="mt-2 p-2 bg-amber-100 rounded-lg text-center border border-amber-300">
          <p className="text-xs text-amber-800 font-bold">✨ All badges earned! ✨</p>
        </div>
      )}
    </div>
  )
}
