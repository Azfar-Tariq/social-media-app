import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { serializePost } from "@/lib/serializers";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const [row] = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        mediaType: posts.mediaType,
        mediaUrl: posts.mediaUrl,
        mediaThumbnail: posts.mediaThumbnail,
        authorId: users.id,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(
      serializePost({
        id: row.id,
        content: row.content,
        createdAt: row.createdAt,
        mediaType: row.mediaType,
        mediaUrl: row.mediaUrl,
        mediaThumbnail: row.mediaThumbnail,
        author: {
          id: row.authorId,
          name: row.authorName,
          image: row.authorImage,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
