import { prisma } from '../../shared/utils/prisma'
import type { CreateTweetInput, TweetWithAuthor } from './tweet.types'

export async function createTweet(userId: string, input: CreateTweetInput): Promise<TweetWithAuthor> {
  const tweet = await prisma.tweet.create({
    data: { content: input.content, authorId: userId },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      _count: { select: { likes: true } },
    },
  })
  return formatTweet(tweet)
}

export async function deleteTweet(userId: string, tweetId: string): Promise<void> {
  const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } })
  if (!tweet) throw Object.assign(new Error('TWEET_NOT_FOUND'), { statusCode: 404 })
  if (tweet.authorId !== userId) throw Object.assign(new Error('FORBIDDEN'), { statusCode: 403 })
  await prisma.tweet.delete({ where: { id: tweetId } })
}

export async function getTweetById(tweetId: string, userId?: string): Promise<TweetWithAuthor> {
  const tweet = await prisma.tweet.findUnique({
    where: { id: tweetId },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      _count: { select: { likes: true } },
      likes: userId ? { where: { userId } } : false,
    },
  })
  if (!tweet) throw Object.assign(new Error('TWEET_NOT_FOUND'), { statusCode: 404 })
  return formatTweet(tweet, userId)
}

function formatTweet(
  tweet: {
    id: string
    content: string
    authorId: string
    createdAt: Date
    author: { id: string; username: string; avatar: string | null }
    _count: { likes: number }
    likes?: { userId: string }[]
  },
  userId?: string
): TweetWithAuthor {
  return {
    id: tweet.id,
    content: tweet.content,
    authorId: tweet.authorId,
    createdAt: tweet.createdAt,
    author: tweet.author,
    likesCount: tweet._count.likes,
    isLiked: userId ? (tweet.likes?.length ?? 0) > 0 : undefined,
  }
}
