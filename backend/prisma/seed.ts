import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const users = [
  { username: 'alice', email: 'alice@example.com', bio: 'Frontend dev & coffee addict ☕' },
  { username: 'bob', email: 'bob@example.com', bio: 'Backend engineer. Go, Rust, TypeScript.' },
  { username: 'carol', email: 'carol@example.com', bio: 'UX designer turned developer 🎨' },
  { username: 'david', email: 'david@example.com', bio: 'Open source contributor. Linux enthusiast.' },
  { username: 'eve', email: 'eve@example.com', bio: 'Security researcher 🔐' },
  { username: 'frank', email: 'frank@example.com', bio: 'DevOps / SRE. K8s all the things.' },
  { username: 'grace', email: 'grace@example.com', bio: 'ML engineer. Turning data into magic.' },
  { username: 'henry', email: 'henry@example.com', bio: 'Indie hacker building in public 🚀' },
  { username: 'iris', email: 'iris@example.com', bio: 'Product manager obsessed with user research.' },
  { username: 'jack', email: 'jack@example.com', bio: 'Full-stack dev. TypeScript everywhere.' },
]

const tweetContents = [
  'Just shipped a new feature! The diff is surprisingly small — love when refactoring pays off.',
  'Hot take: good variable names are more valuable than comments.',
  "Been using TanStack Query for server state and I'm never going back. Cache invalidation done right.",
  'TypeScript strict mode: 0 anys, 0 regrets. Takes time to set up but the tooling payoff is huge.',
  'The best code review comment is a question, not a declaration.',
  'Learning Rust after 10 years of TypeScript. My brain hurts in the best possible way.',
  'Reminder: sleep matters more than that extra hour of coding. Your future self will thank you.',
  'Database indexes: the single most impactful optimization most devs forget until it hurts.',
  "Spent 2 hours debugging a race condition. It was a missing `await`. Always is.",
  "PostgreSQL row-level security is underrated. Your app's auth layer doesn't belong in the ORM.",
  "Trunk-based development changed how our team works. No more long-lived feature branches.",
  'Open source maintainers are underpaid and underappreciated. Support the projects you rely on.',
  'CSS Grid + Flexbox cover 95% of layouts. Stop reaching for a UI framework on the first day.',
  'The most important skill in software: writing a clear bug report.',
  "Just read the Postgres docs on EXPLAIN ANALYZE. My queries are 10x faster now. RTFM, friends.",
  "If you haven't tried Zod for runtime validation, you're missing out.",
  'Code that works in prod > code that looks perfect in review.',
  "The second-system effect is real. Keep your rewrites smaller than you think.",
  'Monitoring and alerting are features, not afterthoughts.',
  'Write boring code. Clever code is a liability.',
]

async function main() {
  console.log('Seeding database...')

  await prisma.like.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.tweet.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 12)

  const createdUsers = await Promise.all(
    users.map((u) => prisma.user.create({ data: { ...u, passwordHash } }))
  )

  const createdTweets = await Promise.all(
    tweetContents.map((content, i) =>
      prisma.tweet.create({
        data: { content, authorId: createdUsers[i % createdUsers.length].id },
      })
    )
  )

  const followPairs: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [1, 0], [1, 4], [1, 5],
    [2, 0], [2, 6], [3, 7], [4, 0], [4, 8], [5, 9],
    [6, 1], [7, 2], [8, 3], [9, 4], [0, 9], [1, 8],
  ]

  for (const [fi, gi] of followPairs) {
    await prisma.follow.create({
      data: { followerId: createdUsers[fi].id, followingId: createdUsers[gi].id },
    })
  }

  const likePairs: [number, number][] = [
    [0, 1], [0, 5], [1, 0], [1, 3], [2, 2], [2, 7],
    [3, 1], [4, 4], [5, 6], [6, 0], [7, 8], [8, 9],
    [9, 2], [0, 10], [1, 12], [2, 15], [3, 18],
  ]

  for (const [ui, ti] of likePairs) {
    await prisma.like
      .create({
        data: {
          userId: createdUsers[ui % createdUsers.length].id,
          tweetId: createdTweets[ti % createdTweets.length].id,
        },
      })
      .catch(() => {})
  }

  console.log(`✓ ${createdUsers.length} users, ${createdTweets.length} tweets, ${followPairs.length} follows`)
  console.log('Credentials: alice@example.com / password123 (same password for all users)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
