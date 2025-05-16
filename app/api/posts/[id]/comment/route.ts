import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb-server";
import { ObjectId } from "mongodb";

// POST /api/posts/[id]/comment
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const client = await getMongoClient();
  const db = client.db();
  const postId = params.id;
  const body = await req.json();
  const comment = {
    content: body.content,
    author: body.author || { name: "Anonymous", avatar: "/placeholder-user.jpg" },
    createdAt: new Date(),
  };
  // Store the comment in a comments array in the post document and increment the count
  await db.collection("posts").updateOne(
    { _id: new ObjectId(postId) },
    { $push: { commentsList: comment }, $inc: { comments: 1 } }
  );
  return NextResponse.json({ success: true, comment });
}
