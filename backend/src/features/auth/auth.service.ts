import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from '../../shared/utils/prisma'
import type { RegisterInput, LoginInput, SafeUser } from './auth.types'
import type { User } from '../../generated/prisma/client'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-dev-secret')

export async function register(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
  })

  if (existing) {
    const code = existing.email === input.email ? 'EMAIL_TAKEN' : 'USERNAME_TAKEN'
    throw Object.assign(new Error(code), { statusCode: 409 })
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({
    data: { email: input.email, username: input.username, passwordHash },
  })

  const token = await signToken(user.id)
  return { user: sanitize(user), token }
}

export async function login(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false

  if (!user || !valid) {
    throw Object.assign(new Error('INVALID_CREDENTIALS'), { statusCode: 401 })
  }

  const token = await signToken(user.id)
  return { user: sanitize(user), token }
}

export async function getUserById(id: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw Object.assign(new Error('USER_NOT_FOUND'), { statusCode: 404 })
  return sanitize(user)
}

export async function verifyToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload.sub as string
}

async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '7d')
    .sign(getSecret())
}

function sanitize(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...safe } = user
  return safe
}
