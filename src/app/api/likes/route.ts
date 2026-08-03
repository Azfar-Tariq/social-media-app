import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, count, eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { likes } from "@/db/schema";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { postId } = await request.json();

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    const existing = await db
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(eq(likes.postId, postId), eq(likes.userId, session.user.id))
      )
      .limit(1);

    if (existing.length > 0) {
      await db.delete(likes).where(eq(likes.id, existing[0].id));
    } else {
      await db.insert(likes).values({
        postId,
        userId: session.user.id,
      });
    }

    const [result] = await db
      .select({ value: count() })
      .from(likes)
      .where(eq(likes.postId, postId));

    return NextResponse.json({ likes: result?.value ?? 0 });
  } catch (error) {
    console.error("Error updating like:", error);
    return NextResponse.json(
      { error: "Failed to update like" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    const [likeCount] = await db
      .select({ value: count() })
      .from(likes)
      .where(eq(likes.postId, postId));

    let userLiked = false;
    if (session?.user?.id) {
      const [userLike] = await db
        .select({ id: likes.id })
        .from(likes)
        .where(
          and(eq(likes.postId, postId), eq(likes.userId, session.user.id))
        )
        .limit(1);
      userLiked = !!userLike;
    }

    return NextResponse.json({
      likes: likeCount?.value ?? 0,
      userLiked,
    });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}
