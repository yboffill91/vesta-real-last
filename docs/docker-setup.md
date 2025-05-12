# Guía de Dockerización del Proyecto VestaSys

Esta documentación describe cómo configurar y ejecutar el proyecto VestaSys utilizando Docker tanto en entornos de desarrollo como de producción.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Docker](https://docs.docker.com/get-docker/) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0 o superior)

## Estructura de la Dockerización

El proyecto utiliza Docker Compose para gestionar múltiples contenedores:

- **Base de Datos**: MySQL 8.0 para almacenamiento persistente
- **Backend**: Aplicación FastAPI para la lógica de negocio
- **phpMyAdmin**: Herramienta de administración de bases de datos (solo en desarrollo)

Se han configurado dos entornos separados:

- `docker-compose.yml` - Configuración para el entorno de desarrollo
- `docker-compose.prod.yml` - Configuración para el entorno de producción

## Entorno de Desarrollo

El entorno de desarrollo está configurado para proporcionar:

- Hot-reload del código (cambios en tiempo real)
- phpMyAdmin para administración de la base de datos
- Volúmenes montados para el código fuente
- Herramientas de depuración

### Iniciar el Entorno de Desarrollo

Para iniciar todos los servicios del entorno de desarrollo:

```bash
docker compose up -d
```

Esto iniciará:
- MySQL en `localhost:3306`
- Backend FastAPI en `localhost:8000`
- phpMyAdmin en `localhost:8080`

Para ver logs en tiempo real:

```bash
docker compose logs -f
```

Para ver los logs solo del backend:

```bash
docker compose logs -f backend
```

### Detener el Entorno de Desarrollo

Para detener todos los contenedores manteniendo los datos:

```bash
docker compose stop
```

Para detener y eliminar los contenedores (los datos persistentes se mantienen):

```bash
docker compose down
```

Para eliminar completamente todo, incluyendo volúmenes y datos persistentes:

```bash
docker compose down -v
```

## Entorno de Producción

El entorno de producción está optimizado para rendimiento y seguridad:

- Sin hot-reload para mejor rendimiento
- Sin herramientas de desarrollo como phpMyAdmin
- Optimización de compilación
- Sin volúmenes montados para código fuente

### Iniciar el Entorno de Producción

Para iniciar los servicios de producción:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Esto iniciará:
- MySQL en `localhost:3306`
- Backend FastAPI en `localhost:8000`

Para ver logs en tiempo real:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Detener el Entorno de Producción

Para detener todos los contenedores:

```bash
docker compose -f docker-compose.prod.yml stop
```

Para detener y eliminar los contenedores (los datos persistentes se mantienen):

```bash
docker compose -f docker-compose.prod.yml down
```

## Variables de Entorno

Las variables de entorno se pueden configurar de varias formas:

1. Directamente en el archivo `docker-compose.yml` o `docker-compose.prod.yml`
2. Mediante un archivo `.env` en la raíz del proyecto
3. Pasándolas al comando `docker compose`

Variables importantes:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `MYSQL_ROOT_PASSWORD` | Contraseña del usuario root de MySQL | rootpassword |
| `MYSQL_DATABASE` | Nombre de la base de datos | vestasys |
| `MYSQL_USER` | Usuario de MySQL | vestasysuser |
| `MYSQL_PASSWORD` | Contraseña del usuario MySQL | vestasyspassword |

## Verificar el Estado del Sistema

Para comprobar que todo funciona correctamente, puedes usar el script incluido:

```bash
./docker-check.sh
```

Este script verificará:
- Si Docker está instalado correctamente
- Si los archivos de configuración son válidos
- El estado de los contenedores
- La conectividad de la base de datos

## Solución de Problemas

### El Backend no Inicia Correctamente

Si el backend está reiniciándose continuamente, revisa los logs:

```bash
docker logs vestasys-backend-dev
# o para producción
docker logs vestasys-backend-prod
```

Problemas comunes:
- Falta de conexión con la base de datos
- Errores en las migraciones
- Dependencias faltantes

### La Base de Datos No Está Disponible

Verifica el estado del contenedor de la base de datos:

```bash
docker ps | grep mysql
```

Si está activo pero no accesible, revisa los logs:

```bash
docker logs vestasys-mysql-dev
# o para producción
docker logs vestasys-mysql-prod
```

## Estructura de Directorios Docker

```
/
├── docker-compose.yml          # Configuración para desarrollo
├── docker-compose.prod.yml     # Configuración para producción
├── docker-check.sh             # Script de verificación
├── backend/
│   ├── Dockerfile              # Imagen para desarrollo
│   ├── Dockerfile.prod         # Imagen para producción
│   ├── requirements.txt        # Dependencias Python
│   ├── docker-entrypoint.sh    # Script de inicialización
│   └── run_stored_procs.sh     # Script para procedimientos almacenados
└── docs/
    └── docker-setup.md         # Esta documentación
```

## Personalización

### Cambiar Puertos

Para cambiar los puertos expuestos, modifica las secciones `ports` en los archivos docker-compose:

```yaml
ports:
  - "nuevo_puerto:puerto_contenedor"
```

### Agregar Servicios Adicionales

Para añadir nuevos servicios (como Redis, Nginx, etc.), agrégalos a la sección `services` del archivo docker-compose correspondiente.

## Recomendaciones

1. Usa el entorno de desarrollo para codificar y probar
2. Prueba en producción antes de desplegar
3. Mantén sincronizados los archivos Dockerfile y docker-compose
4. Configura variables de entorno seguras para producción
5. Realiza backups regulares de la base de datos
