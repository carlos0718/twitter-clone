import { api } from '@/lib/api'
import type { Tweet } from '@/features/tweets/tweet.types'

export interface TimelineResponse {
  tweets: Tweet[]
  total: number
  page: number
  limit: number
}

export async function getTimeline(page = 1, limit = 20): Promise<TimelineResponse> {
  const res = await api.get<TimelineResponse>('/timeline', { params: { page, limit } })
  return res.data
}
