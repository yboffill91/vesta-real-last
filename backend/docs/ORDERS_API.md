# Documentación de la API de Órdenes

## Descripción General

La API de órdenes permite gestionar los pedidos en el restaurante, incluyendo la creación, actualización, consulta y eliminación de órdenes y sus elementos.

## Base URL

```
http://localhost:8000/api/v1/orders
```

## Permisos Requeridos

Todos los usuarios autenticados pueden acceder a las funciones básicas de gestión de órdenes, mientras que las operaciones de eliminación requieren permisos de administrador o soporte.

## Endpoints

### Obtener Todas las Órdenes

Recupera la lista de órdenes con opciones de filtrado y paginación.

- **URL**: `/`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de consulta

| Parámetro       | Tipo    | Requerido | Descripción                                       |
|-----------------|---------|-----------|---------------------------------------------------|
| status          | string  | No        | Filtrar por estado de la orden                    |
| service_spot_id | integer | No        | Filtrar por ID de puesto de servicio (mesa)       |
| date_from       | string  | No        | Fecha inicial para filtrar (formato: YYYY-MM-DD)  |
| date_to         | string  | No        | Fecha final para filtrar (formato: YYYY-MM-DD)    |
| page            | integer | No        | Número de página para paginación                  |
| limit           | integer | No        | Cantidad de elementos por página                  |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/orders?status=abierta&service_spot_id=5', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.get('http://localhost:8000/api/v1/orders', {
  params: {
    status: 'abierta',
    service_spot_id: 5
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
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": 1,
      "service_spot_id": 5,
      "status": "abierta",
      "total_amount": 350.00,
      "tax_amount": 56.00,
      "created_by": "dependiente1",
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "product_id": 1,
          "quantity": 2,
          "price": 150.00,
          "total_price": 300.00,
          "notes": "Sin cebolla"
        },
        {
          "id": 2,
          "order_id": 1,
          "product_id": 3,
          "quantity": 2,
          "price": 25.00,
          "total_price": 50.00,
          "notes": null
        }
      ],
      "created_at": "2025-05-12T12:30:00",
      "updated_at": null,
      "closed_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 1,
    "total_pages": 1
  }
}
```

### Crear Orden

Crea una nueva orden en el sistema.

- **URL**: `/`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de solicitud

| Campo          | Tipo           | Requerido | Descripción                                  |
|----------------|----------------|-----------|----------------------------------------------|
| service_spot_id| integer        | Sí        | ID del puesto de servicio (mesa)             |
| status         | string         | No        | Estado inicial de la orden (default: abierta)|
| items          | array          | No        | Lista de elementos del pedido                |

Cada elemento del array items debe tener:

| Campo       | Tipo    | Requerido | Descripción                         |
|-------------|---------|-----------|-------------------------------------|
| product_id  | integer | Sí        | ID del producto                     |
| quantity    | integer | Sí        | Cantidad del producto               |
| price       | number  | Sí        | Precio unitario                     |
| notes       | string  | No        | Notas especiales para el producto   |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    service_spot_id: 5,
    status: "abierta",
    items: [
      {
        product_id: 1,
        quantity: 2,
        price: 150.00,
        notes: "Sin cebolla"
      },
      {
        product_id: 3,
        quantity: 2,
        price: 25.00
      }
    ]
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.post('http://localhost:8000/api/v1/orders', {
  service_spot_id: 5,
  status: "abierta",
  items: [
    {
      product_id: 1,
      quantity: 2,
      price: 150.00,
      notes: "Sin cebolla"
    },
    {
      product_id: 3,
      quantity: 2,
      price: 25.00
    }
  ]
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
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "service_spot_id": 5,
    "status": "abierta",
    "total_amount": 350.00,
    "tax_amount": 56.00,
    "created_by": "dependiente1",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 150.00,
        "total_price": 300.00,
        "notes": "Sin cebolla"
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 3,
        "quantity": 2,
        "price": 25.00,
        "total_price": 50.00,
        "notes": null
      }
    ],
    "created_at": "2025-05-12T12:30:00",
    "updated_at": null,
    "closed_at": null
  }
}
```

### Obtener Orden por ID

Recupera la información detallada de una orden específica con sus elementos.

