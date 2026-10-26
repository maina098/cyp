'use client'

import { useEffect, useState } from 'react'
import { API_BASE } from '@/lib/api-base'

type LeadershipEntry = {
  id?: string
  name: string
  title: string
  role?: string
  bio?: string | null
  image?: string
  imageUrl?: string | null
  imagePos?: string
  sortOrder?: number
}

function isLeadershipEntryArray(value: unknown): value is LeadershipEntry[] {
  return Array.isArray(value) && value.every((leader) =>
    typeof leader === 'object'
    && leader !== null
    && 'name' in leader
    && typeof leader.name === 'string'
    && 'title' in leader
    && typeof leader.title === 'string',
  )
}

export function LeadershipDirectory({ initialLeaders }: { initialLeaders: LeadershipEntry[] }) {
  const [leaders, setLeaders] = useState(initialLeaders)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true
    fetch(`${API_BASE}/content/leaders`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load public leader directory (${response.status})`)
        const data: unknown = await response.json()
        if (!isLeadershipEntryArray(data)) throw new Error('Public leader directory response is invalid')
        if (active) setLeaders(data)
      })
      .catch((error: unknown) => {
        console.error('Unable to load public leader directory; showing the initial directory.', error)
        if (active) setLoadError(true)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {loadError && <p className="inline-message" role="status">Leadership updates are temporarily unavailable.</p>}
      <div className="leadership-grid">
        {leaders.map((leader) => {
          const image = leader.imageUrl || leader.image
          const description = leader.bio || leader.role
          return (
            <article className="leader-card" key={leader.id || leader.name}>
              {image ? (
                <img src={image} alt={leader.name} className="leader-image" style={leader.imagePos ? { objectPosition: leader.imagePos } : undefined} />
              ) : (
                <div className="leader-image leader-image-placeholder" role="img" aria-label={leader.name}>
                  {leader.name.replace(/^HON\.\s*/, '').split(/\s+/).map((part) => part[0]).join('')}
                </div>
              )}
              <div className="leader-body">
                <h3>{leader.name}</h3>
                <p className="leader-title">{leader.title}</p>
                {description && <p>{description}</p>}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
