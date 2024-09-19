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

  const { postId, content } = await request.json();

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection("comments").insertOne({
    postId: new ObjectId(postId),
    authorId: new ObjectId(session.user.id),
    content,
    createdAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const comments = await db
    .collection("comments")
    .aggregate([
      { $match: { postId: new ObjectId(postId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          author: {
            name: 1,
            image: 1,
          },
        },
      },
    ])
    .toArray();

  return NextResponse.json(comments);
}
