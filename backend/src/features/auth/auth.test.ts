import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authService from './auth.service'

vi.mock('../../shared/utils/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}))

import { prisma } from '../../shared/utils/prisma'
import bcrypt from 'bcryptjs'

const mockUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: 'hashed_password',
  bio: null,
  avatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('auth.service - register', () => {
  it('registers a new user and returns token', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser)

    const result = await authService.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    })

    expect(result.user.email).toBe('test@example.com')
    expect(result.token).toBeDefined()
    expect((result.user as any).passwordHash).toBeUndefined()
  })

  it('throws 409 when email is already taken', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ ...mockUser, email: 'test@example.com' })

    await expect(
      authService.register({ username: 'other', email: 'test@example.com', password: 'pass' })
    ).rejects.toMatchObject({ message: 'EMAIL_TAKEN', statusCode: 409 })
  })

  it('throws 409 when username is already taken', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ ...mockUser, email: 'other@example.com' })

    await expect(
      authService.register({ username: 'testuser', email: 'new@example.com', password: 'pass' })
    ).rejects.toMatchObject({ message: 'USERNAME_TAKEN', statusCode: 409 })
  })
})

describe('auth.service - login', () => {
  it('returns user and token on valid credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    const result = await authService.login({ email: 'test@example.com', password: 'password123' })

    expect(result.user.email).toBe('test@example.com')
    expect(result.token).toBeDefined()
  })

  it('throws 401 when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    await expect(
      authService.login({ email: 'noone@example.com', password: 'pass' })
    ).rejects.toMatchObject({ message: 'INVALID_CREDENTIALS', statusCode: 401 })
  })

  it('throws 401 when password is wrong', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    await expect(
      authService.login({ email: 'test@example.com', password: 'wrongpass' })
    ).rejects.toMatchObject({ message: 'INVALID_CREDENTIALS', statusCode: 401 })
  })
})

describe('auth.service - verifyToken', () => {
  it('verifies a token generated during register', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser)

    const { token } = await authService.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    })

    const userId = await authService.verifyToken(token)
    expect(userId).toBe('user-1')
  })

  it('throws on invalid token', async () => {
    await expect(authService.verifyToken('invalid.token.here')).rejects.toThrow()
  })
})
