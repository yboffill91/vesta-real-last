---
trigger: manual
---

# Api orders

## Get Orders

http://localhost:8000/api/v1/orders/

### Response

#### 200

```json
{
  "status": "success",
  "message": "",
  "data": [
    {
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "id": 0,
      "service_spot_id": 0,
      "sales_area_id": 0,
      "menu_id": 0,
      "status": "abierta",
      "total_amount": 0,
      "tax_amount": 0,
      "created_by": 0,
      "closed_by": 0,
      "closed_at": "2019-08-24T14:15:22Z"
    }
  ]
}
```

#### 422

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

## POST Orders

http://localhost:8000/api/v1/orders/

### Request

{
"service_spot_id": 0,
"sales_area_id": 0,
"menu_id": 0,
"status": "abierta",
"created_by": 0
}

### Response

#### 200

{
"status": "success",
"message": "",
"data": {
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"id": 0,
"service_spot_id": 0,
"sales_area_id": 0,
"menu_id": 0,
"status": "abierta",
"total_amount": 0,
"tax_amount": 0,
"created_by": 0,
"closed_by": 0,
"closed_at": "2019-08-24T14:15:22Z"
}
}

#### 422

{
"detail": [
{
"loc": [
"string"
],
"msg": "string",
"type": "string"
}
]
}

## GET Order by id

http://localhost:8000/api/v1/orders/{order_id}

### Response

#### 200

{
"status": "success",
"message": "",
"data": {
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"id": 0,
"service_spot_id": 0,
"sales_area_id": 0,
"menu_id": 0,
"status": "abierta",
"total_amount": 0,
"tax_amount": 0,
"created_by": 0,
"closed_by": 0,
"closed_at": "2019-08-24T14:15:22Z"
}
}

#### 422

{
"detail": [
{
"loc": [
"string"
],
"msg": "string",
"type": "string"
}
]
}

## PUT Order by id

http://localhost:8000/api/v1/orders/{order_id}

### Request

{
"status": "string"
}

### Response

#### 200

{
"status": "success",
"message": "",
"data": {
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"id": 0,
"service_spot_id": 0,
"sales_area_id": 0,
"menu_id": 0,
"status": "abierta",
"total_amount": 0,
"tax_amount": 0,
"created_by": 0,
"closed_by": 0,
"closed_at": "2019-08-24T14:15:22Z"
}
}

#### 422

{
"detail": [
{
"loc": [
"string"
],
"msg": "string",
"type": "string"
}
]
}

## DELETE Order by id

http://localhost:8000/api/v1/orders/{order_id}

### Resonse

#### 200

{
"status": "success",
"message": "",
"data": {
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"id": 0,
"service_spot_id": 0,
"sales_area_id": 0,
"menu_id": 0,
"status": "abierta",
"total_amount": 0,
"tax_amount": 0,
"created_by": 0,
"closed_by": 0,
"closed_at": "2019-08-24T14:15:22Z"
}
}

#### 422

{
"detail": [
{
"loc": [
"string"
],
"msg": "string",
"type": "string"
}
]
}

## PATCH Order by id

http://localhost:8000/api/v1/orders/{order_id}/status

### Request

{
"status": "string",
"closed_by": 0
}

### Response

#### 200

{
"status": "success",
"message": "",
"data": {
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"id": 0,
"service_spot_id": 0,
"sales_area_id": 0,
"menu_id": 0,
"status": "abierta",
"total_amount": 0,
"tax_amount": 0,
"created_by": 0,
"closed_by": 0,
"closed_at": "2019-08-24T14:15:22Z"
}
}

#### 422

{
"detail": [
{
"loc": [
"string"
],
"msg": "string",
"type": "string"
}
]
}

## POST Order items

http://localhost:8000/api/v1/orders/{order_id}/items

## PAYLOAD

{
"order_id": 0,
"product_id": 0,
"quantity": 0,
"unit_price": 0,
"notes": "string",
"status": "pendiente",
"total_price": 0
}

### Response

#### 200

{
"status": "success",
"message": "",
"data": {
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"id": 0,
"service_spot_id": 0,
"sales_area_id": 0,
"menu_id": 0,
"status": "abierta",
"total_amount": 0,
"tax_amount": 0,
"created_by": 0,
"closed_by": 0,
"closed_at": "2019-08-24T14:15:22Z"
}
}

#### 422

{
"detail": [
{
"loc": [
"string"
],
"msg": "string",
"type": "string"
}
]
}

## DELETE Order item

http://localhost:8000/api/v1/orders/{order_id}/items/{item_id}

### Response

#### 200

{
"status": "success",
"message": "",
"data": {
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"id": 0,
"service_spot_id": 0,
"sales_area_id": 0,
"menu_id": 0,
"status": "abierta",
"total_amount": 0,
"tax_amount": 0,
"created_by": 0,
"closed_by": 0,
"closed_at": "2019-08-24T14:15:22Z"
}
}

#### 422

{
"detail": [
{
"loc": [
"string"
],
"msg": "string",
"type": "string"
}
]
}
