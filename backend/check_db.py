"""
Script to check the database tables and users.
"""
from app.db.db_connect import get_connection

def check_database():
    """Check database tables and users"""
    try:
        conn = get_connection()
        if not conn:
            print("Failed to connect to database")
            return
        
        cursor = conn.cursor()
        
        # Check table structure
        print("\n== TABLE STRUCTURE ==")
        cursor.execute("DESC Users")
        results = cursor.fetchall()
        for row in results:
            print(row)
        
        # Check users data
        print("\n== USERS DATA ==")
        cursor.execute("SELECT id, name, surname, username, role FROM Users")
        users = cursor.fetchall()
        for user in users:
            print(user)
        
        conn.close()
        print("\nDatabase check completed successfully")
    
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    check_database()
