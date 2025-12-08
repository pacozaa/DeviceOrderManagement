# API Documentation

> 💡 **Interactive Documentation Available!**  
> For a better experience, try the interactive Swagger UI documentation at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)  
> You can explore all endpoints, view schemas, and test API calls directly from your browser.

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

---

### 2. Verify Order

Verify an order without submitting it. This allows sales reps to check pricing, discounts, and shipping costs before committing to an order.

**Endpoint:** `POST /api/orders/verify`

**Request Body:**
```json
{
  "quantity": 50,
  "shippingAddress": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Request Parameters:**
- `quantity` (number, required): Number of devices to order (must be positive integer)
- `shippingAddress` (object, required):
  - `latitude` (number, required): Latitude coordinate (-90 to 90)
  - `longitude` (number, required): Longitude coordinate (-180 to 180)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "quantity": 50,
    "subtotal": 7500,
    "discount": 0.1,
    "discountAmount": 750,
    "shippingCost": 234.56,
    "total": 6984.56,
    "allocations": [
      {
        "warehouseId": "uuid-here",
        "warehouseName": "New York",
        "quantity": 50,
        "distance": 643.2,
        "shippingCost": 234.56
      }
    ],
    "isValid": true
  }
}
```

**Invalid Order Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "quantity": 50,
    "subtotal": 7500,
    "discount": 0.1,
    "discountAmount": 750,
    "shippingCost": 1500,
    "total": 8250,
    "allocations": [...],
    "isValid": false,
    "invalidReason": "Shipping cost ($1500.00) exceeds 15% of order amount ($1012.50)"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Validation error: body.quantity: Number must be greater than 0"
}
```

---

### 3. Submit Order

Create and submit an order. This will immediately update warehouse inventory.

**Endpoint:** `POST /api/orders`

**Request Body:**
```json
{
  "quantity": 50,
  "shippingAddress": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Request Parameters:**
- `quantity` (number, required): Number of devices to order (must be positive integer)
- `shippingAddress` (object, required):
  - `latitude` (number, required): Latitude coordinate (-90 to 90)
  - `longitude` (number, required): Longitude coordinate (-180 to 180)

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-1702034567890-123",
    "quantity": 50,
    "subtotal": 7500,
    "discount": 0.1,
    "discountAmount": 750,
    "shippingCost": 234.56,
    "total": 6984.56,
    "allocations": [
      {
        "warehouseId": "uuid-here",
        "warehouseName": "New York",
        "quantity": 50,
        "distance": 643.2,
        "shippingCost": 234.56
      }
    ]
  }
}
```

**Error Responses:**

*Validation Error (400 Bad Request):*
```json
{
  "error": "Validation error: body.quantity: Number must be greater than 0"
}
```

*Invalid Order (400 Bad Request):*
```json
{
  "error": "Shipping cost ($1500.00) exceeds 15% of order amount ($1012.50)"
}
```

*Insufficient Stock (400 Bad Request):*
```json
{
  "error": "Insufficient stock available"
}
```

---

### 4. Get Order Details

Retrieve details of a submitted order by its order number.

**Endpoint:** `GET /api/orders/:orderNumber`

**Path Parameters:**
- `orderNumber` (string, required): The unique order number (e.g., "ORD-1702034567890-123")

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-1702034567890-123",
    "quantity": 50,
    "shippingLatitude": 40.7128,
    "shippingLongitude": -74.006,
    "subtotal": 7500,
    "discount": 0.1,
    "discountAmount": 750,
    "shippingCost": 234.56,
    "total": 6984.56,
    "status": "completed",
    "createdAt": "2025-12-08T10:30:00.000Z",
    "updatedAt": "2025-12-08T10:30:00.000Z",
    "allocations": [
      {
        "id": "allocation-uuid",
        "orderId": "550e8400-e29b-41d4-a716-446655440000",
        "warehouseId": "warehouse-uuid",
        "quantity": 50,
        "shippingCost": 234.56,
        "createdAt": "2025-12-08T10:30:00.000Z",
        "warehouse": {
          "id": "warehouse-uuid",
          "name": "New York",
          "latitude": 40.639722,
          "longitude": -73.778889,
          "stock": 528,
          "createdAt": "2025-12-08T10:00:00.000Z",
          "updatedAt": "2025-12-08T10:30:00.000Z"
        }
      }
    ]
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Order not found"
}
```

---

### 5. Get All Warehouses

Retrieve a list of all warehouses with their current stock levels.

**Endpoint:** `GET /api/orders/warehouses/list`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Los Angeles",
      "latitude": 33.9425,
      "longitude": -118.408056,
      "stock": 355,
      "createdAt": "2025-12-08T10:00:00.000Z",
      "updatedAt": "2025-12-08T10:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "name": "New York",
      "latitude": 40.639722,
      "longitude": -73.778889,
      "stock": 578,
      "createdAt": "2025-12-08T10:00:00.000Z",
      "updatedAt": "2025-12-08T10:00:00.000Z"
    }
  ]
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource successfully created
- `400 Bad Request`: Invalid request parameters or validation error
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Unexpected server error

---

## Business Rules

### Pricing
- **Base Price**: $150 per device
- **Volume Discounts**:
  - 25-49 units: 5% discount
  - 50-99 units: 10% discount
  - 100-249 units: 15% discount
  - 250+ units: 20% discount

### Shipping
- **Rate**: $0.01 per kilogram per kilometer
- **Device Weight**: 0.365 kg
- **Maximum**: Shipping cost cannot exceed 15% of the order amount (after discount)
- **Multi-warehouse**: Orders can be fulfilled from multiple warehouses to optimize cost

### Allocation Algorithm
1. Calculate distance from each warehouse to shipping address
2. Sort warehouses by shipping cost (lowest first)
3. Allocate from cheapest warehouse until stock depleted
4. Move to next cheapest warehouse if more units needed
5. Validate total shipping cost doesn't exceed 15% threshold

---

## Example Workflows

### Example 1: Simple Order Verification

**Request:**
```bash
curl -X POST http://localhost:3000/api/orders/verify \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10,
    "shippingAddress": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'
```

### Example 2: Large Order with Discount

**Request:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 100,
    "shippingAddress": {
      "latitude": 51.5074,
      "longitude": -0.1278
    }
  }'
```

### Example 3: Retrieve Order

**Request:**
```bash
curl http://localhost:3000/api/orders/ORD-1702034567890-123
```

### Example 4: Check Warehouse Stock

**Request:**
```bash
curl http://localhost:3000/api/orders/warehouses/list
```
