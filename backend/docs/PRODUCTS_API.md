# Documentación de la API de Productos

## Descripción General

La API de productos permite gestionar el inventario de productos del restaurante, incluyendo operaciones CRUD y búsqueda.

## Base URL

```
http://localhost:8000/api/v1/products
```

## Permisos Requeridos

La consulta de productos está disponible para todos los usuarios autenticados, mientras que las operaciones de creación, actualización y eliminación requieren permisos de administrador o soporte.

## Endpoints

### Obtener Todos los Productos

Recupera la lista de productos con opciones de filtrado y paginación.

- **URL**: `/`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de consulta

| Parámetro   | Tipo    | Requerido | Descripción                                  |
|-------------|---------|-----------|----------------------------------------------|
| active_only | boolean | No        | Si es true, solo muestra productos activos   |
| category_id | integer | No        | Filtrar por ID de categoría                  |
| search      | string  | No        | Término de búsqueda para nombre o descripción|
| page        | integer | No        | Número de página para paginación             |
| limit       | integer | No        | Cantidad de elementos por página             |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/products?active_only=true&category_id=2&search=pizza', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.get('http://localhost:8000/api/v1/products', {
  params: {
    active_only: true,
    category_id: 2,
    search: 'pizza'
  },
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Pizza Margarita",
      "description": "Pizza clásica con tomate y mozzarella",
      "price": 150.00,
      "image_url": "https://example.com/images/pizza_margarita.jpg",
      "is_active": true,
      "category_id": 2,
      "category_name": "Pizzas",
      "created_at": "2025-05-10T15:30:45",
      "updated_at": "2025-05-11T09:20:15"
    },
    {
      "id": 5,
      "name": "Pizza Pepperoni",
      "description": "Pizza con pepperoni y mozzarella",
      "price": 180.00,
      "image_url": "https://example.com/images/pizza_pepperoni.jpg",
      "is_active": true,
      "category_id": 2,
      "category_name": "Pizzas",
      "created_at": "2025-05-10T16:45:22",
      "updated_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 2,
    "total_pages": 1
  }
}
```

### Crear Producto

Crea un nuevo producto en el sistema.

- **URL**: `/`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Admin, Soporte

#### Parámetros de solicitud

| Campo       | Tipo    | Requerido | Descripción                          |
|-------------|---------|-----------|--------------------------------------|
| name        | string  | Sí        | Nombre del producto                  |
| description | string  | No        | Descripción detallada del producto   |
| price       | number  | Sí        | Precio del producto                  |
| image_url   | string  | No        | URL de la imagen del producto        |
| is_active   | boolean | No        | Estado del producto (default: true)  |
| category_id | integer | Sí        | ID de la categoría del producto      |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    name: "Hamburguesa Doble",
    description: "Hamburguesa doble con queso, lechuga y tomate",
    price: 200.00,
    image_url: "https://example.com/images/hamburguesa_doble.jpg",
    is_active: true,
    category_id: 3
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.post('http://localhost:8000/api/v1/products', {
  name: "Hamburguesa Doble",
  description: "Hamburguesa doble con queso, lechuga y tomate",
  price: 200.00,
  image_url: "https://example.com/images/hamburguesa_doble.jpg",
  is_active: true,
  category_id: 3
}, {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (201 Created)

```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "id": 10,
    "name": "Hamburguesa Doble",
    "description": "Hamburguesa doble con queso, lechuga y tomate",
    "price": 200.00,
    "image_url": "https://example.com/images/hamburguesa_doble.jpg",
    "is_active": true,
    "category_id": 3,
    "category_name": "Hamburguesas",
    "created_at": "2025-05-12T10:15:30",
    "updated_at": null
  }
}
```

### Obtener Producto por ID

Recupera la información detallada de un producto específico.

- **URL**: `/{product_id}`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de ruta

| Parámetro  | Tipo    | Descripción             |
|------------|---------|-------------------------|
| product_id | integer | ID del producto a obtener |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/products/10', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.get('http://localhost:8000/api/v1/products/10', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "Product retrieved successfully",
  "data": {
    "id": 10,
    "name": "Hamburguesa Doble",
    "description": "Hamburguesa doble con queso, lechuga y tomate",
    "price": 200.00,
    "image_url": "https://example.com/images/hamburguesa_doble.jpg",
    "is_active": true,
    "category_id": 3,
    "category_name": "Hamburguesas",
    "created_at": "2025-05-12T10:15:30",
    "updated_at": null
  }
}
```

### Actualizar Producto

Actualiza la información de un producto existente.

- **URL**: `/{product_id}`
- **Método**: `PUT`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Admin, Soporte

#### Parámetros de ruta

| Parámetro  | Tipo    | Descripción                   |
|------------|---------|-------------------------------|
| product_id | integer | ID del producto a actualizar  |

#### Parámetros de solicitud

