import { prisma } from '../../shared/utils/prisma'
import type { UpdateProfileInput } from './user.types'

export async function getUserProfile(username: string, requesterId?: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { tweets: true, followers: true, following: true } },
      tweets: {
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          _count: { select: { likes: true } },
          likes: requesterId ? { where: { userId: requesterId } } : false,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!user) throw Object.assign(new Error('USER_NOT_FOUND'), { statusCode: 404 })

  const isFollowing = requesterId
    ? !!(await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: requesterId, followingId: user.id } },
      }))
    : false

  const { passwordHash: _ph, ...safeUser } = user
  return {
    ...safeUser,
    tweetsCount: user._count.tweets,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    isFollowing,
    tweets: user.tweets.map((t) => ({
      id: t.id,
      content: t.content,
      authorId: t.authorId,
      createdAt: t.createdAt,
      author: t.author,
      likesCount: t._count.likes,
      isLiked: requesterId ? (t.likes as any[]).length > 0 : undefined,
    })),
  }
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { bio: input.bio, avatar: input.avatar },
  })
  const { passwordHash: _ph, ...safeUser } = user
  return safeUser
}
