import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from './features/auth/auth.routes'
import tweetRoutes from './features/tweets/tweet.routes'
import timelineRoutes from './features/timeline/timeline.routes'
import followRoutes from './features/follows/follow.routes'
import likeRoutes from './features/likes/like.routes'
import userRoutes from './features/users/user.routes'
import searchRoutes from './features/search/search.routes'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/tweets', tweetRoutes)
app.use('/api/timeline', timelineRoutes)
app.use('/api/follows', followRoutes)
app.use('/api/likes', likeRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRoutes)

export default app
