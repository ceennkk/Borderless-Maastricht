/**
 * SQLite singleton — server-side only.
 *
 * Reads data/borderless.db, which is committed to the repo via Git LFS
 * and rebuilt by scripts/pipeline.py.
 *
 * The DB is opened read-only so the Next.js process can never corrupt it.
 * The singleton is module-level so the file is opened once per server
 * process, not once per request.
 */
import path from "path";
import Database from "better-sqlite3";

const DB_PATH = path.join(process.cwd(), "data", "borderless.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    try {
      _db = new Database(DB_PATH, { readonly: true });
    } catch {
      // DB not built yet (first clone before running pipeline).
      // Return null — rag.ts handles this gracefully.
      return null as unknown as Database.Database;
    }
  }
  return _db;
}

export interface DbChunk {
  id: number;
  content: string;
  embedding: string; // JSON-encoded float array
  url: string;
  source_name: string;
  country: string;
  category: string;
  last_crawled_at: string;
}
