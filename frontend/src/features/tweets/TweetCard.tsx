import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, UserPlus, UserMinus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from '@/lib/date'
import { useAuth } from '@/features/auth/AuthContext'
import type { Tweet } from './tweet.types'

interface Props {
  tweet: Tweet
  isFollowing?: boolean
  onLike?: (tweetId: string, liked: boolean) => void
  onDelete?: (tweetId: string) => void
  onFollow?: (authorId: string, isFollowing: boolean) => void
}

export default function TweetCard({ tweet, isFollowing: initialIsFollowing, onLike, onDelete, onFollow }: Props) {
  const { user } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [following, setFollowing] = useState(initialIsFollowing ?? false)
  const isOwner = user?.id === tweet.authorId

  function handleFollow() {
    setFollowing((prev) => !prev)
    onFollow?.(tweet.authorId, following)
  }

  return (
    <article className="border-b border-border px-4 py-3 hover:bg-accent/30 transition-colors">
      <div className="flex gap-3">
        <Link to={`/profile/${tweet.author.username}`} className="shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
            {tweet.author.username[0].toUpperCase()}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to={`/profile/${tweet.author.username}`} className="font-semibold text-sm hover:underline">
              @{tweet.author.username}
            </Link>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">{formatDistanceToNow(tweet.createdAt)}</span>

            {!isOwner && onFollow && (
              <button
                onClick={handleFollow}
                className={`ml-auto flex items-center gap-1 text-xs font-medium transition-colors ${
                  following
                    ? 'text-foreground hover:text-foreground/70'
                    : 'text-muted-foreground hover:text-muted-foreground/70'
                }`}
                aria-label={following ? 'Dejar de seguir' : 'Seguir'}
              >
                {following
                  ? <><UserMinus className="h-3.5 w-3.5" /> Siguiendo</>
                  : <><UserPlus className="h-3.5 w-3.5" /> Seguir</>
                }
              </button>
            )}
          </div>

          <p className="text-sm mt-1 whitespace-pre-wrap break-words">{tweet.content}</p>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onLike?.(tweet.id, !!tweet.isLiked)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-500 transition-colors group"
              aria-label={tweet.isLiked ? 'Quitar like' : 'Dar like'}
            >
              <motion.span
                key={tweet.isLiked ? 'liked' : 'unliked'}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${tweet.isLiked ? 'fill-rose-500 text-rose-500' : 'group-hover:text-rose-500'}`}
                />
              </motion.span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={tweet.likesCount}
                  initial={{ y: -4, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 4, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {tweet.likesCount}
                </motion.span>
              </AnimatePresence>
            </button>

            {isOwner && (
              <div className="ml-auto relative">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Eliminar tweet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">¿Eliminar?</span>
                    <button
                      onClick={() => { onDelete?.(tweet.id); setShowDeleteConfirm(false) }}
                      className="text-destructive font-medium hover:underline"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-muted-foreground hover:underline"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
