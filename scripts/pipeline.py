"""
Borderless Maastricht – Crawl & Embed Pipeline
Schreibt in data/borderless.db (SQLite, via Git LFS committed).

Setup:
    pip install openai trafilatura httpx schedule python-dotenv

Starten:
    python scripts/pipeline.py

Die DB-Datei landet in data/borderless.db und wird per Git LFS getrackt.
"""

import hashlib, json, os, sqlite3, time, logging, schedule
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx, trafilatura
from openai import OpenAI
from dotenv import load_dotenv

# .env.local aus Repo-Root laden
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")

from sources import SOURCES

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

DB_PATH = Path(__file__).parent.parent / "data" / "borderless.db"
EMBEDDING_MODEL = "text-embedding-3-small"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50


# ── Datenbankinitialisierung ──────────────────────────────────────────────────

def get_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS source_registry (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            url              TEXT UNIQUE NOT NULL,
            source_name      TEXT NOT NULL,
            country          TEXT NOT NULL,
            category         TEXT NOT NULL,
            update_frequency TEXT NOT NULL,
            last_crawled_at  TEXT,
            last_hash        TEXT,
            is_active        INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS document_chunks (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id       INTEGER REFERENCES source_registry(id),
            chunk_index     INTEGER NOT NULL,
            content         TEXT NOT NULL,
            embedding       TEXT NOT NULL,
            url             TEXT NOT NULL,
            source_name     TEXT NOT NULL,
            country         TEXT NOT NULL,
            category        TEXT NOT NULL,
            last_crawled_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_chunks_country ON document_chunks(country);
    """)
    conn.commit()
    return conn


# ── Hilfsfunktionen ───────────────────────────────────────────────────────────

def fetch_page(url: str) -> Optional[str]:
    try:
        r = httpx.get(url, timeout=15, follow_redirects=True,
                      headers={"User-Agent": "BorderlessMaastricht/1.0 (educational project)"})
        r.raise_for_status()
        return trafilatura.extract(r.text, include_links=False, include_tables=True)
    except Exception as e:
        log.warning(f"  Fehler: {e}")
        return None


def compute_hash(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


def chunk_text(text: str) -> list[str]:
    words = text.split()
    chunks, start = [], 0
    while start < len(words):
        chunks.append(" ".join(words[start:start + CHUNK_SIZE]))
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def embed_texts(texts: list[str]) -> list[list[float]]:
    res = openai_client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [item.embedding for item in res.data]


# ── Haupt-Pipeline ────────────────────────────────────────────────────────────

def process_source(conn: sqlite3.Connection, cfg: dict):
    log.info(f"Prüfe: {cfg['source_name']}")

    text = fetch_page(cfg["url"])
    if not text:
        log.warning("  → Kein Inhalt, übersprungen")
        return

    new_hash = compute_hash(text)
    now = datetime.now(timezone.utc).isoformat()

    # Quelle in Registry holen oder anlegen
    row = conn.execute("SELECT id, last_hash FROM source_registry WHERE url = ?", (cfg["url"],)).fetchone()
    if row:
        source_id, old_hash = row["id"], row["last_hash"]
    else:
        cur = conn.execute(
            "INSERT INTO source_registry (url, source_name, country, category, update_frequency) VALUES (?,?,?,?,?)",
            (cfg["url"], cfg["source_name"], cfg["country"], cfg["category"], cfg["update_frequency"])
        )
        source_id, old_hash = cur.lastrowid, None
        conn.commit()

    # Change Detection
    if new_hash == old_hash:
        log.info("  → Unverändert")
        conn.execute("UPDATE source_registry SET last_crawled_at = ? WHERE id = ?", (now, source_id))
        conn.commit()
        return

    log.info("  → Geändert, re-indexing...")
    chunks = chunk_text(text)
    embeddings = embed_texts(chunks)

    # Alte Chunks löschen, neue einfügen
    conn.execute("DELETE FROM document_chunks WHERE source_id = ?", (source_id,))
    conn.executemany(
        """INSERT INTO document_chunks
           (source_id, chunk_index, content, embedding, url, source_name, country, category, last_crawled_at)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        [
            (source_id, i, chunk, json.dumps(emb),
             cfg["url"], cfg["source_name"], cfg["country"], cfg["category"], now)
            for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
        ]
    )
    conn.execute(
        "UPDATE source_registry SET last_hash = ?, last_crawled_at = ? WHERE id = ?",
        (new_hash, now, source_id)
    )
    conn.commit()
    log.info(f"  ✓ {len(chunks)} Chunks gespeichert")


def run_pipeline(frequency_filter: Optional[str] = None):
    sources = [s for s in SOURCES if not frequency_filter or s["update_frequency"] == frequency_filter]
    log.info(f"Pipeline: {len(sources)} Quellen ({frequency_filter or 'alle'}) → {DB_PATH}")
    conn = get_db()
    for src in sources:
        process_source(conn, src)
        time.sleep(1)
    conn.close()
    log.info(f"Fertig. DB-Größe: {DB_PATH.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    run_pipeline()  # Einmalig alles indexieren
    schedule.every().week.do(lambda: run_pipeline("weekly"))
    schedule.every().month.do(lambda: run_pipeline("monthly"))
    schedule.every(90).days.do(lambda: run_pipeline("quarterly"))
    log.info("Scheduler läuft. Strg+C zum Beenden.")
    while True:
        schedule.run_pending()
        time.sleep(3600)
