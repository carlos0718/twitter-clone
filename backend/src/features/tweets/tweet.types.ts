import { z } from 'zod'

export const createTweetSchema = z.object({
  content: z.string().min(1).max(280),
})

export type CreateTweetInput = z.infer<typeof createTweetSchema>

export interface TweetWithAuthor {
  id: string
  content: string
  authorId: string
  createdAt: Date
  author: {
    id: string
    username: string
    avatar: string | null
  }
  likesCount: number
  isLiked?: boolean
}
