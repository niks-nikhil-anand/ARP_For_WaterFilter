# API Documentation

## Authentication Endpoints

### POST /api/auth/signup
Create a new user account
- **Body**: `{ name, email, password, mobile?, role? }`
- **Response**: User data + JWT token
- **Cookie**: Sets `auth-token` HttpOnly cookie

### POST /api/auth/login
Login with email and password
- **Body**: `{ email, password }`
- **Response**: User data + JWT token
- **Cookie**: Sets `auth-token` HttpOnly cookie

### POST /api/auth/logout
Logout current user
- **Response**: Success message
- **Cookie**: Removes `auth-token` cookie

### GET /api/auth/me
Get current authenticated user
- **Headers**: Requires auth cookie
- **Response**: Current user data

---

## User Endpoints

### GET /api/users
Get all users (ADMIN/SUPERADMIN only)
- **Response**: Array of users

### POST /api/users
Create new user (ADMIN/SUPERADMIN only)
- **Body**: `{ name, email, password, mobile?, role?, status? }`
- **Response**: Created user

### GET /api/users/[id]
Get single user by ID
- **Permission**: Own data or ADMIN/SUPERADMIN
- **Response**: User with addresses, shops, agents

### PATCH /api/users/[id]
Partial update user
- **Body**: Any user fields
- **Permission**: Own data or ADMIN/SUPERADMIN
- **Response**: Updated user

### PUT /api/users/[id]
Full update user
- **Body**: `{ name, email, password?, mobile?, role?, status? }`
- **Permission**: Own data or ADMIN/SUPERADMIN
- **Response**: Updated user

### DELETE /api/users/[id]
Delete user (ADMIN/SUPERADMIN only)
- **Response**: Success message

---

## Address Endpoints

### GET /api/addresses
Get all addresses for current user
- **Response**: Array of user's addresses

### POST /api/addresses
Create new address
- **Body**: `{ type?, pincode?, landmark?, apartmentNo?, state?, country?, locality?, phone?, altPhone? }`
- **Response**: Created address

### GET /api/addresses/[id]
Get single address
- **Permission**: Own address only
- **Response**: Address data

### PATCH /api/addresses/[id]
Partial update address
- **Body**: Any address fields
- **Response**: Updated address

### PUT /api/addresses/[id]
Full update address
- **Body**: All address fields
- **Response**: Updated address

### DELETE /api/addresses/[id]
Delete address
- **Response**: Success message

---

## Shop Endpoints

### GET /api/shops
Get shops
- **SUPERADMIN**: All shops
- **Others**: Own shops only
- **Response**: Array of shops with counts

### POST /api/shops
Create new shop
- **Body**: `{ name, address?, userId? }`
- **Note**: userId only for SUPERADMIN
- **Response**: Created shop

### GET /api/shops/[id]
Get single shop
- **Permission**: Own shop or SUPERADMIN
- **Response**: Shop with products, agents, counts

### PATCH /api/shops/[id]
Partial update shop
- **Body**: Any shop fields
- **Response**: Updated shop

### PUT /api/shops/[id]
Full update shop
- **Body**: `{ name, address? }`
- **Response**: Updated shop

### DELETE /api/shops/[id]
Delete shop (SUPERADMIN only)
- **Response**: Success message

---

## Agent Endpoints

### GET /api/agents
Get agents
- **SUPERADMIN**: All agents
- **Shop owners**: Agents of their shop
- **Response**: Array of agents with task counts

### POST /api/agents
Create new agent
- **Body**: `{ userId, shopId? }`
- **Note**: shopId optional, uses current user's shop if not provided
- **Response**: Created agent

### GET /api/agents/[id]
Get single agent
- **Permission**: Shop owner or SUPERADMIN
- **Response**: Agent with tasks

### PATCH /api/agents/[id]
Partial update agent
- **Body**: Any agent fields
- **Response**: Updated agent

### PUT /api/agents/[id]
Full update agent
- **Body**: `{ shopId? }`
- **Response**: Updated agent

### DELETE /api/agents/[id]
Delete agent
- **Response**: Success message

---

## Product Endpoints

### GET /api/products
Get products
- **Query**: `?shopId=123` (optional)
- **SUPERADMIN**: All products
- **Others**: Own shop's products
- **Response**: Array of products with details

### POST /api/products
Create new product
- **Body**: `{ name, company, type, color?, offer?, warrantyPeriod?, shopId? }`
- **Response**: Created product

### GET /api/products/[id]
Get single product
- **Permission**: Shop owner or SUPERADMIN
- **Response**: Product with details and orders

### PATCH /api/products/[id]
Partial update product
- **Body**: Any product fields
- **Response**: Updated product

### PUT /api/products/[id]
Full update product
- **Body**: `{ name, company, type, color?, offer?, warrantyPeriod? }`
- **Response**: Updated product

### DELETE /api/products/[id]
Delete product
- **Response**: Success message

---

## ProductDetail Endpoints

### GET /api/product-details
Get product details
- **Query**: `?productId=123` (optional)
- **SUPERADMIN**: All product details
- **Others**: Own shop's product details
- **Response**: Array of product details

### POST /api/product-details
Create new product detail
- **Body**: `{ productId, uniqueCode, basePrice, discountedPrice?, discountValue?, discountType?, amcContractId? }`
- **Response**: Created product detail

### GET /api/product-details/[id]
Get single product detail
- **Permission**: Shop owner or SUPERADMIN
- **Response**: Product detail

### PATCH /api/product-details/[id]
Partial update product detail
- **Body**: Any product detail fields
- **Response**: Updated product detail

