import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

const sql = postgres(connectionString, { prepare: false });

async function runMigration() {
  console.log("Applying database schema updates to Supabase...");

  try {
    await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bio" text DEFAULT '';`;
    console.log("✓ Column user.bio verified/added");

    await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "password" text;`;
    console.log("✓ Column user.password verified/added");

    await sql`
      CREATE TABLE IF NOT EXISTS "follows" (
        "follower_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "following_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "created_at" timestamp DEFAULT now() NOT NULL,
        PRIMARY KEY ("follower_id", "following_id")
      );
    `;
    console.log("✓ Table follows verified/created");

    await sql`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "actor_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "type" text NOT NULL,
        "post_id" uuid REFERENCES "posts"("id") ON DELETE CASCADE,
        "read" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✓ Table notifications verified/created");

    console.log("\n🚀 All database migrations applied successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await sql.end();
  }
}

runMigration();
