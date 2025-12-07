"""Database initialization and schema for Rate Card Pro."""
import sqlite3
import os

DB_PATH = os.environ.get("RC_DB_PATH", "./ratecard.sqlite")

def get_connection():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database schema."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            role TEXT NOT NULL CHECK(role IN('AM','FD')),
            password_hash TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Requests table (rate card quotes)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS requests(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project_code TEXT,
            client_name TEXT,
            am_email TEXT NOT NULL,
            state TEXT NOT NULL DEFAULT 'draft' 
                CHECK(state IN('draft','submitted','fd_review','approved','rejected')),
            totals_json TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Request items (line items)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS request_items(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
            description TEXT NOT NULL,
            qty REAL NOT NULL DEFAULT 1,
            rate REAL NOT NULL DEFAULT 0,
            subtotal REAL NOT NULL DEFAULT 0,
            position INTEGER NOT NULL DEFAULT 0
        )
    """)
    
    # Approval snapshot (locked version on approval)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS approval_snapshot(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
            version_no INTEGER NOT NULL DEFAULT 1,
            locked_totals_json TEXT,
            approved_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(request_id, version_no)
        )
    """)
    
    # Approval events log
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS approval_events(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
            actor_email TEXT NOT NULL,
            action TEXT NOT NULL CHECK(action IN('create','submit','review','approve','reject','edit')),
            note TEXT,
            at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Role tiers for dropdown
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS role_tiers(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            hourly_rate REAL NOT NULL DEFAULT 0,
            active INTEGER NOT NULL DEFAULT 1
        )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

if __name__ == "__main__":
    init_db()