- **URL**: `/{order_id}`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción           |
|-----------|---------|------------------------|
| order_id  | integer | ID de la orden a obtener |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/orders/1', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.get('http://localhost:8000/api/v1/orders/1', {
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
  "message": "Order retrieved successfully",
  "data": {
    "id": 1,
    "service_spot_id": 5,
    "status": "abierta",
    "total_amount": 350.00,
    "tax_amount": 56.00,
    "created_by": "dependiente1",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 150.00,
        "total_price": 300.00,
        "notes": "Sin cebolla"
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 3,
        "quantity": 2,
        "price": 25.00,
        "total_price": 50.00,
        "notes": null
      }
    ],
    "created_at": "2025-05-12T12:30:00",
    "updated_at": null,
    "closed_at": null
  }
}
```

### Actualizar Orden

Actualiza una orden existente, incluyendo sus elementos.

- **URL**: `/{order_id}`
- **Método**: `PUT`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción                 |
|-----------|---------|-----------------------------|
| order_id  | integer | ID de la orden a actualizar |

#### Parámetros de solicitud

| Campo          | Tipo           | Requerido | Descripción                                   |
|----------------|----------------|-----------|-----------------------------------------------|
| service_spot_id| integer        | No        | ID del puesto de servicio actualizado         |
| status         | string         | No        | Estado actualizado                            |
| items          | array          | No        | Lista actualizada de elementos del pedido     |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/orders/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    status: "en_preparación",
    items: [
      {
        product_id: 1,
        quantity: 2,
        price: 150.00,
        notes: "Sin cebolla"
      },
      {
        product_id: 3,
        quantity: 3,  // Cambio de cantidad
        price: 25.00
      }
    ]
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.put('http://localhost:8000/api/v1/orders/1', {
  status: "en_preparación",
  items: [
    {
      product_id: 1,
      quantity: 2,
      price: 150.00,
      notes: "Sin cebolla"
    },
    {
      product_id: 3,
      quantity: 3,  // Cambio de cantidad
      price: 25.00
    }
  ]
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
  "message": "Order updated successfully",
  "data": {
    "id": 1,
    "service_spot_id": 5,
    "status": "en_preparación",
    "total_amount": 375.00,
    "tax_amount": 60.00,
    "created_by": "dependiente1",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 150.00,
        "total_price": 300.00,
        "notes": "Sin cebolla"
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 3,
        "quantity": 3,
        "price": 25.00,
        "total_price": 75.00,
        "notes": null
      }
    ],
    "created_at": "2025-05-12T12:30:00",
    "updated_at": "2025-05-12T12:45:30",
    "closed_at": null
  }
}
```

### Actualizar Estado de la Orden

Actualiza únicamente el estado de una orden existente.

- **URL**: `/{order_id}/status`
- **Método**: `PATCH`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción                        |
|-----------|---------|----------------------------------- |
| order_id  | integer | ID de la orden a actualizar estado |

#### Parámetros de solicitud

| Campo  | Tipo   | Requerido | Descripción                                                 |
|--------|--------|-----------|-------------------------------------------------------------|
| status | string | Sí        | Nuevo estado (abierta, en_preparación, servida, cobrada, cancelada) |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/orders/1/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    status: "servida"
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.patch('http://localhost:8000/api/v1/orders/1/status', {
  status: "servida"
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
  "message": "Order status updated to servida successfully",
  "data": {
    "id": 1,
    "service_spot_id": 5,
    "status": "servida",
    "total_amount": 375.00,
    "tax_amount": 60.00,
    "created_by": "dependiente1",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 150.00,
        "total_price": 300.00,
        "notes": "Sin cebolla"
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 3,
        "quantity": 3,
        "price": 25.00,
        "total_price": 75.00,
        "notes": null
      }
    ],
    "created_at": "2025-05-12T12:30:00",
    "updated_at": "2025-05-12T13:15:10",
    "closed_at": null
  }
}
```

### Eliminar Orden

Elimina una orden del sistema.

- **URL**: `/{order_id}`
- **Método**: `DELETE`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Admin, Soporte

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción               |
|-----------|---------|---------------------------|
| order_id  | integer | ID de la orden a eliminar |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/orders/1', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.delete('http://localhost:8000/api/v1/orders/1', {
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
  "message": "Order deleted successfully",
  "data": {
    "id": 1,
    "service_spot_id": 5,
    "status": "servida",
    "total_amount": 375.00,
    "tax_amount": 60.00,
    "created_by": "dependiente1",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 150.00,
        "total_price": 300.00,
        "notes": "Sin cebolla"
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 3,
        "quantity": 3,
        "price": 25.00,
        "total_price": 75.00,
        "notes": null
      }
    ],
    "created_at": "2025-05-12T12:30:00",
    "updated_at": "2025-05-12T13:15:10",
    "closed_at": null
  }
}
```

