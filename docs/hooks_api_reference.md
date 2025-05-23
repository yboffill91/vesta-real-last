# Documentación de Custom Hooks – Frontend Vesta

Esta documentación describe cada custom hook creado para consumir los endpoints del backend de Vesta, incluyendo:
- Descripción del hook y endpoint
- Datos esperados en headers y body
- Ejemplo práctico de uso

---

## 1. Autenticación

### useLogin
- **Endpoint:** `POST /api/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
- **Descripción:** Realiza login clásico y obtiene token y datos de usuario.
- **Ejemplo de uso:**
```tsx
import { useLogin } from "@/hooks/useLogin";

const { login, loading, error, data } = useLogin();

const onSubmit = async (values) => {
  try {
    const response = await login(values); // { username, password }
    // Manejar login exitoso
  } catch (err) {
    // Manejar error
  }
};
```

---

### useTokenLogin
- **Endpoint:** `POST /api/auth/token`
- **Headers:**
  - `Content-Type: application/x-www-form-urlencoded`
- **Body:**
```
username=string&password=string
```
- **Descripción:** Login compatible OAuth2 (password flow), retorna access token.
- **Ejemplo de uso:**
```tsx
import { useTokenLogin } from "@/hooks/useTokenLogin";

const { loginWithToken, loading, error, data } = useTokenLogin();

const onSubmit = async (values) => {
  await loginWithToken(values); // { username, password }
};
```

---

## 2. Productos

### useProduct
- **Endpoint:** `GET /api/products/{productId}`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Descripción:** Obtiene el detalle de un producto.
- **Ejemplo de uso:**
```tsx
import { useProduct } from "@/hooks/useProduct";

const { fetchProduct, loading, error, data } = useProduct();

useEffect(() => {
  fetchProduct(1); // id del producto
}, []);
```

---

### useCreateProduct
- **Endpoint:** `POST /api/products`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": number,
  "image": "string",
  "category_id": number,
  ...
}
```
- **Descripción:** Crea un producto.
- **Ejemplo de uso:**
```tsx
import { useCreateProduct } from "@/hooks/useCreateProduct";

const { createProduct, loading, error, data } = useCreateProduct();

const onSubmit = async (values) => {
  await createProduct(values);
};
```

---

### useDeleteProduct
- **Endpoint:** `DELETE /api/products/{productId}`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Descripción:** Elimina un producto.
- **Ejemplo de uso:**
```tsx
import { useDeleteProduct } from "@/hooks/useDeleteProduct";

const { deleteProduct, loading, error, data } = useDeleteProduct();

const handleDelete = async (id) => {
  await deleteProduct(id);
};
```

---

### useSearchProducts
- **Endpoint:** `GET /api/products/search/{query}`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Descripción:** Busca productos por nombre o descripción.
- **Ejemplo de uso:**
```tsx
import { useSearchProducts } from "@/hooks/useSearchProducts";

const { searchProducts, loading, error, data } = useSearchProducts();

const handleSearch = async (query) => {
  await searchProducts(query);
};
```

---

### useProductCategories
- **Endpoint:** `GET /api/categories`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Descripción:** Obtiene todas las categorías de productos.
- **Ejemplo de uso:**
```tsx
import { useProductCategories } from "@/hooks/useProductCategories";

const { loading, error, data } = useProductCategories();
```

---

## 3. Menús

### useMenu
- **Endpoint:** `GET /api/menus/{menuId}`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Descripción:** Obtiene el detalle de un menú.
- **Ejemplo de uso:**
```tsx
import { useMenu } from "@/hooks/useMenu";

const { fetchMenu, loading, error, data } = useMenu();

useEffect(() => {
  fetchMenu(1);
}, []);
```

---

### useUpdateMenu
- **Endpoint:** `PUT /api/menus/{menuId}`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "string",
  "description": "string",
  ...
}
```
- **Descripción:** Actualiza un menú.
- **Ejemplo de uso:**
```tsx
import { useUpdateMenu } from "@/hooks/useUpdateMenu";

const { updateMenu, loading, error, data } = useUpdateMenu();

const onSubmit = async (menuId, values) => {
  await updateMenu(menuId, values);
};
```

---

## 4. Órdenes

### useOrder
- **Endpoint:** `GET /api/orders/{orderId}`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Descripción:** Obtiene el detalle de una orden.
- **Ejemplo de uso:**
```tsx
import { useOrder } from "@/hooks/useOrder";

