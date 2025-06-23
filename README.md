# Vesta - Sistema de Gestión para Establecimientos

![Vesta Logo](https://via.placeholder.com/250x60?text=Vesta)

## Descripción | Description

### Español

Vesta es un sistema moderno para la gestión integral de establecimientos gastronómicos y similares. La aplicación permite administrar puestos de servicio (mesas), pedidos, productos, menús, e inventario, ofreciendo una interfaz intuitiva y funcionalidades avanzadas para mejorar la eficiencia operativa.

El sistema está desarrollado con una arquitectura moderna que separa claramente el backend (FastAPI) y el frontend (Next.js/React), facilitando su mantenimiento y escalabilidad.

### English

Vesta is a modern system for the comprehensive management of restaurants and similar establishments. The application allows you to manage service spots (tables), orders, products, menus, and inventory, offering an intuitive interface and advanced functionalities to improve operational efficiency.

The system is developed with a modern architecture that clearly separates the backend (FastAPI) and frontend (Next.js/React), facilitating maintenance and scalability.

## Características | Features

- Gestión de mesas y puestos de servicio
- Control de pedidos y estados
- Administración de productos y menús
- Panel de administración
- Gestión de usuarios y roles
- Reportes y estadísticas

## Tecnologías | Technologies

- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Base de datos**: MySQL
- **Contenedores**: Docker

## Iniciando el Proyecto | Getting Started

### Requisitos previos | Prerequisites

- Docker y Docker Compose
- Node.js (v16+)
- npm o yarn

### Instalación y Ejecución | Installation and Execution

#### Backend y Base de Datos con Docker

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd vesta-real
   ```

2. Inicia los servicios de backend y base de datos:
   ```bash
   docker-compose up -d
   ```

   Esto iniciará:
   - Base de datos MySQL en el puerto 3306
   - API FastAPI en http://localhost:8000

3. El backend estará disponible en [http://localhost:8000](http://localhost:8000)
   - Documentación de la API: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Frontend con npm

1. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. El frontend estará disponible en [http://localhost:3000](http://localhost:3000)

## Licencia | License

Este proyecto se distribuye bajo licencia libre. Siéntete libre de clonar, modificar y utilizar este código como desees para tus propios proyectos. No se requiere atribución.

This project is distributed under a free license. Feel free to clone, modify, and use this code as you wish for your own projects. No attribution required.

## Autor | Author

Para consultas o colaboraciones, contacta al autor:

[Yasmany Boffill](mailto:yboffill91@gmail.com)
