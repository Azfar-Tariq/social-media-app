import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { desc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { serializeComment } from "@/lib/serializers";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { postId, content } = await request.json();

  if (!postId || !content?.trim()) {
    return NextResponse.json(
      { error: "Post ID and content are required" },
      { status: 400 }
    );
  }

  try {
    const [comment] = await db
      .insert(comments)
      .values({
        postId,
        authorId: session.user.id,
        content: content.trim(),
      })
      .returning({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        authorId: comments.authorId,
      });

    const [author] = await db
      .select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, comment.authorId))
      .limit(1);

    return NextResponse.json(
      serializeComment({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: author ?? { name: session.user.name ?? null, image: session.user.image ?? null },
      })
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    const rows = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return NextResponse.json(
      rows.map((row) =>
        serializeComment({
          id: row.id,
          content: row.content,
          createdAt: row.createdAt,
          author: { name: row.authorName, image: row.authorImage },
        })
      )
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
