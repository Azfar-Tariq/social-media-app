import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const rawName = name?.trim() || normalizedEmail.split("@")[0];
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const hashedPassword = hashPassword(password);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formattedName)}`;

    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: formattedName,
        password: hashedPassword,
        image: avatarUrl,
      })
      .returning();

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in registration:", error);
    return NextResponse.json(
      { error: "Failed to register account" },
      { status: 500 }
    );
  }
}
