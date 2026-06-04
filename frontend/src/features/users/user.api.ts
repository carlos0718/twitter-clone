import { api } from '@/lib/api'
import type { Tweet } from '@/features/tweets/tweet.types'

export interface UserProfile {
  id: string
  username: string
  bio: string | null
  avatar: string | null
  createdAt: string
  tweetsCount: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
  tweets: Tweet[]
}

export async function getUserProfile(username: string): Promise<UserProfile> {
  const res = await api.get<{ profile: UserProfile }>(`/users/${username}`)
  return res.data.profile
}

export async function updateProfile(data: { bio?: string; avatar?: string }): Promise<void> {
  await api.put('/users/me', data)
}

export interface FollowUser {
  id: string
  username: string
  avatar: string | null
  bio: string | null
}

export async function getFollowers(userId: string): Promise<FollowUser[]> {
  const res = await api.get<{ followers: FollowUser[] }>(`/follows/${userId}/followers`)
  return res.data.followers
}

export async function getFollowing(userId: string): Promise<FollowUser[]> {
  const res = await api.get<{ following: FollowUser[] }>(`/follows/${userId}/following`)
  return res.data.following
}

export async function followUser(userId: string): Promise<void> {
  await api.post(`/follows/${userId}`)
}

export async function unfollowUser(userId: string): Promise<void> {
  await api.delete(`/follows/${userId}`)
}
