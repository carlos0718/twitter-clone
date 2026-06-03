import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserProfile, followUser, unfollowUser, updateProfile } from './user.api'
import { deleteTweet, likeTweet, unlikeTweet } from '@/features/tweets/tweet.api'
import TweetCard from '@/features/tweets/TweetCard'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import type { Tweet } from '@/features/tweets/tweet.types'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: me, setUser } = useAuth()
  const qc = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [bio, setBio] = useState('')

  const targetUsername = username ?? me?.username
  if (!targetUsername) return <Navigate to="/" replace />

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', targetUsername],
    queryFn: () => getUserProfile(targetUsername),
  })

  const followMutation = useMutation({
    mutationFn: () => profile!.isFollowing ? unfollowUser(profile!.id) : followUser(profile!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', targetUsername] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTweet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', targetUsername] }),
  })

  const likeMutation = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? unlikeTweet(id) : likeTweet(id),
    onMutate: async ({ id, liked }) => {
      await qc.cancelQueries({ queryKey: ['profile', targetUsername] })
      const prev = qc.getQueryData(['profile', targetUsername])
      qc.setQueryData(['profile', targetUsername], (old: any) => ({
        ...old,
        tweets: old.tweets.map((t: Tweet) =>
          t.id === id ? { ...t, isLiked: !liked, likesCount: t.likesCount + (liked ? -1 : 1) } : t
        ),
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      qc.setQueryData(['profile', targetUsername], ctx.prev)
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateProfile({ bio }),
    onSuccess: () => {
      if (me) setUser({ ...me, bio })
      qc.invalidateQueries({ queryKey: ['profile', targetUsername] })
      setEditOpen(false)
    },
  })

  const isOwnProfile = me?.username === targetUsername

  if (isLoading) {
    return (
      <div className="animate-pulse p-4 space-y-4">
        <div className="h-20 rounded bg-accent" />
        <div className="h-4 w-32 rounded bg-accent" />
        <div className="h-3 w-48 rounded bg-accent" />
      </div>
    )
  }

  if (!profile) return <div className="p-8 text-center text-muted-foreground">Usuario no encontrado</div>

  return (
    <div>
      <header className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10">
        <h1 className="font-semibold text-base">@{profile.username}</h1>
      </header>

      {/* Profile info */}
      <div className="px-4 py-4 border-b border-border space-y-3">
        <div className="flex items-start justify-between">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold">
            {profile.username[0].toUpperCase()}
          </div>

          <div className="flex gap-2">
            {isOwnProfile ? (
              <Button variant="outline" size="sm" onClick={() => { setBio(profile.bio ?? ''); setEditOpen(true) }}>
                Editar perfil
              </Button>
            ) : (
              <Button
                size="sm"
                variant={profile.isFollowing ? 'outline' : 'default'}
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                {profile.isFollowing ? 'Siguiendo' : 'Seguir'}
              </Button>
            )}
          </div>
        </div>

        <div>
          <p className="font-bold text-base">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
        </div>

        <div className="flex gap-4 text-sm">
          <span><strong>{profile.followingCount}</strong> <span className="text-muted-foreground">siguiendo</span></span>
          <span><strong>{profile.followersCount}</strong> <span className="text-muted-foreground">seguidores</span></span>
          <span><strong>{profile.tweetsCount}</strong> <span className="text-muted-foreground">tweets</span></span>
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-sm space-y-4 p-6">
            <h2 className="font-semibold text-base">Editar perfil</h2>
            <div className="space-y-1">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{160 - bio.length}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tweets */}
      {profile.tweets.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          {isOwnProfile ? 'Publicá tu primer tweet.' : 'Todavía no hay tweets.'}
        </div>
      ) : (
        profile.tweets.map((tweet) => (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            onLike={(id, liked) => likeMutation.mutate({ id, liked })}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))
      )}
    </div>
  )
}
