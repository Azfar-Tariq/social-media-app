import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { follows } from "@/db/schema";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { targetUserId } = await request.json();

  if (!targetUserId || targetUserId === session.user.id) {
    return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
  }

  try {
    const existing = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, session.user.id),
          eq(follows.followingId, targetUserId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, session.user.id),
            eq(follows.followingId, targetUserId)
          )
        );
      return NextResponse.json({ following: false });
    } else {
      await db.insert(follows).values({
        followerId: session.user.id,
        followingId: targetUserId,
      });

      await createNotification({
        userId: targetUserId,
        actorId: session.user.id,
        type: "follow",
      });

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}
