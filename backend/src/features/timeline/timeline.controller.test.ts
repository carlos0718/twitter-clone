import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import { getTimelineHandler } from './timeline.controller'
import type { AuthRequest } from '../../shared/types'

vi.mock('./timeline.service', () => ({
  getTimeline: vi.fn(),
}))

import * as timelineService from './timeline.service'

function mockRes() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response
  vi.mocked(res.status).mockReturnValue(res)
  return res
}

beforeEach(() => vi.clearAllMocks())

describe('getTimelineHandler - error branch', () => {
  it('returns 500 on unexpected error', async () => {
    vi.mocked(timelineService.getTimeline).mockRejectedValue(new Error('fail'))
    const req = { userId: 'u1', query: {} } as unknown as AuthRequest
    const res = mockRes()
    await getTimelineHandler(req, res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})
