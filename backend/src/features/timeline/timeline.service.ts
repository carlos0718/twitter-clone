import { prisma } from '../../shared/utils/prisma'
import type { TweetWithAuthor } from '../tweets/tweet.types'

export async function getTimeline(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ tweets: TweetWithAuthor[]; total: number; page: number; limit: number }> {
  const skip = (page - 1) * limit

  const followingIds = await prisma.follow
    .findMany({ where: { followerId: userId }, select: { followingId: true } })
    .then((rows) => rows.map((r) => r.followingId))

  if (followingIds.length === 0) {
    return { tweets: [], total: 0, page, limit }
  }

  const [tweets, total] = await Promise.all([
    prisma.tweet.findMany({
      where: { authorId: { in: followingIds } },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true } },
        likes: { where: { userId } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.tweet.count({ where: { authorId: { in: followingIds } } }),
  ])

  return {
    tweets: tweets.map((t) => ({
      id: t.id,
      content: t.content,
      authorId: t.authorId,
      createdAt: t.createdAt,
      author: t.author,
      likesCount: t._count.likes,
      isLiked: t.likes.length > 0,
    })),
    total,
    page,
    limit,
  }
}
