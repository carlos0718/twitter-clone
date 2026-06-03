import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../src/app'
import { createTestPrisma, cleanDatabase, signTestToken, createTestUser } from '../helpers'

const prisma = createTestPrisma()
let token: string
let userId: string

beforeAll(async () => {
  await cleanDatabase(prisma)
  const user = await createTestUser(prisma, { username: 'profileuser', email: 'profile@test.com' })
  userId = user.id
  token = await signTestToken(userId)
})

afterAll(async () => {
  await cleanDatabase(prisma)
  await prisma.$disconnect()
})

describe('GET /api/users/:username', () => {
  it('returns user profile with tweet count and tweets', async () => {
    await prisma.tweet.create({ data: { content: 'Profile tweet', authorId: userId } })

    const res = await request(app)
      .get('/api/users/profileuser')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.profile.username).toBe('profileuser')
    expect(res.body.profile.tweetsCount).toBe(1)
    expect(res.body.profile.tweets).toHaveLength(1)
    expect(res.body.profile.passwordHash).toBeUndefined()
  })

  it('returns 404 for non-existent user', async () => {
    const res = await request(app)
      .get('/api/users/ghostuser')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

describe('PUT /api/users/me', () => {
  it('updates bio and avatar', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Updated bio', avatar: 'https://example.com/avatar.png' })

    expect(res.status).toBe(200)
    expect(res.body.user.bio).toBe('Updated bio')
  })

  it('returns 400 when avatar is not a valid URL', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatar: 'not-a-url' })

    expect(res.status).toBe(400)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/users/me').send({ bio: 'Test' })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/search/users', () => {
  it('finds users by username', async () => {
    const res = await request(app)
      .get('/api/search/users?q=profileuser')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.users.length).toBeGreaterThan(0)
    expect(res.body.users[0].username).toBe('profileuser')
  })

  it('returns empty array for no matches', async () => {
    const res = await request(app)
      .get('/api/search/users?q=zzznomatch')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.users).toHaveLength(0)
  })

  it('returns empty array for empty query', async () => {
    const res = await request(app)
      .get('/api/search/users?q=')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.users).toHaveLength(0)
  })
})
