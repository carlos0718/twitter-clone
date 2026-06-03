import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../src/app'
import { createTestPrisma, cleanDatabase } from '../helpers'

const prisma = createTestPrisma()

beforeAll(async () => {
  await cleanDatabase(prisma)
})

afterAll(async () => {
  await cleanDatabase(prisma)
  await prisma.$disconnect()
})

beforeEach(async () => {
  await cleanDatabase(prisma)
})

describe('POST /api/auth/register', () => {
  it('registers a new user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('new@example.com')
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it('returns 400 on missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'test@test.com' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
  })

  it('returns 409 when email is already taken', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'first',
      email: 'dup@example.com',
      password: 'password123',
    })

    const res = await request(app).post('/api/auth/register').send({
      username: 'second',
      email: 'dup@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('EMAIL_TAKEN')
  })

  it('returns 409 when username is already taken', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'taken',
      email: 'first@example.com',
      password: 'password123',
    })

    const res = await request(app).post('/api/auth/register').send({
      username: 'taken',
      email: 'second@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('USERNAME_TAKEN')
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      username: 'loginuser',
      email: 'login@example.com',
      password: 'password123',
    })
  })

  it('logs in with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('login@example.com')
  })

  it('returns 401 with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('INVALID_CREDENTIALS')
  })

  it('returns 401 for non-existent user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('returns authenticated user', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      username: 'meuser',
      email: 'me@example.com',
      password: 'password123',
    })

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('me@example.com')
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
    expect(res.status).toBe(401)
  })
})
