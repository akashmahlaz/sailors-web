import { NextResponse } from "next/server";
import { getPostsCollection } from "@/lib/mongodb-server";
import { ObjectId } from "mongodb";

// GET /api/posts - fetch all posts
export async function GET() {
  const collection = await getPostsCollection();
  const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();
  // Format posts for client
  const formattedPosts = posts.map(post => ({
    ...post,
    id: post._id.toString(),
    _id: undefined,
    createdAt: post.createdAt?.toISOString(),
  }));
  return NextResponse.json(formattedPosts);
}

// POST /api/posts - create a new post
export async function POST(req: Request) {
  const collection = await getPostsCollection();
  const body = await req.json();

  // Try to get user info from the request (if using authentication)
  let author = body.author;
  // If you use NextAuth or similar, you can get the user from the session here
  // For now, fallback to name and avatar from body, else use Anonymous
  if (!author) {
    author = {
      name: body.name || body.username || "Anonymous",
      avatar: body.avatar || "/placeholder-user.jpg",
      role: body.role || "Member",
    };
  }

  const post = {
    title: body.title,
    content: body.content,
    author,
    tags: body.tags || ["General"],
    likes: 0,
    upvotes: 0,
    comments: 0,
    commentsList: [],
    createdAt: new Date(),
  };
  const result = await collection.insertOne(post);
  return NextResponse.json({ ...post, id: result.insertedId.toString() });
}
