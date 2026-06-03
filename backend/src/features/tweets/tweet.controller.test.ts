import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import { createTweetHandler } from './tweet.controller'
import type { AuthRequest } from '../../shared/types'

vi.mock('./tweet.service', () => ({
  createTweet: vi.fn(),
}))

import * as tweetService from './tweet.service'

function mockRes() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response
  vi.mocked(res.status).mockReturnValue(res)
  return res
}

beforeEach(() => vi.clearAllMocks())

describe('createTweetHandler - error branch', () => {
  it('returns 500 when service throws without statusCode', async () => {
    vi.mocked(tweetService.createTweet).mockRejectedValue(new Error('DB error'))
    const req = { userId: 'u1', body: { content: 'hello' } } as AuthRequest
    const res = mockRes()
    await createTweetHandler(req, res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})
