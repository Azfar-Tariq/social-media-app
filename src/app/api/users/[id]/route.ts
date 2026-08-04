import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { count, eq, and } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { users, posts, follows } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? "";

  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        bio: users.bio,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [postsCount] = await db
      .select({ value: count() })
      .from(posts)
      .where(eq(posts.authorId, id));

    const [followersCount] = await db
      .select({ value: count() })
      .from(follows)
      .where(eq(follows.followingId, id));

    const [followingCount] = await db
      .select({ value: count() })
      .from(follows)
      .where(eq(follows.followerId, id));

    let isFollowing = false;
    if (currentUserId && currentUserId !== id) {
      const [follow] = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(follows.followerId, currentUserId),
            eq(follows.followingId, id)
          )
        )
        .limit(1);
      isFollowing = !!follow;
    }

    return NextResponse.json({
      user,
      stats: {
        posts: postsCount?.value ?? 0,
        followers: followersCount?.value ?? 0,
        following: followingCount?.value ?? 0,
      },
      isFollowing,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = params;

  if (id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, bio } = await request.json();

    const [updated] = await db
      .update(users)
      .set({
        name: name?.trim() || session.user.name,
        bio: bio?.trim() ?? "",
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        bio: users.bio,
      });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
