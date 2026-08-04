import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function createNotification({
  userId,
  actorId,
  type,
  postId,
}: {
  userId: string;
  actorId: string;
  type: "like" | "comment" | "follow";
  postId?: string;
}) {
  // Don't notify self
  if (userId === actorId) return;

  try {
    await db.insert(notifications).values({
      userId,
      actorId,
      type,
      postId: postId ?? null,
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}
