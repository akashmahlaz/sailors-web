import { getUserProfilesCollection, getFollowsCollection } from "./mongodb"
import { ObjectId } from "mongodb"

export interface UserProfile {
  _id?: string | ObjectId
  userId: string
  name: string
  email: string
  bio?: string
  location?: string
  profileImage?: string
  coverImage?: string
  role?: string
  joinedAt: Date
  updatedAt: Date
  socialLinks?: {
    website?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    github?: string
  }
  following?: string[]
  followers?: string[]
  interests?: string[]
  expertise?: string[]
}

export async function getUserProfileByUserId(userId: string) {
  const collection = await getUserProfilesCollection()
  return collection.findOne({ userId })
}

export async function getUserProfileById(id: string) {
  const collection = await getUserProfilesCollection()
  return collection.findOne({ _id: new ObjectId(id) })
}

export async function createUserProfile(profile: UserProfile) {
  const collection = await getUserProfilesCollection()
  const result = await collection.insertOne({
    ...profile,
    joinedAt: new Date(),
    updatedAt: new Date(),
    following: [],
    followers: [],
  })
  return result
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const collection = await getUserProfilesCollection()
  const result = await collection.updateOne(
    { userId },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
  )
  return result
}

export async function followUser(followerId: string, followingId: string) {
  const followsCollection = await getFollowsCollection()
  const profilesCollection = await getUserProfilesCollection()

  // Check if already following
  const existingFollow = await followsCollection.findOne({
    followerId,
    followingId,
  })

  if (existingFollow) {
    return { success: false, message: "Already following this user" }
  }

  // Create follow relationship
  await followsCollection.insertOne({
    followerId,
    followingId,
    createdAt: new Date(),
  })

  // Update follower count for the user being followed
  await profilesCollection.updateOne({ userId: followingId }, { $addToSet: { followers: followerId } })

  // Update following count for the follower
  await profilesCollection.updateOne({ userId: followerId }, { $addToSet: { following: followingId } })

  return { success: true }
}

export async function unfollowUser(followerId: string, followingId: string) {
  const followsCollection = await getFollowsCollection()
  const profilesCollection = await getUserProfilesCollection()

  // Remove follow relationship
  await followsCollection.deleteOne({
    followerId,
    followingId,
  })

  // Update follower count for the user being unfollowed
  await profilesCollection.updateOne({ userId: followingId }, { $pull: { followers: followerId } })

  // Update following count for the follower
  await profilesCollection.updateOne({ userId: followerId }, { $pull: { following: followingId } })

  return { success: true }
}

export async function getFollowers(userId: string) {
  const followsCollection = await getFollowsCollection()
  const profilesCollection = await getUserProfilesCollection()

  const follows = await followsCollection.find({ followingId: userId }).toArray()
  const followerIds = follows.map((follow) => follow.followerId)

  if (followerIds.length === 0) return []

  const followers = await profilesCollection.find({ userId: { $in: followerIds } }).toArray()
  return followers
}

export async function getFollowing(userId: string) {
  const followsCollection = await getFollowsCollection()
  const profilesCollection = await getUserProfilesCollection()

  const follows = await followsCollection.find({ followerId: userId }).toArray()
  const followingIds = follows.map((follow) => follow.followingId)

  if (followingIds.length === 0) return []

  const following = await profilesCollection.find({ userId: { $in: followingIds } }).toArray()
  return following
}

export async function isFollowing(followerId: string, followingId: string) {
  const followsCollection = await getFollowsCollection()

  const follow = await followsCollection.findOne({
    followerId,
    followingId,
  })

  return !!follow
}

export async function getUserProfile(userId: string) {
  const collection = await getUserProfilesCollection()
  return collection.findOne({ userId })
}

export async function checkContentOwnership(userId: string, contentType: string, contentId: string) {
  const collection = await getCollection(contentType)
  const content = await collection.findOne({ 
    _id: new ObjectId(contentId),
    userId: userId 
  })
  return !!content
}

async function getCollection(contentType: string) {
  switch (contentType) {
    case 'videos':
      return await getVideosCollection()
    case 'photos':
      return await getPhotosCollection()
    case 'audio':
      return await getAudioCollection()
    case 'blogs':
      return await getBlogsCollection()
    case 'podcasts':
      return await getPodcastsCollection()
    case 'news':
      return await getNewsCollection()
    default:
      throw new Error(`Invalid content type: ${contentType}`)
  }
}
