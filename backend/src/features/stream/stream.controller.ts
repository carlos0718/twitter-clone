import type { Response } from 'express'
import type { AuthRequest } from '../../shared/types'
import { addClient, removeClient } from './stream.service'

export function streamHandler(req: AuthRequest, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  res.write('data: {"type":"connected"}\n\n')

  addClient(req.userId, res)

  req.on('close', () => removeClient(res))
}
