import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { content } = await request.json();

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection("posts").insertOne({
    content,
    authorId: new ObjectId(session.user.id),
    createdAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId });
}

export async function GET() {
  const client = await clientPromise;
  const db = client.db();

  const posts = await db
    .collection("posts")
    .aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
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

  return NextResponse.json(posts);
}
