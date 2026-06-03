import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../src/app'
import { createTestPrisma, cleanDatabase, signTestToken, createTestUser } from '../helpers'

const prisma = createTestPrisma()
let token: string
let userId: string

beforeAll(async () => {
  await cleanDatabase(prisma)
  const user = await createTestUser(prisma, { username: 'tweetuser', email: 'tweet@test.com' })
  userId = user.id
  token = await signTestToken(userId)
})

afterAll(async () => {
  await cleanDatabase(prisma)
  await prisma.$disconnect()
})

beforeEach(async () => {
  await prisma.like.deleteMany()
  await prisma.tweet.deleteMany()
})

describe('POST /api/tweets', () => {
  it('creates a tweet when authenticated', async () => {
    const res = await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'My first tweet' })

    expect(res.status).toBe(201)
    expect(res.body.tweet.content).toBe('My first tweet')
    expect(res.body.tweet.author.username).toBe('tweetuser')
  })

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/tweets').send({ content: 'No auth' })
    expect(res.status).toBe(401)
  })

  it('returns 400 when content is empty', async () => {
    const res = await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when content exceeds 280 chars', async () => {
    const res = await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'a'.repeat(281) })

    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/tweets/:id', () => {
  it('deletes own tweet', async () => {
    const created = await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'To be deleted' })

    const res = await request(app)
      .delete(`/api/tweets/${created.body.tweet.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })

  it('returns 403 when deleting another user tweet', async () => {
    const other = await createTestUser(prisma, { username: 'other_tw', email: 'other_tw@test.com' })
    const otherToken = await signTestToken(other.id)

    const created = await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Mine' })

    const res = await request(app)
      .delete(`/api/tweets/${created.body.tweet.id}`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(res.status).toBe(403)
  })
})

describe('GET /api/tweets/:id', () => {
  it('returns tweet by id', async () => {
    const created = await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Get me' })

    const res = await request(app)
      .get(`/api/tweets/${created.body.tweet.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.tweet.content).toBe('Get me')
  })

  it('returns 404 for non-existent tweet', async () => {
    const res = await request(app)
      .get('/api/tweets/nonexistent-id')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
