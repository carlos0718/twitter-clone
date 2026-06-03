import { prisma } from '../../shared/utils/prisma'

export async function likeTweet(userId: string, tweetId: string): Promise<void> {
  const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } })
  if (!tweet) throw Object.assign(new Error('TWEET_NOT_FOUND'), { statusCode: 404 })

  const existing = await prisma.like.findUnique({
    where: { userId_tweetId: { userId, tweetId } },
  })
  if (existing) throw Object.assign(new Error('ALREADY_LIKED'), { statusCode: 409 })

  await prisma.like.create({ data: { userId, tweetId } })
}

export async function unlikeTweet(userId: string, tweetId: string): Promise<void> {
  const existing = await prisma.like.findUnique({
    where: { userId_tweetId: { userId, tweetId } },
  })
  if (!existing) throw Object.assign(new Error('NOT_LIKED'), { statusCode: 404 })
  await prisma.like.delete({ where: { userId_tweetId: { userId, tweetId } } })
}
