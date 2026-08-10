#!/usr/bin/env python3
"""Export TiDB/MySQL database -> SQLite .db file (single file, portable).

Usage:
  DB_HOST=... DB_PORT=4000 DB_USER=... DB_PASSWORD=... DB_NAME=smart_pc_builder DB_SSL=true \
  python scripts/export_db_to_sqlite.py [output.db]

Requires: pip install pymysql  (sqlite3 is stdlib)
"""
import decimal
import json
import os
import sqlite3
import sys
from pathlib import Path

import pymysql

OUT_DEFAULT = Path(__file__).resolve().parent.parent.parent / "database-export" / "pcspec.db"


def main() -> None:
    out_db = Path(sys.argv[1]) if len(sys.argv) > 1 else OUT_DEFAULT
    out_db.parent.mkdir(parents=True, exist_ok=True)

    ssl_cfg = {"ssl": {"ca": None}} if os.getenv("DB_SSL") == "true" else {}
    conn = pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "smart_pc_builder"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        **ssl_cfg,
    )

    db = sqlite3.connect(out_db)
    db.execute("PRAGMA journal_mode = WAL")

    try:
        with conn.cursor() as cur:
            cur.execute("SHOW TABLES")
            tables = [list(r.values())[0] for r in cur.fetchall()]

            for table in tables:
                print(f"📦 Exporting table: {table}", flush=True)
                cur.execute(f"SELECT * FROM `{table}`")
                rows = cur.fetchall()
                cols = list(rows[0].keys()) if rows else []

                db.execute(f'DROP TABLE IF EXISTS "{table}"')
                if cols:
                    col_defs = ", ".join(f'"{c}" TEXT' for c in cols)
                    db.execute(f'CREATE TABLE "{table}" ({col_defs})')
                    placeholders = ", ".join(["?"] * len(cols))
                    col_names = ", ".join(f'"{c}"' for c in cols)
                    ins = db.executemany(
                        f'INSERT INTO "{table}" ({col_names}) VALUES ({placeholders})',
                        [
                            tuple(
                                json.dumps(r[c], ensure_ascii=False)
                                if isinstance(r[c], (dict, list))
                                else (
                                    float(r[c])
                                    if isinstance(r[c], decimal.Decimal)
                                    else (r[c] if r[c] is not None else None)
                                )
                                for c in cols
                            )
                            for r in rows
                        ],
                    )
                print(f"  ✅ {len(rows)} rows", flush=True)

        db.commit()
        size_mb = out_db.stat().st_size / 1024 / 1024
        print(f"\n🎉 Saved SQLite DB: {out_db} ({size_mb:.2f} MB)")
        print("ดูข้อมูลได้ด้วย: sqlite3 pcspec.db 'SELECT * FROM products LIMIT 5;'")
    finally:
        db.close()
        conn.close()


if __name__ == "__main__":
    main()