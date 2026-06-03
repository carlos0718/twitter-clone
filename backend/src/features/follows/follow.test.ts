import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as followService from './follow.service'

vi.mock('../../shared/utils/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    follow: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '../../shared/utils/prisma'

const mockUser = { id: 'user-2', username: 'bob', avatar: null, bio: null }

beforeEach(() => vi.clearAllMocks())

describe('follow.service - followUser', () => {
  it('follows a user successfully', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.follow.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.follow.create).mockResolvedValue({} as any)

    await expect(followService.followUser('user-1', 'user-2')).resolves.toBeUndefined()
  })

  it('throws 400 when trying to follow self', async () => {
    await expect(followService.followUser('user-1', 'user-1')).rejects.toMatchObject({
      message: 'CANNOT_FOLLOW_SELF',
      statusCode: 400,
    })
  })

  it('throws 404 when target user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    await expect(followService.followUser('user-1', 'ghost')).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('throws 409 when already following', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.follow.findUnique).mockResolvedValue({ followerId: 'user-1', followingId: 'user-2', createdAt: new Date() })

    await expect(followService.followUser('user-1', 'user-2')).rejects.toMatchObject({
      statusCode: 409,
    })
  })
})

describe('follow.service - unfollowUser', () => {
  it('unfollows a user successfully', async () => {
    vi.mocked(prisma.follow.findUnique).mockResolvedValue({ followerId: 'user-1', followingId: 'user-2', createdAt: new Date() })
    vi.mocked(prisma.follow.delete).mockResolvedValue({} as any)

    await expect(followService.unfollowUser('user-1', 'user-2')).resolves.toBeUndefined()
  })

  it('throws 404 when not following', async () => {
    vi.mocked(prisma.follow.findUnique).mockResolvedValue(null)

    await expect(followService.unfollowUser('user-1', 'user-2')).rejects.toMatchObject({
      statusCode: 404,
    })
  })
})

describe('follow.service - getFollowers / getFollowing', () => {
  it('returns list of followers', async () => {
    vi.mocked(prisma.follow.findMany).mockResolvedValue([
      { follower: { id: 'user-3', username: 'carol', avatar: null, bio: null } } as any,
    ])

    const result = await followService.getFollowers('user-1')
    expect(result).toHaveLength(1)
    expect(result[0].username).toBe('carol')
  })

  it('returns list of following', async () => {
    vi.mocked(prisma.follow.findMany).mockResolvedValue([
      { following: { id: 'user-2', username: 'bob', avatar: null, bio: null } } as any,
    ])

    const result = await followService.getFollowing('user-1')
    expect(result).toHaveLength(1)
    expect(result[0].username).toBe('bob')
  })
})
