"""
EcoVision AI – Supabase REST Client

Async HTTP wrapper around the Supabase PostgREST API.
All data operations go through this module.
"""

import httpx
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


async def supabase_get(
    table: str,
    params: Optional[dict] = None,
    single: bool = False,
) -> Any:
    """
    SELECT from a Supabase table.

    Args:
        table: Table name (e.g. "users", "garbage_reports")
        params: PostgREST query params (e.g. {"email": "eq.test@demo.com", "select": "*"})
        single: If True, expects exactly one row (adds Accept: singular header)

    Returns:
        List of dicts, or a single dict if single=True.
    """
    headers = _build_headers()
    if single:
        headers["Accept"] = "application/vnd.pgrst.object+json"

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        resp = await client.get(
            f"{REST_URL}/{table}",
            params=params or {},
            headers=headers,
        )
        if resp.status_code == 406 and single:
            # No rows found for singular request
            return None
        resp.raise_for_status()
        return resp.json()


async def supabase_post(
    table: str,
    data: Any,
    return_data: bool = True,
) -> Any:
    """
    INSERT into a Supabase table.

    Args:
        table: Table name
        data: Dict or list of dicts to insert
        return_data: If True, returns the inserted row(s)

    Returns:
        Inserted row(s) as list of dicts, or single dict.
    """
    headers = _build_headers()
    if return_data:
        headers["Prefer"] = "return=representation"

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"{REST_URL}/{table}",
            json=data,
            headers=headers,
        )
        resp.raise_for_status()
        if return_data:
            result = resp.json()
            # If single dict was posted, return single dict
            if isinstance(data, dict) and isinstance(result, list) and len(result) == 1:
                return result[0]
            return result
        return None


async def supabase_patch(
    table: str,
    params: dict,
    data: dict,
    return_data: bool = True,
) -> Any:
    """
    UPDATE rows in a Supabase table.

    Args:
        table: Table name
        params: PostgREST filter params (e.g. {"id": "eq.5"})
        data: Fields to update
        return_data: If True, returns the updated row(s)

    Returns:
        Updated row(s).
    """
    headers = _build_headers()
    if return_data:
        headers["Prefer"] = "return=representation"

    async with httpx.AsyncClient(timeout=15.0) as client:
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


async def supabase_delete(
    table: str,
    params: dict,
) -> None:
    """DELETE rows from a Supabase table."""
    headers = _build_headers()
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.delete(
            f"{REST_URL}/{table}",
            params=params,
            headers=headers,
        )
        resp.raise_for_status()


async def supabase_rpc(
    fn_name: str,
    params: Optional[dict] = None,
) -> Any:
    """Call a Postgres function via PostgREST RPC."""
    headers = _build_headers()
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{REST_URL}/rpc/{fn_name}",
            json=params or {},
            headers=headers,
        )
        resp.raise_for_status()
        return resp.json()


async def supabase_head(
    table: str,
    params: Optional[dict] = None,
) -> int:
    """
    Get the count of rows matching a filter.
    Uses the Prefer: count=exact header with HEAD request.
    """
    headers = _build_headers({"Prefer": "count=exact"})
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.head(
            f"{REST_URL}/{table}",
            params=params or {},
            headers=headers,
        )
        resp.raise_for_status()
        # Count is in the Content-Range header: "0-N/total" or "*/total"
        content_range = resp.headers.get("Content-Range", "*/0")
        total = content_range.split("/")[-1]
        return int(total) if total != "*" else 0


async def supabase_count(
    table: str,
    params: Optional[dict] = None,
) -> int:
    """
    Count rows matching a filter using GET with count header.
    """
    headers = _build_headers({"Prefer": "count=exact", "Range": "0-0"})
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{REST_URL}/{table}",
            params={**(params or {}), "select": "id"},
            headers=headers,
        )
        resp.raise_for_status()
        content_range = resp.headers.get("Content-Range", "*/0")
        total = content_range.split("/")[-1]
        return int(total) if total != "*" else 0