| Campo       | Tipo    | Requerido | Descripción                          |
|-------------|---------|-----------|--------------------------------------|
| name        | string  | No        | Nombre actualizado del producto      |
| description | string  | No        | Descripción actualizada              |
| price       | number  | No        | Precio actualizado                   |
| image_url   | string  | No        | URL de imagen actualizada            |
| is_active   | boolean | No        | Estado actualizado                   |
| category_id | integer | No        | ID de categoría actualizado          |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/products/10', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    price: 220.00,
    description: "Hamburguesa doble con queso cheddar, lechuga, tomate y salsa especial"
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.put('http://localhost:8000/api/v1/products/10', {
  price: 220.00,
  description: "Hamburguesa doble con queso cheddar, lechuga, tomate y salsa especial"
}, {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    "id": 10,
    "name": "Hamburguesa Doble",
    "description": "Hamburguesa doble con queso cheddar, lechuga, tomate y salsa especial",
    "price": 220.00,
    "image_url": "https://example.com/images/hamburguesa_doble.jpg",
    "is_active": true,
    "category_id": 3,
    "category_name": "Hamburguesas",
    "created_at": "2025-05-12T10:15:30",
    "updated_at": "2025-05-12T11:30:45"
  }
}
```

### Eliminar Producto

Elimina un producto del sistema (desactivación lógica).

- **URL**: `/{product_id}`
- **Método**: `DELETE`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Admin, Soporte

#### Parámetros de ruta

| Parámetro  | Tipo    | Descripción                 |
|------------|---------|---------------------------- |
| product_id | integer | ID del producto a eliminar  |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/products/10', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.delete('http://localhost:8000/api/v1/products/10', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "Product deleted successfully",
  "data": {
    "id": 10,
    "name": "Hamburguesa Doble",
    "description": "Hamburguesa doble con queso cheddar, lechuga, tomate y salsa especial",
    "price": 220.00,
    "image_url": "https://example.com/images/hamburguesa_doble.jpg",
    "is_active": false,
    "category_id": 3,
    "category_name": "Hamburguesas",
    "created_at": "2025-05-12T10:15:30",
    "updated_at": "2025-05-12T14:20:10"
  }
}
```

### Buscar Productos

Búsqueda avanzada de productos.

- **URL**: `/search`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de consulta

| Parámetro     | Tipo    | Requerido | Descripción                                  |
|---------------|---------|-----------|----------------------------------------------|
| query         | string  | Sí        | Término de búsqueda                          |
| category_ids  | string  | No        | IDs de categorías separados por coma         |
| min_price     | number  | No        | Precio mínimo                                |
| max_price     | number  | No        | Precio máximo                                |
| active_only   | boolean | No        | Si es true, solo muestra productos activos   |
| page          | integer | No        | Número de página para paginación             |
| limit         | integer | No        | Cantidad de elementos por página             |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/products/search?query=hamburguesa&category_ids=3,4&min_price=150&max_price=250', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.get('http://localhost:8000/api/v1/products/search', {
  params: {
    query: 'hamburguesa',
    category_ids: '3,4',
    min_price: 150,
    max_price: 250
  },
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "Search results retrieved successfully",
  "data": [
    {
      "id": 10,
      "name": "Hamburguesa Doble",
      "description": "Hamburguesa doble con queso cheddar, lechuga, tomate y salsa especial",
      "price": 220.00,
      "image_url": "https://example.com/images/hamburguesa_doble.jpg",
      "is_active": true,
      "category_id": 3,
      "category_name": "Hamburguesas",
      "created_at": "2025-05-12T10:15:30",
      "updated_at": "2025-05-12T11:30:45"
    },
    {
      "id": 11,
      "name": "Hamburguesa Vegetariana",
      "description": "Hamburguesa vegetariana con hamburguesa a base de plantas",
      "price": 190.00,
      "image_url": "https://example.com/images/hamburguesa_vegetariana.jpg",
      "is_active": true,
      "category_id": 3,
      "category_name": "Hamburguesas",
      "created_at": "2025-05-12T10:20:30",
      "updated_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 2,
    "total_pages": 1
  }
}
```

## Manejo de Errores Comunes

| Código HTTP | Descripción                    | Posible Causa                                  |
|-------------|--------------------------------|------------------------------------------------|
| 400         | Bad Request                    | Datos de entrada inválidos                     |
| 401         | Unauthorized                   | Token de autenticación faltante o inválido     |
| 403         | Forbidden                      | Permisos insuficientes para la operación       |
| 404         | Not Found                      | Producto no encontrado                         |
| 500         | Internal Server Error          | Error del servidor al procesar la solicitud    |

## Recomendaciones para Frontend

- Implementar componentes de búsqueda avanzada con filtros múltiples
- Utilizar formularios con validación para la creación y actualización de productos
- Implementar visualización de imágenes con opciones de previsualización
- Considerar carga diferida (lazy loading) al mostrar listas de productos para optimizar el rendimiento