### Agregar Elemento a la Orden

Agrega un nuevo elemento a una orden existente.

- **URL**: `/{order_id}/items`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción                           |
|-----------|---------|---------------------------------------|
| order_id  | integer | ID de la orden a la que agregar elemento |

#### Parámetros de solicitud

| Campo     | Tipo    | Requerido | Descripción                         |
|-----------|---------|-----------|-------------------------------------|
| product_id| integer | Sí        | ID del producto                     |
| quantity  | integer | Sí        | Cantidad del producto               |
| price     | number  | Sí        | Precio unitario                     |
| notes     | string  | No        | Notas especiales para el producto   |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/orders/1/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    product_id: 5,
    quantity: 1,
    price: 120.00,
    notes: "Nivel de cocción: Término medio"
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.post('http://localhost:8000/api/v1/orders/1/items', {
  product_id: 5,
  quantity: 1,
  price: 120.00,
  notes: "Nivel de cocción: Término medio"
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
  "message": "Order item added successfully",
  "data": {
    "id": 1,
    "service_spot_id": 5,
    "status": "servida",
    "total_amount": 495.00,
    "tax_amount": 79.20,
    "created_by": "dependiente1",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 150.00,
        "total_price": 300.00,
        "notes": "Sin cebolla"
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 3,
        "quantity": 3,
        "price": 25.00,
        "total_price": 75.00,
        "notes": null
      },
      {
        "id": 3,
        "order_id": 1,
        "product_id": 5,
        "quantity": 1,
        "price": 120.00,
        "total_price": 120.00,
        "notes": "Nivel de cocción: Término medio"
      }
    ],
    "created_at": "2025-05-12T12:30:00",
    "updated_at": "2025-05-12T13:30:20",
    "closed_at": null
  }
}
```

### Eliminar Elemento de la Orden

Elimina un elemento de una orden existente.

- **URL**: `/{order_id}/items/{item_id}`
- **Método**: `DELETE`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Cualquier usuario autenticado

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción                  |
|-----------|---------|------------------------------|
| order_id  | integer | ID de la orden               |
| item_id   | integer | ID del elemento a eliminar   |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/orders/1/items/3', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.delete('http://localhost:8000/api/v1/orders/1/items/3', {
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
  "message": "Order item deleted successfully",
  "data": {
    "id": 1,
    "service_spot_id": 5,
    "status": "servida",
    "total_amount": 375.00,
    "tax_amount": 60.00,
    "created_by": "dependiente1",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 150.00,
        "total_price": 300.00,
        "notes": "Sin cebolla"
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 3,
        "quantity": 3,
        "price": 25.00,
        "total_price": 75.00,
        "notes": null
      }
    ],
    "created_at": "2025-05-12T12:30:00",
    "updated_at": "2025-05-12T13:35:15",
    "closed_at": null
  }
}
```

## Estados de las Órdenes

Los estados posibles para una orden son:

| Estado          | Descripción                                                     |
|-----------------|-----------------------------------------------------------------|
| abierta         | Orden recién creada, aún no enviada a cocina                    |
| en_preparación  | Orden enviada a cocina, en proceso de preparación               |
| servida         | Orden preparada y servida al cliente                            |
| cobrada         | Orden pagada y cerrada                                          |
| cancelada       | Orden cancelada (no se procesará)                               |

## Manejo de Errores Comunes

| Código HTTP | Descripción                    | Posible Causa                                     |
|-------------|--------------------------------|---------------------------------------------------|
| 400         | Bad Request                    | Datos de entrada inválidos, estado inválido       |
| 401         | Unauthorized                   | Token de autenticación faltante o inválido        |
| 403         | Forbidden                      | Permisos insuficientes para la operación          |
| 404         | Not Found                      | Orden o elemento de orden no encontrado           |
| 500         | Internal Server Error          | Error del servidor al procesar la solicitud       |

## Recomendaciones para Frontend

- Implementar flujos de trabajo para cada estado de orden
- Utilizar notificaciones en tiempo real para cambios en las órdenes (WebSockets)
- Desarrollar interfaces específicas para diferentes roles (camareros, cocina, caja)
- Considerar los cálculos de totales y impuestos en cliente y servidor
