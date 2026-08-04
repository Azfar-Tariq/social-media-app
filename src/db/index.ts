import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | undefined;

export function getDb(): Db {
  if (!_db) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@127.0.0.1:5432/postgres";
    const client = postgres(connectionString, {
      prepare: false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export const db = getDb();
