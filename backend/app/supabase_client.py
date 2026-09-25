"""
EcoVision AI – Supabase REST Client with Resilient SQLite Fallback

Async HTTP wrapper around the Supabase PostgREST API.
When Supabase is unreachable (or offline), transparently falls back to
the local SQLite database (ecovision.db).
"""

import httpx
import os
import sqlite3
from typing import Optional, Any
from app.config import settings

# Base URL for PostgREST
REST_URL = f"{settings.SUPABASE_URL}/rest/v1"

# Common headers for all requests
_HEADERS = {
    "apikey": settings.SUPABASE_KEY,
    "Authorization": f"Bearer {settings.SUPABASE_KEY}",
    "Content-Type": "application/json",
}


def _build_headers(extra: Optional[dict] = None) -> dict:
    """Build request headers, optionally merging extra headers."""
    h = {**_HEADERS}
    if extra:
        h.update(extra)
    return h


def _get_db_path() -> str:
    """Locate the ecovision.db file regardless of current working directory."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target = os.path.join(backend_dir, "ecovision.db")
    if os.path.exists(target):
        return target
    # Fallback checks
    if os.path.exists("ecovision.db"):
        return "ecovision.db"
    return target


def _get_sqlite_conn():
    conn = sqlite3.connect(_get_db_path())
    conn.row_factory = sqlite3.Row
    return conn


async def supabase_get(
    table: str,
    params: Optional[dict] = None,
    single: bool = False,
) -> Any:
    headers = _build_headers()
    if single:
        headers["Accept"] = "application/vnd.pgrst.object+json"

    try:
        async with httpx.AsyncClient(timeout=3.0, follow_redirects=True) as client:
            resp = await client.get(
                f"{REST_URL}/{table}",
                params=params or {},
                headers=headers,
            )
            if resp.status_code == 406 and single:
                return None
            resp.raise_for_status()
            return resp.json()
    except Exception:
        # Fallback to local SQLite DB
        conn = _get_sqlite_conn()
        cur = conn.cursor()
        
        query = f"SELECT * FROM {table}"
        where_clauses = []
        sql_params = []
        
        if params:
            for key, val in params.items():
                if key in ("select", "order", "limit", "offset"):
                    continue
                if isinstance(val, str) and val.startswith("eq."):
                    where_clauses.append(f"{key} = ?")
                    sql_params.append(val[3:])
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        cur.execute(query, sql_params)
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        
        if single:
            return rows[0] if rows else None
        return rows


async def supabase_post(
    table: str,
    data: Any,
    return_data: bool = True,
) -> Any:
    headers = _build_headers()
    if return_data:
        headers["Prefer"] = "return=representation"

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                f"{REST_URL}/{table}",
                json=data,
                headers=headers,
            )
            resp.raise_for_status()
            if return_data:
                result = resp.json()
                if isinstance(data, dict) and isinstance(result, list) and len(result) == 1:
                    return result[0]
                return result
            return None
    except Exception:
        # Fallback to local SQLite
        conn = _get_sqlite_conn()
        cur = conn.cursor()
        rows_to_insert = [data] if isinstance(data, dict) else data
        inserted = []
        for item in rows_to_insert:
            columns = list(item.keys())
            placeholders = ["?"] * len(columns)
            sql = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({', '.join(placeholders)})"
            cur.execute(sql, list(item.values()))
            item_copy = dict(item)
            if "id" not in item_copy or not item_copy["id"]:
                item_copy["id"] = cur.lastrowid
            inserted.append(item_copy)
        conn.commit()
        conn.close()
        if isinstance(data, dict):
            return inserted[0] if inserted else data
        return inserted


async def supabase_patch(
    table: str,
    params: dict,
    data: dict,
    return_data: bool = True,
) -> Any:
    headers = _build_headers()
    if return_data:
        headers["Prefer"] = "return=representation"

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.patch(
                f"{REST_URL}/{table}",
                params=params,
                json=data,
                headers=headers,
            )
            resp.raise_for_status()
            if return_data:
                result = resp.json()
                if isinstance(result, list) and len(result) == 1:
                    return result[0]
                return result
            return None
    except Exception:
        # Fallback to local SQLite
        conn = _get_sqlite_conn()
        cur = conn.cursor()
        set_clauses = [f"{k} = ?" for k in data.keys()]
        where_clauses = []
        sql_params = list(data.values())
        for key, val in params.items():
            if isinstance(val, str) and val.startswith("eq."):
                where_clauses.append(f"{key} = ?")
                sql_params.append(val[3:])
            else:
                where_clauses.append(f"{key} = ?")
                sql_params.append(val)
        sql = f"UPDATE {table} SET {', '.join(set_clauses)} WHERE {' AND '.join(where_clauses)}"
        cur.execute(sql, sql_params)
        conn.commit()
        conn.close()
        return data


async def supabase_delete(
    table: str,
    params: dict,
) -> None:
    headers = _build_headers()
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.delete(
                f"{REST_URL}/{table}",
                params=params,
                headers=headers,
            )
            resp.raise_for_status()
    except Exception:
        conn = _get_sqlite_conn()
        cur = conn.cursor()
        where_clauses = []
        sql_params = []
        for key, val in params.items():
            if isinstance(val, str) and val.startswith("eq."):
                where_clauses.append(f"{key} = ?")
                sql_params.append(val[3:])
            else:
                where_clauses.append(f"{key} = ?")
                sql_params.append(val)
        sql = f"DELETE FROM {table} WHERE {' AND '.join(where_clauses)}"
        cur.execute(sql, sql_params)
        conn.commit()
        conn.close()


async def supabase_count(
    table: str,
    params: Optional[dict] = None,
) -> int:
    try:
        headers = _build_headers({"Prefer": "count=exact", "Range": "0-0"})
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(
                f"{REST_URL}/{table}",
                params={**(params or {}), "select": "id"},
                headers=headers,
            )
            resp.raise_for_status()
            content_range = resp.headers.get("Content-Range", "*/0")
            total = content_range.split("/")[-1]
            return int(total) if total != "*" else 0
    except Exception:
        conn = _get_sqlite_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        cnt = cur.fetchone()[0]
        conn.close()
        return cnt
