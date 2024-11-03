import sqlite3

def create_connection():
    conn = sqlite3.connect('services.db')  # Database file
    return conn

def create_table():
    conn = create_connection()
    cursor = conn.cursor()
    
    # Reviews table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        ID TEXT PRIMARY KEY,
        upvote INTEGER DEFAULT 0
    )
    ''')

    # User input data
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS services (
        ID TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        servicetype TEXT,
        extrafilters TEXT,
        demographic TEXT,
        website TEXT,
        summary TEXT,
        address TEXT,
        coordinates TEXT,
        neighborhoods TEXT,
        hours TEXT,
        phone TEXT,
        languages TEXT,
        googlelink TEXT,
        source TEXT, 
        upvote INTEGER DEFAULT 0 
    )
    ''')

    conn.commit()
    conn.close()


def get_upvote_by_id(review_id: str) -> int:
    """Fetch the upvote count for a given review ID."""
    conn = create_connection()
    cursor = conn.cursor()

    # Query to select upvote by ID
    cursor.execute("SELECT upvote FROM reviews WHERE ID = ?", (review_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return 0; # Raise an exception if no review is found


    return row[0]


