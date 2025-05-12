# Guía Rápida de Inicio - VestaSys

## Inicio Rápido para Desarrollo

1. **Clonar el Repositorio**

```bash
git clone <url-del-repositorio>
cd vesta-real-last
```

2. **Iniciar el Entorno de Desarrollo**

```bash
docker compose up -d
```

3. **Verificar que Todo Funciona**

```bash
# Ver estado de los contenedores
docker ps

# Comprobar la API
curl http://localhost:8000/docs
```

4. **Acceso a las Herramientas**
   - **Backend API**: http://localhost:8000/docs
   - **phpMyAdmin**: http://localhost:8080 (Usuario: vestasysuser, Contraseña: vestasyspassword)
   - **Base de datos MySQL**: localhost:3306

## Inicio Rápido para Producción

1. **Preparar Variables de Entorno**

```bash
# Opcional: crear archivo .env con configuración de producción
nano .env
```

2. **Iniciar el Entorno de Producción**

```bash
docker compose -f docker-compose.prod.yml up -d
```

3. **Verificar el Despliegue**

```bash
# Ver estado de los contenedores
docker ps

# Comprobar la API
curl http://localhost:8000/docs
```

## Comandos Útiles

```bash
# Ver logs del backend
docker logs vestasys-backend-dev -f

# Reiniciar solo el backend
docker restart vestasys-backend-dev

# Entrar en el contenedor del backend
docker exec -it vestasys-backend-dev bash

# Hacer backup de la base de datos
docker exec vestasys-mysql-dev mysqldump -u vestasysuser -pvestasyspassword vestasys > backup.sql

# Realizar una comprobación del sistema
./docker-check.sh
```

Para más detalles, consulta la [documentación completa](docker-setup.md).
