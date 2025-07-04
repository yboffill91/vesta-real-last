# Vesta Backend

## Tareas de mantenimiento automatizadas

### Mantenimiento de menús

El sistema requiere ejecutar periódicamente tareas de mantenimiento para menús:

1. **Archivado automático**: Los menús en estado "publicada" que tengan más de 1 día desde su fecha de validez serán archivados automáticamente.

2. **Eliminación automática**: Los menús con más de 2 días desde su fecha de validez serán eliminados automáticamente.

### Configuración de tareas programadas

Se proporciona un script en `app/scripts/menu_maintenance.py` que debe ser ejecutado diariamente. Hay varias formas de automatizar esta tarea:

#### Opción 1: Cron (sistemas Linux/Unix)

1. Editar la tabla cron:
   ```bash
   crontab -e
   ```

2. Añadir la siguiente línea para ejecutar el script diariamente a las 00:05:
   ```
   5 0 * * * cd /ruta/al/proyecto/backend && python -m app.scripts.menu_maintenance >> /var/log/vesta/menu_maintenance.log 2>&1
   ```

#### Opción 2: Servicio systemd (sistemas Linux modernos)

1. Crear un archivo de servicio y temporizador:
   ```bash
   sudo nano /etc/systemd/system/vesta-menu-maintenance.service
   ```

2. Añadir el siguiente contenido:
   ```
   [Unit]
   Description=Vesta Menu Maintenance
   
   [Service]
   Type=oneshot
   ExecStart=/usr/bin/python3 -m app.scripts.menu_maintenance
   WorkingDirectory=/ruta/al/proyecto/backend
   User=www-data
   
   [Install]
   WantedBy=multi-user.target
   ```

3. Crear el temporizador:
   ```bash
   sudo nano /etc/systemd/system/vesta-menu-maintenance.timer
   ```

4. Añadir el siguiente contenido:
   ```
   [Unit]
   Description=Run Vesta Menu Maintenance daily
   
   [Timer]
   OnCalendar=*-*-* 00:05:00
   Persistent=true
   
   [Install]
   WantedBy=timers.target
   ```

5. Activar el temporizador:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable vesta-menu-maintenance.timer
   sudo systemctl start vesta-menu-maintenance.timer
   ```

#### Opción 3: Entorno Docker

Si la aplicación está desplegada en Docker, añadir un servicio de mantenimiento en `docker-compose.yml`:

```yaml
services:
  # ... otros servicios
  
  cron:
    image: vesta-backend  # Misma imagen que el backend
    command: sh -c "echo '5 0 * * * cd /app && python -m app.scripts.menu_maintenance >> /var/log/cron.log 2>&1' > /etc/crontabs/root && crond -f -L /dev/stdout"
    volumes:
      - ./backend:/app
      - ./logs:/var/log
```

### Verificación de ejecución

Para verificar que las tareas de mantenimiento se ejecutan correctamente, revisar los registros:

```bash
tail -f /var/log/vesta/menu_maintenance.log
```

O en caso de usar systemd:

```bash
journalctl -u vesta-menu-maintenance.service -f
```
