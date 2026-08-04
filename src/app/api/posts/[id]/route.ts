import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { desc, eq, sql } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { posts, users, likes, comments } from "@/db/schema";
import { serializePost, serializeComment } from "@/lib/serializers";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? "";

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
        likesCount: sql<number>`(SELECT COUNT(*)::int FROM ${likes} WHERE ${likes.postId} = ${posts.id})`,
        userLiked: sql<boolean>`EXISTS(SELECT 1 FROM ${likes} WHERE ${likes.postId} = ${posts.id} AND ${likes.userId} = ${currentUserId})`,
        commentsCount: sql<number>`(SELECT COUNT(*)::int FROM ${comments} WHERE ${comments.postId} = ${posts.id})`,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const commentRows = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, id))
      .orderBy(desc(comments.createdAt));

    const serializedPost = serializePost({
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
      likesCount: row.likesCount,
      userLiked: row.userLiked,
      commentsCount: row.commentsCount,
    });

    const serializedComments = commentRows.map((c) =>
      serializeComment({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: { name: c.authorName, image: c.authorImage },
      })
    );

    return NextResponse.json({
      post: serializedPost,
      comments: serializedComments,
    });
  } catch (error) {
    console.error("Error fetching post details:", error);
    return NextResponse.json(
      { error: "Failed to fetch post details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = params;

  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  try {
    const [post] = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You are not the author of this post" },
        { status: 403 }
      );
    }

    await db.delete(posts).where(eq(posts.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
