"""
EcoVision AI – Database Module (Supabase)

Previously used SQLAlchemy + SQLite. Now all data operations go through
the Supabase REST client (see supabase_client.py).

This module is kept for backward compatibility of enum imports and
the Base class reference in models.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Kept for model enum definitions that still reference Base."""
    pass


async def init_db():
    """No-op: Supabase manages the database schema."""
    pass
