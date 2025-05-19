# Guía de Endpoints API VestaSys

Esta guía documenta los principales endpoints del backend de VestaSys, los datos que espera cada uno, el verbo HTTP utilizado, y observaciones sobre consistencia de datos. Al final se incluye una tabla resumen.

---

## Secciones por recurso

### 1. Autenticación (`/api/v1/auth`)

#### POST `/login`
- **Descripción:** Autentica un usuario y retorna un token JWT.
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "string",
    "token_type": "bearer",
    "user": { ...UserResponse }
  }
  ```

#### POST `/token`
- **Descripción:** Login OAuth2 (form-data).
- **Body:**
  - `username`: string
  - `password`: string
- **Response:**
  ```json
  {
    "access_token": "string",
    "token_type": "bearer"
  }
  ```

---

### 2. Usuarios (`/api/v1/users`)

#### GET `/`
- **Descripción:** Lista usuarios (paginación y búsqueda opcional).
- **Query:** `skip`, `limit`, `search`
- **Response:**
  ```json
  {
    "status": "success",
    "data": [ ...UserResponse ]
  }
  ```

#### POST `/`
- **Descripción:** Crea usuario.
- **Body:**
  ```json
  {
    "name": "string",
    "surname": "string",
    "username": "string",
    "password": "string",
    "role": "Soporte|Administrador|Dependiente"
  }
  ```
- **Response:** UserDetailResponse

#### GET `/me`
- **Descripción:** Usuario autenticado actual.
- **Response:** UserDetailResponse

#### GET `/[user_id]`, PUT `/[user_id]`, DELETE `/[user_id]`
- **Descripción:** Operaciones CRUD sobre usuario específico.
- **Body (PUT):** UserUpdate (campos opcionales)
- **Response:** UserDetailResponse

---

### 3. Establecimiento (`/api/v1/establishment`)

#### GET `/`
- **Descripción:** Obtiene la configuración del establecimiento.
- **Response:** EstablishmentDetailResponse

#### POST `/`, PUT `/`
- **Descripción:** Crea o actualiza la configuración.
- **Body:**
  ```json
  {
    "name": "string",
    "address": "string",
    "phone": "string",
    "tax_rate": "float",
    "currency": "string",
    "logo_url": "string (opcional)"
  }
  ```
- **Response:** EstablishmentDetailResponse

---

### 4. Menús (`/api/v1/menus`)

#### GET `/`
- **Descripción:** Lista menús (puede filtrar por área de venta o activos).
- **Query:** `active_only`, `sales_area_id`
- **Response:** MenusResponse

#### POST `/`
- **Descripción:** Crea menú.
- **Body:** MenuCreate
- **Response:** MenuDetailResponse

#### GET `/[menu_id]`, PUT `/[menu_id]`, DELETE `/[menu_id]`
- **Descripción:** CRUD sobre menú específico.
- **Body (PUT):** MenuUpdate
- **Response:** MenuDetailResponse

#### POST `/[menu_id]/assign`
- **Descripción:** Asigna menú a áreas de venta.
- **Query:** `sales_area_ids[]`
- **Response:** Mensaje de éxito

---

### 5. Productos (`/api/v1/products`)

#### GET `/`
- **Descripción:** Lista productos (filtros: categoría, disponibilidad).
- **Query:** `skip`, `limit`, `category_id`, `available_only`
- **Response:** ProductsResponse

#### POST `/`
- **Descripción:** Crea producto.
- **Body:** ProductCreate
- **Response:** ProductDetailResponse

#### GET `/[product_id]`, PUT `/[product_id]`, DELETE `/[product_id]`
- **Descripción:** CRUD sobre producto específico.
- **Body (PUT):** ProductUpdate
- **Response:** ProductDetailResponse

#### GET `/search/{query}`
- **Descripción:** Busca productos por nombre o descripción.
- **Response:** ProductSearchResponse

#### GET `/categories/`
- **Descripción:** Lista categorías de productos.
- **Response:** ProductsResponse (lista de categorías)

---

### 6. Órdenes (`/api/v1/orders`)

#### GET `/`
- **Descripción:** Lista órdenes (filtros: status, spot, fechas, paginación).
- **Query:** `status`, `service_spot_id`, `date_from`, `date_to`, `page`, `limit`
- **Response:** OrdersResponse

#### POST `/`
- **Descripción:** Crea orden.
- **Body:** OrderCreate
- **Response:** OrderDetailResponse

#### GET `/[order_id]`, PUT `/[order_id]`, DELETE `/[order_id]`
- **Descripción:** CRUD sobre orden específica.
- **Body (PUT):** OrderUpdate
- **Response:** OrderDetailResponse

#### PUT `/[order_id]/status`
- **Descripción:** Cambia status de la orden.
- **Body:** OrderStatusUpdate
- **Response:** OrderDetailResponse

#### POST `/[order_id]/items`
- **Descripción:** Agrega item a orden.
- **Body:** OrderItemCreate
- **Response:** OrderDetailResponse

#### DELETE `/[order_id]/items/[item_id]`
- **Descripción:** Elimina item de orden.
- **Response:** OrderDetailResponse

---

### 7. Service Spots (`/api/v1/service-spots`)

#### GET `/`
- **Descripción:** Lista service spots (filtros: área, status, activos).
- **Query:** `sales_area_id`, `status`, `active_only`
- **Response:** ServiceSpotsResponse

#### POST `/`
- **Descripción:** Crea service spot.
- **Body:** ServiceSpotCreate
- **Response:** ServiceSpotDetailResponse

#### GET `/[spot_id]`, PUT `/[spot_id]`, DELETE `/[spot_id]`
- **Descripción:** CRUD sobre service spot específico.
- **Body (PUT):** ServiceSpotUpdate
- **Response:** ServiceSpotDetailResponse

#### PUT `/[spot_id]/status`
- **Descripción:** Cambia status del spot.
- **Body:** ServiceSpotStatusUpdate
- **Response:** ServiceSpotDetailResponse

#### POST `/reset-all`
- **Descripción:** Resetea todos los spots a 'libre'.
- **Response:** Mensaje de éxito

---

### 8. Sales Areas (`/api/v1/sales-areas`)

#### GET `/`
- **Descripción:** Lista áreas de venta.
- **Query:** `active_only`, `establishment_id`
- **Response:** SalesAreasResponse

#### POST `/`
- **Descripción:** Crea área de venta.
- **Body:** SalesAreaCreate
- **Response:** SalesAreaDetailResponse

#### GET `/[area_id]`, PUT `/[area_id]`, DELETE `/[area_id]`
- **Descripción:** CRUD sobre área de venta específica.
- **Body (PUT):** SalesAreaUpdate
- **Response:** SalesAreaDetailResponse

#### GET `/[area_id]/with-spots`
- **Descripción:** Área de venta con sus spots.
- **Response:** SalesAreaWithSpotsDetailResponse

---

### 9. Categorías (`/api/v1/categories`)

#### GET `/`
- **Descripción:** Lista categorías de productos.
- **Query:** `active_only`
- **Response:** ProductCategoriesResponse

#### POST `/`
- **Descripción:** Crea categoría.
- **Body:** ProductCategoryCreate
- **Response:** ProductCategoryDetailResponse

#### GET `/[category_id]`, PUT `/[category_id]`, DELETE `/[category_id]`
- **Descripción:** CRUD sobre categoría específica.
- **Body (PUT):** ProductCategoryUpdate
- **Response:** ProductCategoryDetailResponse

#### GET `/[category_id]/with-products`
- **Descripción:** Categoría con sus productos.
- **Response:** ProductCategoryWithProductsDetailResponse

---

## Tabla resumen de endpoints

| Recurso          | Método | Ruta                                 | Body/Params                | Descripción breve                  |
|------------------|--------|--------------------------------------|----------------------------|------------------------------------|
| Auth             | POST   | /api/v1/auth/login                   | LoginRequest               | Login y token JWT                  |
| Auth             | POST   | /api/v1/auth/token                   | username, password (form)  | Login OAuth2                       |
| Users            | GET    | /api/v1/users/                       | skip, limit, search        | Listar usuarios                    |
| Users            | POST   | /api/v1/users/                       | UserCreate                 | Crear usuario                      |
| Users            | GET    | /api/v1/users/{id}                   | id                         | Obtener usuario                    |
| Users            | PUT    | /api/v1/users/{id}                   | UserUpdate                 | Actualizar usuario                 |
| Users            | DELETE | /api/v1/users/{id}                   | id                         | Eliminar usuario                   |
| Users            | GET    | /api/v1/users/me                     | -                          | Usuario autenticado                |
| Establishment    | GET    | /api/v1/establishment/               | -                          | Obtener configuración              |
| Establishment    | POST   | /api/v1/establishment/               | EstablishmentCreate         | Crear configuración                |
| Establishment    | PUT    | /api/v1/establishment/               | EstablishmentUpdate         | Actualizar configuración           |
| Menus            | GET    | /api/v1/menus/                       | active_only, sales_area_id | Listar menús                       |
| Menus            | POST   | /api/v1/menus/                       | MenuCreate                 | Crear menú                         |
| Menus            | GET    | /api/v1/menus/{id}                   | id                         | Obtener menú                       |
| Menus            | PUT    | /api/v1/menus/{id}                   | MenuUpdate                 | Actualizar menú                    |
| Menus            | DELETE | /api/v1/menus/{id}                   | id                         | Eliminar menú                      |
| Menus            | POST   | /api/v1/menus/{id}/assign            | sales_area_ids[]           | Asignar menú a áreas               |
| Products         | GET    | /api/v1/products/                    | skip, limit, etc           | Listar productos                   |
| Products         | POST   | /api/v1/products/                    | ProductCreate              | Crear producto                     |
| Products         | GET    | /api/v1/products/{id}                | id                         | Obtener producto                   |
| Products         | PUT    | /api/v1/products/{id}                | ProductUpdate              | Actualizar producto                |
| Products         | DELETE | /api/v1/products/{id}                | id                         | Eliminar producto                  |
| Products         | GET    | /api/v1/products/search/{query}      | query                      | Buscar productos                   |
| Products         | GET    | /api/v1/products/categories/         | -                          | Listar categorías                  |
| Orders           | GET    | /api/v1/orders/                      | status, spot, paginación   | Listar órdenes                     |
| Orders           | POST   | /api/v1/orders/                      | OrderCreate                | Crear orden                        |
| Orders           | GET    | /api/v1/orders/{id}                  | id                         | Obtener orden                      |
| Orders           | PUT    | /api/v1/orders/{id}                  | OrderUpdate                | Actualizar orden                   |
| Orders           | DELETE | /api/v1/orders/{id}                  | id                         | Eliminar orden                     |
| Orders           | PUT    | /api/v1/orders/{id}/status           | OrderStatusUpdate          | Cambiar status de orden            |
| Orders           | POST   | /api/v1/orders/{id}/items            | OrderItemCreate            | Agregar item a orden               |
| Orders           | DELETE | /api/v1/orders/{id}/items/{item_id}  | item_id                    | Eliminar item de orden             |
| Service Spots    | GET    | /api/v1/service-spots/               | filtros                    | Listar service spots               |
| Service Spots    | POST   | /api/v1/service-spots/               | ServiceSpotCreate          | Crear service spot                 |
| Service Spots    | GET    | /api/v1/service-spots/{id}           | id                         | Obtener service spot               |
| Service Spots    | PUT    | /api/v1/service-spots/{id}           | ServiceSpotUpdate          | Actualizar service spot            |
| Service Spots    | DELETE | /api/v1/service-spots/{id}           | id                         | Eliminar service spot              |
| Service Spots    | PUT    | /api/v1/service-spots/{id}/status    | ServiceSpotStatusUpdate    | Cambiar status de spot             |
| Service Spots    | POST   | /api/v1/service-spots/reset-all      | -                          | Resetear todos los spots           |
| Sales Areas      | GET    | /api/v1/sales-areas/                 | filtros                    | Listar áreas de venta              |
| Sales Areas      | POST   | /api/v1/sales-areas/                 | SalesAreaCreate            | Crear área de venta                |
| Sales Areas      | GET    | /api/v1/sales-areas/{id}             | id                         | Obtener área de venta              |
| Sales Areas      | PUT    | /api/v1/sales-areas/{id}             | SalesAreaUpdate            | Actualizar área de venta           |
| Sales Areas      | DELETE | /api/v1/sales-areas/{id}             | id                         | Eliminar área de venta             |
| Sales Areas      | GET    | /api/v1/sales-areas/{id}/with-spots  | id                         | Área de venta con spots            |
| Categories       | GET    | /api/v1/categories/                  | active_only                | Listar categorías                  |
| Categories       | POST   | /api/v1/categories/                  | ProductCategoryCreate      | Crear categoría                    |
| Categories       | GET    | /api/v1/categories/{id}              | id                         | Obtener categoría                  |
| Categories       | PUT    | /api/v1/categories/{id}              | ProductCategoryUpdate      | Actualizar categoría               |
| Categories       | DELETE | /api/v1/categories/{id}              | id                         | Eliminar categoría                 |
| Categories       | GET    | /api/v1/categories/{id}/with-products| id                         | Categoría con productos            |

---

> **Nota:** Los esquemas de datos (schemas) usados en los endpoints están en la carpeta `app/schemas/` y son consistentes con los datos esperados por cada endpoint según la revisión realizada. Si se detecta alguna inconsistencia puntual, se documentará en una sección aparte.
