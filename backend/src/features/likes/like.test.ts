import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as likeService from './like.service'

vi.mock('../../shared/utils/prisma', () => ({
  prisma: {
    tweet: { findUnique: vi.fn() },
    like: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '../../shared/utils/prisma'

const mockTweet = { id: 'tweet-1', content: 'Hello', authorId: 'user-2', createdAt: new Date() }
const mockLike = { userId: 'user-1', tweetId: 'tweet-1', createdAt: new Date() }

beforeEach(() => vi.clearAllMocks())

describe('like.service - likeTweet', () => {
  it('likes a tweet successfully', async () => {
    vi.mocked(prisma.tweet.findUnique).mockResolvedValue(mockTweet as any)
    vi.mocked(prisma.like.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.like.create).mockResolvedValue(mockLike as any)

    await expect(likeService.likeTweet('user-1', 'tweet-1')).resolves.toBeUndefined()
  })

  it('throws 404 when tweet does not exist', async () => {
    vi.mocked(prisma.tweet.findUnique).mockResolvedValue(null)

    await expect(likeService.likeTweet('user-1', 'ghost')).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('throws 409 when already liked', async () => {
    vi.mocked(prisma.tweet.findUnique).mockResolvedValue(mockTweet as any)
    vi.mocked(prisma.like.findUnique).mockResolvedValue(mockLike)

    await expect(likeService.likeTweet('user-1', 'tweet-1')).rejects.toMatchObject({
      message: 'ALREADY_LIKED',
      statusCode: 409,
    })
  })
})

describe('like.service - unlikeTweet', () => {
  it('unlikes a tweet successfully', async () => {
    vi.mocked(prisma.like.findUnique).mockResolvedValue(mockLike)
    vi.mocked(prisma.like.delete).mockResolvedValue(mockLike as any)

    await expect(likeService.unlikeTweet('user-1', 'tweet-1')).resolves.toBeUndefined()
  })

  it('throws 404 when like does not exist', async () => {
    vi.mocked(prisma.like.findUnique).mockResolvedValue(null)

    await expect(likeService.unlikeTweet('user-1', 'tweet-1')).rejects.toMatchObject({
      statusCode: 404,
    })
  })
})
