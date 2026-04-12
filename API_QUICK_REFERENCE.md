# API Quick Reference & Test Examples

## Environment Setup

### For Local Testing
Use the base URL: `http://localhost:5000` (adjust port based on your `launchSettings.json`)

### For Postman/Insomnia
1. Import these examples
2. Replace `{sessionId}` with actual session IDs
3. Replace `{jwt_token}` with actual JWT tokens from login endpoint

---

## Authentication Setup

### Get JWT Token (login)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (save the token):**
```json
{
  "isSuccess": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Cart Management Quick Reference

### 1. Get Cart (Authenticated User)
```http
GET /api/cart
Authorization: Bearer {jwt_token}
```

### 2. Get Cart (Guest)
```http
GET /api/cart?sessionId=session-123
```

### 3. Add Item to Cart
```http
POST /api/cart/add-item?sessionId=session-123
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

### 4. Update Item Quantity
```http
PUT /api/cart/update-item?sessionId=session-123
Content-Type: application/json

{
  "cartItemId": 5,
  "newQuantity": 3
}
```

### 5. Remove Item from Cart
```http
DELETE /api/cart/remove-item/5?sessionId=session-123
```

### 6. Clear Entire Cart
```http
DELETE /api/cart/clear?sessionId=session-123
```

### 7. Get Cart Item Count
```http
GET /api/cart/count?sessionId=session-123
```

### 8. Validate Cart Inventory
```http
POST /api/cart/validate-inventory
Content-Type: application/json

{
  "cartId": 1
}
```

---

## Checkout & Orders Quick Reference

### 1. Calculate Order Summary
```http
POST /api/checkout/calculate-summary
Content-Type: application/json

{
  "cartId": 1,
  "promoCode": "WELCOME10"
}
```

**Response:**
```json
{
  "isSuccess": true,
  "data": {
    "subTotal": 199.99,
    "discountAmount": 20.00,
    "appliedPromoCode": "WELCOME10",
    "taxAmount": 18.00,
    "shippingCost": 0.00,
    "total": 197.99
  }
}
```

### 2. Validate Promo Code
```http
POST /api/checkout/validate-promo
Content-Type: application/json

{
  "promoCode": "SAVE20",
  "subtotal": 150.00
}
```

### 3. User Checkout (Authenticated)
```http
POST /api/checkout/user-checkout
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main Street, Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "phoneNumber": "+1 (212) 555-1234",
  "paymentMethod": "CreditCard",
  "promoCode": "WELCOME10",
  "orderNotes": "Please leave at door"
}
```

**Response:**
```json
{
  "isSuccess": true,
  "message": "Order created successfully",
  "data": {
    "id": 25,
    "status": "Confirmed",
    "totalPrice": 197.99,
    "discountAmount": 20.00,
    "taxAmount": 18.00,
    "shippingCost": 0.00,
    "paymentMethod": "CreditCard",
    "createdAt": "2025-04-12T10:30:00Z",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productName": "Beautiful Dress",
        "priceAtPurchase": 99.99,
        "quantity": 2
      }
    ]
  }
}
```

### 4. Guest Checkout
```http
POST /api/checkout/guest-checkout?sessionId=session-123
Content-Type: application/json

{
  "email": "customer@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "address": "456 Oak Avenue",
  "city": "Los Angeles",
  "state": "CA",
  "postalCode": "90001",
  "country": "USA",
  "phoneNumber": "+1 (213) 555-5678",
  "paymentMethod": "PayPal",
  "promoCode": "SAVE20",
  "orderNotes": "Gift - luxury packaging preferred"
}
```

### 5. Get My Orders (Authenticated)
```http
GET /api/checkout/my-orders
Authorization: Bearer {jwt_token}
```

### 6. Get Order by ID
```http
GET /api/checkout/order/25
```

### 7. Get Guest Order
```http
GET /api/checkout/guest-order?email=customer@example.com&sessionId=session-123
```

### 8. Cancel Order (Authenticated)
```http
POST /api/checkout/cancel-order/25
Authorization: Bearer {jwt_token}
```

### 9. Update Order Status (Admin Only)
```http
PUT /api/checkout/update-status/25
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json

{
  "newStatus": "Shipped"
}
```

---

## Sample Promo Codes to Test

Use these codes for testing checkout:

