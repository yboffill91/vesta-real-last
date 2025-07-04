from datetime import date, datetime, timedelta
from pathlib import Path
import sys
import os

# Agregar el directorio raíz al path para poder importar desde app
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.models.menu import Menu

def run_menu_maintenance():
    """
    Ejecuta tareas de mantenimiento de menús:
    1. Archiva menús publicados con más de 1 día de antigüedad
    2. Elimina menús con más de 2 días de antigüedad
    """
    print(f"[{datetime.now()}] Iniciando mantenimiento de menús...")
    
    # Archivar menús publicados con más de 1 día de antigüedad
    archived_count = archive_expired_menus()
    print(f"[{datetime.now()}] Se archivaron {archived_count} menús publicados con más de 1 día de antigüedad")
    
    # Eliminar menús con más de 2 días de antigüedad
    deleted_count = cleanup_old_menus()
    print(f"[{datetime.now()}] Se eliminaron {deleted_count} menús con más de 2 días de antigüedad")
    
    print(f"[{datetime.now()}] Mantenimiento de menús finalizado")

def archive_expired_menus() -> int:
    """
    Cambia el estado de los menús publicados a archivados si tienen más de 1 día de antigüedad
    """
    # Consulta SQL para actualizar menús publicados con más de 1 día
    query = """
    UPDATE Menus
    SET status = %s
    WHERE status = %s
    AND DATEDIFF(CURRENT_DATE(), valid_date) > 0
    """
    
    result = Menu.execute_custom_query(query, (Menu.STATUS_ARCHIVED, Menu.STATUS_PUBLISHED))
    return result.get('affected_rows', 0) if result else 0

def cleanup_old_menus() -> int:
    """
    Elimina los menús que tienen más de 2 días de antigüedad basado en fecha de validez
    """
    # Consulta SQL para eliminar menús con más de 2 días
    query = """
    DELETE FROM Menus 
    WHERE DATEDIFF(CURRENT_DATE(), valid_date) > 2
    """
    
    result = Menu.execute_custom_query(query, ())
    return result.get('affected_rows', 0) if result else 0

if __name__ == "__main__":
    run_menu_maintenance()
