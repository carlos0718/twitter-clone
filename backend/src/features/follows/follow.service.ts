import { prisma } from '../../shared/utils/prisma'

export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) {
    throw Object.assign(new Error('CANNOT_FOLLOW_SELF'), { statusCode: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: followingId } })
  if (!target) throw Object.assign(new Error('USER_NOT_FOUND'), { statusCode: 404 })

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })
  if (existing) throw Object.assign(new Error('ALREADY_FOLLOWING'), { statusCode: 409 })

  await prisma.follow.create({ data: { followerId, followingId } })
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })
  if (!existing) throw Object.assign(new Error('NOT_FOLLOWING'), { statusCode: 404 })
  await prisma.follow.delete({ where: { followerId_followingId: { followerId, followingId } } })
}

export async function getFollowers(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: { follower: { select: { id: true, username: true, avatar: true, bio: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return follows.map((f) => f.follower)
}

export async function getFollowing(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: { select: { id: true, username: true, avatar: true, bio: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return follows.map((f) => f.following)
}
