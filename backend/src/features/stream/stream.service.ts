import type { Response } from 'express'

type Client = { userId: string; res: Response }

const clients: Client[] = []

export function addClient(userId: string, res: Response) {
  clients.push({ userId, res })
}

export function removeClient(res: Response) {
  const idx = clients.findIndex((c) => c.res === res)
  if (idx !== -1) clients.splice(idx, 1)
}

export function notifyFollowers(authorId: string, payload: object) {
  const data = JSON.stringify(payload)
  clients.forEach((c) => {
    if (c.userId !== authorId) {
      c.res.write(`data: ${data}\n\n`)
    }
  })
}
