import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { postId } = await request.json();

  const client = await clientPromise;
  const db = client.db();

  const existingLike = await db.collection("likes").findOne({
    postId: new ObjectId(postId),
    userId: new ObjectId(session.user.id),
  });

  if (existingLike) {
    await db.collection("likes").deleteOne({
      _id: existingLike._id,
    });
  } else {
    await db.collection("likes").insertOne({
      postId: new ObjectId(postId),
      userId: new ObjectId(session.user.id),
      createdAt: new Date(),
    });
  }

  const likes = await db.collection("likes").countDocuments({
    postId: new ObjectId(postId),
  });

  return NextResponse.json({ likes });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const likes = await db.collection("likes").countDocuments({
    postId: new ObjectId(postId),
  });

  let userLiked = false;
  if (session) {
    const userLike = await db.collection("likes").findOne({
      postId: new ObjectId(postId),
      userId: new ObjectId(session.user.id),
    });
    userLiked = !!userLike;
  }

  return NextResponse.json({ likes, userLiked });
}
