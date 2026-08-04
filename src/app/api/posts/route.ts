import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { desc, eq, sql } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { posts, users, likes, comments } from "@/db/schema";
import { uploadMedia } from "@/lib/upload";
import { serializePost } from "@/lib/serializers";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const content = (formData.get("content") as string) ?? "";
    const mediaFile = formData.get("media") as File | null;

    let mediaType: "image" | "video" | null = null;
    let mediaUrl: string | null = null;

    if (mediaFile && mediaFile.size > 0) {
      const uploaded = await uploadMedia(mediaFile, session.user.id);
      mediaType = uploaded.type;
      mediaUrl = uploaded.url;
    }

    const [post] = await db
      .insert(posts)
      .values({
        content,
        authorId: session.user.id,
        mediaType,
        mediaUrl,
      })
      .returning({ id: posts.id });

    return NextResponse.json({ id: post.id });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? "";

  try {
    const rows = await db
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
      .orderBy(desc(posts.createdAt))
      .limit(20);

    return NextResponse.json(
      rows.map((row) =>
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
          likesCount: row.likesCount,
          userLiked: row.userLiked,
          commentsCount: row.commentsCount,
        })
      )
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
