import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../src/app'
import { createTestPrisma, cleanDatabase, signTestToken, createTestUser } from '../helpers'

const prisma = createTestPrisma()
let tokenA: string, tokenB: string
let userA: { id: string }, userB: { id: string }

beforeAll(async () => {
  await cleanDatabase(prisma)
  userA = await createTestUser(prisma, { username: 'social_a', email: 'social_a@test.com' })
  userB = await createTestUser(prisma, { username: 'social_b', email: 'social_b@test.com' })
  tokenA = await signTestToken(userA.id)
  tokenB = await signTestToken(userB.id)
})

afterAll(async () => {
  await cleanDatabase(prisma)
  await prisma.$disconnect()
})

beforeEach(async () => {
  await prisma.like.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.tweet.deleteMany()
})

describe('POST /api/follows/:userId', () => {
  it('follows another user', async () => {
    const res = await request(app)
      .post(`/api/follows/${userB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(201)
  })

  it('returns 400 when trying to follow self', async () => {
    const res = await request(app)
      .post(`/api/follows/${userA.id}`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(400)
  })

  it('returns 409 when already following', async () => {
    await request(app).post(`/api/follows/${userB.id}`).set('Authorization', `Bearer ${tokenA}`)
    const res = await request(app)
      .post(`/api/follows/${userB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(409)
  })
})

describe('DELETE /api/follows/:userId', () => {
  it('unfollows a user', async () => {
    await request(app).post(`/api/follows/${userB.id}`).set('Authorization', `Bearer ${tokenA}`)

    const res = await request(app)
      .delete(`/api/follows/${userB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(204)
  })

  it('returns 404 when not following', async () => {
    const res = await request(app)
      .delete(`/api/follows/${userB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(404)
  })
})

describe('POST /api/likes/:tweetId', () => {
  it('likes a tweet', async () => {
    const tweet = await prisma.tweet.create({ data: { content: 'Test tweet', authorId: userB.id } })

    const res = await request(app)
      .post(`/api/likes/${tweet.id}`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(201)
  })

  it('returns 409 when already liked', async () => {
    const tweet = await prisma.tweet.create({ data: { content: 'Test tweet', authorId: userB.id } })
    await request(app).post(`/api/likes/${tweet.id}`).set('Authorization', `Bearer ${tokenA}`)

    const res = await request(app)
      .post(`/api/likes/${tweet.id}`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(409)
  })
})

describe('DELETE /api/likes/:tweetId', () => {
  it('unlikes a tweet', async () => {
    const tweet = await prisma.tweet.create({ data: { content: 'Test tweet', authorId: userB.id } })
    await request(app).post(`/api/likes/${tweet.id}`).set('Authorization', `Bearer ${tokenA}`)

    const res = await request(app)
      .delete(`/api/likes/${tweet.id}`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(204)
  })
})

describe('GET /api/follows/:userId/followers', () => {
  it('returns followers list', async () => {
    await request(app).post(`/api/follows/${userB.id}`).set('Authorization', `Bearer ${tokenA}`)

    const res = await request(app)
      .get(`/api/follows/${userB.id}/followers`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(200)
    expect(res.body.followers).toBeDefined()
    expect(res.body.followers.some((f: any) => f.id === userA.id)).toBe(true)
  })

  it('returns following list', async () => {
    await request(app).post(`/api/follows/${userB.id}`).set('Authorization', `Bearer ${tokenA}`)

    const res = await request(app)
      .get(`/api/follows/${userA.id}/following`)
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(200)
    expect(res.body.following).toBeDefined()
    expect(res.body.following.some((f: any) => f.id === userB.id)).toBe(true)
  })
})

describe('GET /api/timeline', () => {
  it('returns empty timeline when not following anyone', async () => {
    const res = await request(app)
      .get('/api/timeline')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(200)
    expect(res.body.tweets).toHaveLength(0)
  })

  it('returns tweets from followed users', async () => {
    await request(app).post(`/api/follows/${userB.id}`).set('Authorization', `Bearer ${tokenA}`)
    await prisma.tweet.create({ data: { content: 'B tweet 1', authorId: userB.id } })
    await prisma.tweet.create({ data: { content: 'B tweet 2', authorId: userB.id } })

    const res = await request(app)
      .get('/api/timeline')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(200)
    expect(res.body.tweets).toHaveLength(2)
    expect(res.body.total).toBe(2)
  })

  it('supports pagination', async () => {
    await request(app).post(`/api/follows/${userB.id}`).set('Authorization', `Bearer ${tokenA}`)
    for (let i = 0; i < 5; i++) {
      await prisma.tweet.create({ data: { content: `Tweet ${i}`, authorId: userB.id } })
    }

    const res = await request(app)
      .get('/api/timeline?page=1&limit=3')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(200)
    expect(res.body.tweets).toHaveLength(3)
    expect(res.body.total).toBe(5)
  })
})
