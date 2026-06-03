import { useEffect, useRef, useState } from 'react'
import type { Tweet } from '@/features/tweets/tweet.types'

export function useTimelineStream(onNewTweet: (tweet: Tweet) => void) {
  const [newCount, setNewCount] = useState(0)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const es = new EventSource(`/api/stream?token=${token}`)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'new_tweet') {
          setNewCount((n) => n + 1)
          onNewTweet(data.tweet)
        }
      } catch {}
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [onNewTweet])

  function resetCount() {
    setNewCount(0)
  }

  return { newCount, resetCount }
}
