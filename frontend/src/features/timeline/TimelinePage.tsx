import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTimeline } from './timeline.api'
import { useTimelineStream } from './useTimelineStream'
import { createTweet, deleteTweet, likeTweet, unlikeTweet } from '@/features/tweets/tweet.api'
import { followUser, unfollowUser } from '@/features/users/user.api'
import TweetComposer from '@/features/tweets/TweetComposer'
import TweetCard from '@/features/tweets/TweetCard'
import type { Tweet } from '@/features/tweets/tweet.types'

const LIMIT = 20

export default function TimelinePage() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const handleNewTweet = useCallback((_tweet: Tweet) => {
    // don't auto-inject — show the "X new tweets" banner instead
  }, [])

  const { newCount, resetCount } = useTimelineStream(handleNewTweet)

  function loadNew() {
    resetCount()
    setPage(1)
    qc.invalidateQueries({ queryKey: ['timeline'] })
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['timeline', page],
    queryFn: () => getTimeline(page, LIMIT),
  })

  const createMutation = useMutation({
    mutationFn: createTweet,
    onSuccess: () => { setPage(1); qc.invalidateQueries({ queryKey: ['timeline'] }) },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTweet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline'] }),
  })

  const followMutation = useMutation({
    mutationFn: ({ authorId, isFollowing }: { authorId: string; isFollowing: boolean }) =>
      isFollowing ? unfollowUser(authorId) : followUser(authorId),
  })

  const likeMutation = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? unlikeTweet(id) : likeTweet(id),
    onMutate: async ({ id, liked }) => {
      await qc.cancelQueries({ queryKey: ['timeline', page] })
      const prev = qc.getQueryData(['timeline', page])
      qc.setQueryData(['timeline', page], (old: any) => ({
        ...old,
        tweets: old.tweets.map((t: Tweet) =>
          t.id === id ? { ...t, isLiked: !liked, likesCount: t.likesCount + (liked ? -1 : 1) } : t
        ),
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      qc.setQueryData(['timeline', page], ctx.prev)
    },
  })

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div>
      <header className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10">
        <h1 className="font-semibold text-base">Inicio</h1>
      </header>

      <TweetComposer onSubmit={(content) => createMutation.mutateAsync(content)} />

      {newCount > 0 && (
        <button
          onClick={loadNew}
          className="w-full py-2 text-sm text-primary font-medium bg-primary/5 hover:bg-primary/10 transition-colors border-b border-border"
        >
          {newCount} nuevo{newCount !== 1 ? 's' : ''} tweet{newCount !== 1 ? 's' : ''} — ver
        </button>
      )}

      {isLoading && (
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-border p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-accent" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-accent" />
                  <div className="h-3 w-full rounded bg-accent" />
                  <div className="h-3 w-3/4 rounded bg-accent" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="p-8 text-center text-muted-foreground">
          Error al cargar el timeline. Intentá de nuevo.
        </div>
      )}

      {!isLoading && data?.tweets.length === 0 && (
        <div className="p-12 text-center space-y-2">
          <p className="text-lg font-medium">Bienvenido a The Flock</p>
          <p className="text-muted-foreground text-sm">
            Seguí a otros usuarios para ver sus tweets acá.
          </p>
        </div>
      )}

      {data?.tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          isFollowing={true}
          onLike={(id, liked) => likeMutation.mutate({ id, liked })}
          onDelete={(id) => deleteMutation.mutate(id)}
          onFollow={(authorId, isFollowing) => followMutation.mutate({ authorId, isFollowing })}
        />
      ))}

      {data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 p-4 border-t border-border">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-primary disabled:text-muted-foreground hover:underline"
          >
            Anterior
          </button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm text-primary disabled:text-muted-foreground hover:underline"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
