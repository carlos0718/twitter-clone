import { SignJWT } from 'jose'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-dev-secret')

export function createTestPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export async function signTestToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getSecret())
}

export async function createTestUser(
  prisma: PrismaClient,
  overrides: { username?: string; email?: string; password?: string } = {}
) {
  const passwordHash = await bcrypt.hash(overrides.password ?? 'password123', 10)
  return prisma.user.create({
    data: {
      username: overrides.username ?? `user_${Date.now()}`,
      email: overrides.email ?? `user_${Date.now()}@test.com`,
      passwordHash,
    },
  })
}

export async function cleanDatabase(prisma: PrismaClient) {
  await prisma.like.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.tweet.deleteMany()
  await prisma.user.deleteMany()
}
