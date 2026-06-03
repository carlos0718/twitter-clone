import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as tweetService from './tweet.service'

vi.mock('../../shared/utils/prisma', () => ({
  prisma: {
    tweet: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '../../shared/utils/prisma'

const mockUser = { id: 'author-1', username: 'alice', avatar: null }
const mockTweet = {
  id: 'tweet-1',
  content: 'Hello world',
  authorId: 'author-1',
  createdAt: new Date(),
  author: mockUser,
  _count: { likes: 3 },
  likes: [],
}

beforeEach(() => vi.clearAllMocks())

describe('tweet.service - createTweet', () => {
  it('creates a tweet and returns formatted result', async () => {
    vi.mocked(prisma.tweet.create).mockResolvedValue(mockTweet as any)

    const result = await tweetService.createTweet('author-1', { content: 'Hello world' })

    expect(result.content).toBe('Hello world')
    expect(result.likesCount).toBe(3)
    expect(result.author.username).toBe('alice')
  })
})

describe('tweet.service - deleteTweet', () => {
  it('deletes a tweet when user is the author', async () => {
    vi.mocked(prisma.tweet.findUnique).mockResolvedValue(mockTweet as any)
    vi.mocked(prisma.tweet.delete).mockResolvedValue(mockTweet as any)

    await expect(tweetService.deleteTweet('author-1', 'tweet-1')).resolves.toBeUndefined()
  })

  it('throws 403 when user is not the author', async () => {
    vi.mocked(prisma.tweet.findUnique).mockResolvedValue(mockTweet as any)

    await expect(tweetService.deleteTweet('other-user', 'tweet-1')).rejects.toMatchObject({
      message: 'FORBIDDEN',
      statusCode: 403,
    })
  })

  it('throws 404 when tweet does not exist', async () => {
    vi.mocked(prisma.tweet.findUnique).mockResolvedValue(null)

    await expect(tweetService.deleteTweet('author-1', 'nonexistent')).rejects.toMatchObject({
      message: 'TWEET_NOT_FOUND',
      statusCode: 404,
    })
  })
})

describe('tweet.service - getTweetById', () => {
  it('returns a tweet with isLiked flag for authenticated user', async () => {
    const tweetWithLike = { ...mockTweet, likes: [{ userId: 'user-2' }] }
    vi.mocked(prisma.tweet.findUnique).mockResolvedValue(tweetWithLike as any)

    const result = await tweetService.getTweetById('tweet-1', 'user-2')

    expect(result.isLiked).toBe(true)
  })

  it('returns isLiked false when user has not liked', async () => {
    vi.mocked(prisma.tweet.findUnique).mockResolvedValue(mockTweet as any)

    const result = await tweetService.getTweetById('tweet-1', 'user-2')

    expect(result.isLiked).toBe(false)
  })

  it('throws 404 when tweet does not exist', async () => {
    vi.mocked(prisma.tweet.findUnique).mockResolvedValue(null)

    await expect(tweetService.getTweetById('nonexistent')).rejects.toMatchObject({
      statusCode: 404,
    })
  })
})
