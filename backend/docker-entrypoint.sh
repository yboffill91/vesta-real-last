#!/bin/bash
set -e

# Esperar a que la base de datos esté disponible
echo "Waiting for database to be available..."
python -c '
import time
import pymysql
import os
from dotenv import load_dotenv

load_dotenv("/app/.db.env")

host = os.getenv("DB_HOST", "db")
user = os.getenv("MYSQL_USER", "vestasysuser")
password = os.getenv("MYSQL_PASSWORD", "vestasyspassword")
database = os.getenv("MYSQL_DATABASE", "vestasys")
port = int(os.getenv("DB_PORT", 3306))

for i in range(30):
    try:
        conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            connect_timeout=5
        )
        conn.close()
        print("Database connection successful!")
        exit(0)
    except Exception as e:
        print(f"Database connection attempt {i+1} failed, retrying in 2 seconds...")
        print(f"Error: {str(e)}")
        time.sleep(2)

print("Could not connect to database after 30 attempts. Exiting.")
exit(1)
'

# Ejecutar migraciones
echo "Running database migrations..."
python run_migrations.py

# Ejecutar procedimientos almacenados
echo "Running stored procedures..."
chmod +x /app/run_stored_procs.sh
/app/run_stored_procs.sh

# Inicializar la base de datos
echo "Initializing database..."
python -m app.db.init_db

# Ejecutar la aplicación
echo "Starting FastAPI application..."
exec "$@"
