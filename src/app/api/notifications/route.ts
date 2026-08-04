import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { desc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        postId: notifications.postId,
        read: notifications.read,
        createdAt: notifications.createdAt,
        actorName: users.name,
        actorImage: users.image,
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.actorId, users.id))
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
