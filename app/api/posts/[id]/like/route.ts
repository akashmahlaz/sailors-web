import { NextResponse } from "next/server";
import { getPostsCollection } from "@/lib/mongodb-server";
import { ObjectId } from "mongodb";

// POST /api/posts/[id]/like
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const collection = await getPostsCollection();
  const { id: postId } = await params;
  await collection.updateOne({ _id: new ObjectId(postId) }, { $inc: { likes: 1 } });
  return NextResponse.json({ success: true });
}
