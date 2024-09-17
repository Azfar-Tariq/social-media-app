import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = await clientPromise;
  const db = client.db();

  const post = await db
    .collection("posts")
    .aggregate([
      { $match: { _id: new ObjectId(params.id) } },
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
    .next();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
