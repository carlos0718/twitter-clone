import { api } from '@/lib/api'
import type { Tweet } from './tweet.types'

export async function createTweet(content: string): Promise<Tweet> {
  const res = await api.post<{ tweet: Tweet }>('/tweets', { content })
  return res.data.tweet
}

export async function deleteTweet(id: string): Promise<void> {
  await api.delete(`/tweets/${id}`)
}

export async function likeTweet(tweetId: string): Promise<void> {
  await api.post(`/likes/${tweetId}`)
}

export async function unlikeTweet(tweetId: string): Promise<void> {
  await api.delete(`/likes/${tweetId}`)
}
