import { prisma } from '../../shared/utils/prisma'

export async function searchUsers(query: string, requesterId?: string) {
  if (!query.trim()) return []

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, username: true, avatar: true, bio: true },
    take: 20,
  })

  if (!requesterId) return users.map((u) => ({ ...u, isFollowing: false }))

  const followingIds = await prisma.follow
    .findMany({ where: { followerId: requesterId, followingId: { in: users.map((u) => u.id) } }, select: { followingId: true } })
    .then((rows) => new Set(rows.map((r) => r.followingId)))

  return users.map((u) => ({ ...u, isFollowing: followingIds.has(u.id) }))
}