### PUT /api/product-details/[id]
Full update product detail
- **Body**: `{ uniqueCode, basePrice, discountedPrice?, discountValue?, discountType?, amcContractId? }`
- **Response**: Updated product detail

### DELETE /api/product-details/[id]
Delete product detail
- **Response**: Success message

---

## AMCContract Endpoints

### GET /api/amc-contracts
Get AMC contracts
- **Query**: `?shopId=123` (optional)
- **SUPERADMIN**: All contracts
- **Others**: Own shop's contracts
- **Response**: Array of contracts with services

### POST /api/amc-contracts
Create new AMC contract
- **Body**: `{ name, duration, price, shopId? }`
- **Response**: Created contract

### GET /api/amc-contracts/[id]
Get single AMC contract
- **Permission**: Shop owner or SUPERADMIN
- **Response**: Contract with services, products, events

### PATCH /api/amc-contracts/[id]
Partial update AMC contract
- **Body**: Any contract fields
- **Response**: Updated contract

### PUT /api/amc-contracts/[id]
Full update AMC contract
- **Body**: `{ name, duration, price }`
- **Response**: Updated contract

### DELETE /api/amc-contracts/[id]
Delete AMC contract
- **Response**: Success message

---

## AMCService Endpoints

### GET /api/amc-services
Get AMC services
- **Query**: `?amcContractId=123` (optional)
- **Permission**: Contract's shop owner or SUPERADMIN
- **Response**: Array of services

### POST /api/amc-services
Create new AMC service
- **Body**: `{ name, description?, amcContractId }`
- **Response**: Created service

### GET /api/amc-services/[id]
Get single AMC service
- **Permission**: Contract's shop owner or SUPERADMIN
- **Response**: Service data

### PATCH /api/amc-services/[id]
Partial update AMC service
- **Body**: Any service fields
- **Response**: Updated service

### PUT /api/amc-services/[id]
Full update AMC service
- **Body**: `{ name, description? }`
- **Response**: Updated service

### DELETE /api/amc-services/[id]
Delete AMC service
- **Response**: Success message

---

## ServiceEvent Endpoints

### GET /api/service-events
Get service events
- **Query**: `?type=WARRANTY&productId=123&customerId=456` (all optional)
- **SUPERADMIN**: All events
- **AGENT**: Assigned tasks
- **Shop owners**: Events for their products
- **Users**: Their own events
- **Response**: Array of service events

### POST /api/service-events
Create new service event
- **Body**: `{ type, productId, customerId?, orderId?, startDate?, endDate?, pricePaid?, amcContractId?, remarks?, description?, parts?, feedback?, agentId?, details? }`
- **Response**: Created event

### GET /api/service-events/[id]
Get single service event
- **Permission**: Shop owner, customer, agent, or SUPERADMIN
- **Response**: Event with all details

### PATCH /api/service-events/[id]
Partial update service event
- **Body**: Any event fields
- **Permission**: Shop owner, agent, or SUPERADMIN
- **Response**: Updated event

### PUT /api/service-events/[id]
Full update service event
- **Body**: `{ type, productId, ... }`
- **Permission**: Shop owner or SUPERADMIN
- **Response**: Updated event

### DELETE /api/service-events/[id]
Delete service event
- **Permission**: Shop owner or SUPERADMIN
- **Response**: Success message

---

## Order Endpoints

### GET /api/orders
Get orders
- **Query**: `?shopId=123&productId=456` (optional)
- **SUPERADMIN**: All orders
- **Others**: Own shop's orders
- **Response**: Array of orders

### POST /api/orders
Create new order
- **Body**: `{ productId, shopId?, customerName, customerEmail?, customerPhone? }`
- **Response**: Created order

### GET /api/orders/[id]
Get single order
- **Permission**: Shop owner or SUPERADMIN
- **Response**: Order with product and service events

### PATCH /api/orders/[id]
Partial update order
- **Body**: Any order fields
- **Response**: Updated order

### PUT /api/orders/[id]
Full update order
- **Body**: `{ customerName, customerEmail?, customerPhone? }`
- **Response**: Updated order

### DELETE /api/orders/[id]
Delete order
- **Permission**: Shop owner or SUPERADMIN
- **Response**: Success message

---

## Notification Endpoints

### GET /api/notifications
Get notifications for current user
- **Query**: `?isRead=true&category=ORDER` (optional)
- **Response**: Array of user's notifications

### POST /api/notifications
Create new notification
- **Body**: `{ title, message, category, priority?, link?, metadata?, recipientId?, shopId? }`
- **Note**: Only ADMIN/SUPERADMIN can create for other users
- **Response**: Created notification

### GET /api/notifications/[id]
Get single notification
- **Permission**: Own notification only
- **Response**: Notification data

### PATCH /api/notifications/[id]
Partial update notification (mark as read)
- **Body**: `{ isRead: true }`
- **Response**: Updated notification

### PUT /api/notifications/[id]
Full update notification
- **Body**: `{ title, message, category, priority?, isRead?, link?, metadata? }`
- **Permission**: ADMIN/SUPERADMIN only
- **Response**: Updated notification

### DELETE /api/notifications/[id]
Delete notification
- **Permission**: Own notification or SUPERADMIN
- **Response**: Success message

### POST /api/notifications/mark-all-read
Mark all notifications as read for current user
- **Response**: Success message

---

## Authentication & Authorization

All endpoints (except /api/auth/signup and /api/auth/login) require authentication via JWT token stored in HttpOnly cookie.

### Role-Based Access:
- **USER**: Can access own data
- **AGENT**: Can access assigned tasks and own data
- **ADMIN**: Can manage users and shop data
- **SUPERADMIN**: Full access to all resources

### Environment Variables Required:
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
```

---

## Response Format

All API responses follow this format:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error
