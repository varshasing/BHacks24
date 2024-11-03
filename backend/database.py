import sqlite3

def create_connection():
    conn = sqlite3.connect('services.db')  # Database file
    return conn

def create_table():
    conn = create_connection()
    cursor = conn.cursor()


    #user input data
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
        source TEXT
    )
    ''')


    # Reviews table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        ID TEXT PRIMARY KEY,
        upvote INTEGER DEFAULT 0
    )
    ''')

    conn.commit()
    conn.close()
