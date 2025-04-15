import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const mediaFile = formData.get("media") as File | null;

    let mediaUrl = null;
    if (mediaFile) {
      const bytes = await mediaFile.arrayBuffer();
      const buffer = new Uint8Array(bytes);

      // Create a unique filename
      const timestamp = Date.now();
      const extension = mediaFile.name.split(".").pop();
      const filename = `${timestamp}.${extension}`;

      // Save the file to the public/uploads directory
      const uploadDir = join(process.cwd(), "public", "uploads");
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);

      // Determine media type
      const isImage = mediaFile.type.startsWith("image/");

      mediaUrl = {
        type: isImage ? "image" : "video",
        url: `/uploads/${filename}`,
      };
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("posts").insertOne({
      content,
      authorId: new ObjectId(session.user.id),
      createdAt: new Date(),
      media: mediaUrl,
    });

    return NextResponse.json({ id: result.insertedId });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
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
          media: 1,
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
