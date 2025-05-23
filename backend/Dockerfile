FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (mantener solo las imprescindibles)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    default-libmysqlclient-dev \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies (no actualizar pip si no es necesario)
RUN pip install --no-cache-dir -r requirements.txt

# Copy entry script first
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# No copiamos el código - se montará como volumen para desarrollo

# Create a non-root user and switch to it
RUN useradd -m appuser && chown -R appuser:appuser /app && \
    chown appuser:appuser /docker-entrypoint.sh
USER appuser

# Expose the port the app runs on
EXPOSE 8000

# Set the entry point
ENTRYPOINT ["/docker-entrypoint.sh"]

# Command to run the application with hot reload for development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app"]