| Code | Type | Discount | Min Purchase | Expires |
|------|------|----------|--------------|---------|
| WELCOME10 | % | 10% off | $0 | 30 days |
| SAVE20 | % | 20% off | $50 | 60 days |
| FLAT15 | $ | $15 off | $0 | 15 days |

---

## Payment Methods (Use These Values)

- `CreditCard`
- `PayPal`
- `CashOnDelivery`
- `Wallet`

---

## Order Statuses

- `Pending` - Order received, awaiting confirmation
- `Confirmed` - Order confirmed by customer
- `Shipped` - Order in transit
- `Delivered` - Order delivered
- `Cancelled` - Order cancelled

---

## Common Request/Response Patterns

### Success Response
```json
{
  "isSuccess": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "isSuccess": false,
  "message": "Error description",
  "data": null
}
```

### Common Error Messages
- `"Cart is empty"` - No items in cart
- `"Product not found"` - ProductId doesn't exist
- `"Insufficient stock. Available: X"` - Not enough inventory
- `"Invalid promo code"` - Code doesn't exist
- `"Promo code has expired"` - Code is past expiration date
- `"Promo code usage limit reached"` - Code exceeded max uses
- `"User not found"` - Invalid JWT or deleted user

---

## Testing Scenarios

### Scenario 1: Simple Guest Checkout
```bash
1. Generate sessionId: "guest-session-$(date +%s)"
2. POST /api/cart/add-item?sessionId=guest-session-xxx
3. POST /api/checkout/calculate-summary (cartId from step 2)
4. POST /api/checkout/guest-checkout?sessionId=guest-session-xxx
5. GET /api/checkout/guest-order?email=...&sessionId=...
```

### Scenario 2: User Checkout with Promo
```bash
1. POST /api/auth/login (get token)
2. Get cart GET /api/cart (with Authorization header)
3. POST /api/checkout/validate-promo
4. POST /api/checkout/calculate-summary
5. POST /api/checkout/user-checkout
6. GET /api/checkout/my-orders
```

### Scenario 3: Inventory Management
```bash
1. Add items to cart
2. POST /api/cart/validate-inventory
3. Try to increase quantity beyond stock
4. Should get "Insufficient stock" error
```

### Scenario 4: Promo Code Testing
```bash
1. POST /api/checkout/validate-promo with invalid code
2. POST /api/checkout/validate-promo with expired code
3. POST /api/checkout/validate-promo with valid code
4. POST /api/checkout/calculate-summary with valid code
```

---

## Curl Command Examples

### Add Item to Cart
```bash
curl -X POST http://localhost:5000/api/cart/add-item?sessionId=session-123 \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

### User Checkout
```bash
curl -X POST http://localhost:5000/api/checkout/user-checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "address":"123 Main St",
    "city":"NYC",
    "state":"NY",
    "postalCode":"10001",
    "country":"USA",
    "phoneNumber":"+1234567890",
    "paymentMethod":"CreditCard",
    "promoCode":"WELCOME10"
  }'
```

### Get Orders
```bash
curl -X GET http://localhost:5000/api/checkout/my-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## SessionId Generation

For guest sessions, generate a unique ID using:

**JavaScript:**
```javascript
const sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
```

**C#:**
```csharp
var sessionId = "session-" + Guid.NewGuid().ToString();
```

**Python:**
```python
import uuid
sessionId = f"session-{uuid.uuid4()}"
```

---

## Debugging Tips

1. **Check response codes:**
   - 200: Success
   - 400: Bad Request (validation error)
   - 401: Unauthorized (missing/invalid token)
   - 403: Forbidden (insufficient permissions)
   - 500: Server error

2. **Common issues:**
   - Missing `sessionId` parameter for guests
   - Missing `Authorization` header for authenticated endpoints
   - Invalid JSON format in request body
   - Using wrong `productId` or `cartId`

3. **Enable logging:**
   Add to `appsettings.json`:
   ```json
   "Logging": {
     "LogLevel": {
       "Default": "Information",
       "E_commerce_Project": "Debug"
     }
   }
   ```

---

## Next Steps

1. Test all endpoints with provided examples
2. Verify database migration applies successfully
3. Create integration tests
4. Set up email notifications
5. Integrate payment gateway
6. Deploy to staging environment

