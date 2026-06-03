export interface TweetAuthor {
  id: string
  username: string
  avatar: string | null
}

export interface Tweet {
  id: string
  content: string
  authorId: string
  createdAt: string
  author: TweetAuthor
  likesCount: number
  isLiked?: boolean
}
