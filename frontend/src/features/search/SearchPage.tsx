import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { api } from '@/lib/api'
import { followUser, unfollowUser } from '@/features/users/user.api'
import { useDebounce } from '@/lib/useDebounce'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'

interface SearchUser {
  id: string
  username: string
  avatar: string | null
  bio: string | null
  isFollowing: boolean
}

async function searchUsers(q: string): Promise<SearchUser[]> {
  if (!q.trim()) return []
  const res = await api.get<{ users: SearchUser[] }>('/search/users', { params: { q } })
  return res.data.users
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { user: me } = useAuth()
  const qc = useQueryClient()
  const debouncedQuery = useDebounce(query, 300)
  const normalizedQuery = debouncedQuery.startsWith('@') ? debouncedQuery.slice(1) : debouncedQuery

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['search', normalizedQuery],
    queryFn: () => searchUsers(normalizedQuery),
    enabled: normalizedQuery.trim().length > 0,
  })

  const followMutation = useMutation({
    mutationFn: ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) =>
      isFollowing ? unfollowUser(userId) : followUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['search', normalizedQuery] }),
  })

  return (
    <div>
      <header className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10">
        <h1 className="font-semibold text-base mb-3">Buscar</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuarios..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-input bg-accent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Buscar usuarios"
          />
        </div>
      </header>

      <div>
        {isLoading && debouncedQuery && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-accent" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 w-24 rounded bg-accent" />
                  <div className="h-3 w-40 rounded bg-accent" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && normalizedQuery && users.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Sin resultados para "{normalizedQuery}"
          </div>
        )}

        {!query && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Escribí para buscar usuarios
          </div>
        )}

        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors">
            <Link to={`/profile/${u.username}`} className="shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                {u.username[0].toUpperCase()}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${u.username}`} className="font-medium text-sm hover:underline block truncate">
                @{u.username}
              </Link>
              {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
            </div>
            {u.id !== me?.id && (
              <Button
                size="sm"
                variant={u.isFollowing ? 'outline' : 'default'}
                onClick={() => followMutation.mutate({ userId: u.id, isFollowing: u.isFollowing })}
                disabled={followMutation.isPending}
                className="shrink-0"
              >
                {u.isFollowing ? 'Siguiendo' : 'Seguir'}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