const { fetchOrder, loading, error, data } = useOrder();

useEffect(() => {
  fetchOrder(1);
}, []);
```

---

### useOrders
- **Endpoint:** `GET /api/orders`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query params:**
  - `status`, `service_spot_id`, `date_from`, `date_to`, `page`, `limit`, ...
- **Descripción:** Lista órdenes con filtros.
- **Ejemplo de uso:**
```tsx
import { useOrders } from "@/hooks/useOrders";

const { fetchOrders, loading, error, data } = useOrders();

useEffect(() => {
  fetchOrders({ status: "pending", page: 1 });
}, []);
```

---

### useCreateOrder
- **Endpoint:** `POST /api/orders`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body:**
```json
{
  "service_spot_id": number,
  "items": [...],
  ...
}
```
- **Descripción:** Crea una orden.
- **Ejemplo de uso:**
```tsx
import { useCreateOrder } from "@/hooks/useCreateOrder";

const { createOrder, loading, error, data } = useCreateOrder();

const onSubmit = async (values) => {
  await createOrder(values);
};
```

---

### useUpdateOrder
- **Endpoint:** `PUT /api/orders/{orderId}`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body:**
```json
{
  ... // Campos de la orden a actualizar
}
```
- **Descripción:** Actualiza una orden existente.
- **Ejemplo de uso:**
```tsx
import { useUpdateOrder } from "@/hooks/useUpdateOrder";

const { updateOrder, loading, error, data } = useUpdateOrder();

const onSubmit = async (orderId, values) => {
  await updateOrder(orderId, values);
};
```

---

### useUpdateOrderStatus
- **Endpoint:** `PATCH /api/orders/{orderId}/status`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body:**
```json
{
  "status": "string"
}
```
- **Descripción:** Cambia el estado de una orden.
- **Ejemplo de uso:**
```tsx
import { useUpdateOrderStatus } from "@/hooks/useUpdateOrderStatus";

const { updateOrderStatus, loading, error, data } = useUpdateOrderStatus();

const onChangeStatus = async (orderId, status) => {
  await updateOrderStatus(orderId, { status });
};
```

---

### useAddOrderItem
- **Endpoint:** `POST /api/orders/{orderId}/items`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body:**
```json
{
  "product_id": number,
  "quantity": number,
  ...
}
```
- **Descripción:** Añade un ítem a una orden.
- **Ejemplo de uso:**
```tsx
import { useAddOrderItem } from "@/hooks/useAddOrderItem";

const { addOrderItem, loading, error, data } = useAddOrderItem();

const onAddItem = async (orderId, item) => {
  await addOrderItem(orderId, item);
};
```

---

### useDeleteOrderItem
- **Endpoint:** `DELETE /api/orders/{orderId}/items/{itemId}`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Descripción:** Elimina un ítem de una orden.
- **Ejemplo de uso:**
```tsx
import { useDeleteOrderItem } from "@/hooks/useDeleteOrderItem";

const { deleteOrderItem, loading, error, data } = useDeleteOrderItem();

const onDelete = async (orderId, itemId) => {
  await deleteOrderItem(orderId, itemId);
};
```

---

## 5. Configuración

### useConfig
- **Endpoint:** `GET /api/config`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Descripción:** Obtiene la configuración general del sistema.
- **Ejemplo de uso:**
```tsx
import { useConfig } from "@/hooks/useConfig";

const { loading, error, data } = useConfig();
```

---

## 6. Áreas de Venta

### useSalesAreaDetail
- **Endpoint:** `GET /api/sales_areas/{areaId}`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Descripción:** Obtiene el detalle de un área de venta.
- **Ejemplo de uso:**
```tsx
import { useSalesAreaDetail } from "@/hooks/useSalesAreaDetail";

const { fetchSalesArea, loading, error, data } = useSalesAreaDetail();

useEffect(() => {
  fetchSalesArea(1);
}, []);
```

---

## Notas generales
- Todos los hooks devuelven `{ loading, error, data, ...func }`.
- Todos los endpoints requieren autenticación (`Authorization: Bearer <token>`) salvo login/token.
- Para formularios, se recomienda integrar estos hooks con `react-hook-form` y la estructura `{...methods}` en el componente FormProvider.

---

Para dudas adicionales, consulta los archivos fuente en `/frontend/src/hooks` o la documentación de backend.
