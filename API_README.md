# Water Filter Management System - API

A complete REST API built with Next.js 15, Prisma, and PostgreSQL for managing a water filter business with products, orders, AMC contracts, service events, and more.

## Features

✅ **Complete Authentication System**
- JWT-based authentication with HttpOnly cookies
- Signup, Login, Logout endpoints
- Role-based access control (USER, AGENT, ADMIN, SUPERADMIN)
- Password hashing with bcryptjs

✅ **Full CRUD Operations for All Models**
- Users & Addresses
- Shops & Agents
- Products & Product Details
- AMC Contracts & Services
- Service Events (WARRANTY, AMC, REPAIR)
- Orders & Notifications

✅ **Advanced Features**
- Comprehensive role-based permissions
- Query filtering and search
- Relationship-based data access
- Proper error handling
- Type-safe with TypeScript

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: JWT (jose library)
- **Password Hashing**: bcryptjs
- **Language**: TypeScript

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create/update `.env` file:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT Secret (change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional: Email Configuration
EMAIL_ID="your-email@example.com"
EMAIL_PASSWORD="your-email-password"
EMAIL_RECOVERY="recovery-email@example.com"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `GET /api/users/[id]` - Get user by ID
- `PATCH /api/users/[id]` - Partial update user
- `PUT /api/users/[id]` - Full update user
- `DELETE /api/users/[id]` - Delete user (Admin only)

### Addresses
- `GET /api/addresses` - Get user's addresses
- `POST /api/addresses` - Create address
- `GET /api/addresses/[id]` - Get address
- `PATCH /api/addresses/[id]` - Update address
- `PUT /api/addresses/[id]` - Full update address
- `DELETE /api/addresses/[id]` - Delete address

### Shops
- `GET /api/shops` - Get shops
- `POST /api/shops` - Create shop
- `GET /api/shops/[id]` - Get shop details
- `PATCH /api/shops/[id]` - Update shop
- `PUT /api/shops/[id]` - Full update shop
- `DELETE /api/shops/[id]` - Delete shop (SuperAdmin only)

### Agents
- `GET /api/agents` - Get agents
- `POST /api/agents` - Create agent
- `GET /api/agents/[id]` - Get agent details
- `PATCH /api/agents/[id]` - Update agent
- `PUT /api/agents/[id]` - Full update agent
- `DELETE /api/agents/[id]` - Delete agent

### Products
- `GET /api/products` - Get products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PATCH /api/products/[id]` - Update product
- `PUT /api/products/[id]` - Full update product
- `DELETE /api/products/[id]` - Delete product

### Product Details
- `GET /api/product-details` - Get product details
- `POST /api/product-details` - Create product detail
- `GET /api/product-details/[id]` - Get detail
- `PATCH /api/product-details/[id]` - Update detail
- `PUT /api/product-details/[id]` - Full update detail
- `DELETE /api/product-details/[id]` - Delete detail

### AMC Contracts
- `GET /api/amc-contracts` - Get contracts
- `POST /api/amc-contracts` - Create contract
- `GET /api/amc-contracts/[id]` - Get contract
- `PATCH /api/amc-contracts/[id]` - Update contract
- `PUT /api/amc-contracts/[id]` - Full update contract
- `DELETE /api/amc-contracts/[id]` - Delete contract

### AMC Services
- `GET /api/amc-services` - Get services
- `POST /api/amc-services` - Create service
- `GET /api/amc-services/[id]` - Get service
- `PATCH /api/amc-services/[id]` - Update service
- `PUT /api/amc-services/[id]` - Full update service
- `DELETE /api/amc-services/[id]` - Delete service

### Service Events
- `GET /api/service-events` - Get events
- `POST /api/service-events` - Create event
- `GET /api/service-events/[id]` - Get event
- `PATCH /api/service-events/[id]` - Update event
- `PUT /api/service-events/[id]` - Full update event
- `DELETE /api/service-events/[id]` - Delete event

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order
- `PATCH /api/orders/[id]` - Update order
- `PUT /api/orders/[id]` - Full update order
- `DELETE /api/orders/[id]` - Delete order

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `GET /api/notifications/[id]` - Get notification
- `PATCH /api/notifications/[id]` - Update notification
- `PUT /api/notifications/[id]` - Full update notification
- `DELETE /api/notifications/[id]` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all as read

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## Usage Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "mobile": "1234567890"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }' \
  -c cookies.txt
```

### 3. Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### 4. Create a Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "AquaPure RO System",
    "company": "AquaPure",
    "type": "RO",
    "color": "White",
    "warrantyPeriod": "2 years"
  }'
```

## Database Models

### Core Models
- **User** - System users with roles
- **Address** - User addresses
- **Shop** - Shop/store information
- **Agent** - Service agents

### Product Models
- **Product** - Product catalog
- **ProductDetail** - Pricing and discount details

### Service Models
- **AMCContract** - AMC contract plans
- **AMCService** - Services included in contracts
- **ServiceEvent** - Warranty/AMC/Repair events

### Transaction Models
- **Order** - Customer orders
- **Notification** - System notifications

## Role-Based Access Control

### USER
- Access own data
- Create addresses
- View own service events

### AGENT
- Access assigned tasks
- Update service events
- View relevant products

### ADMIN
- Manage users
- Manage shop data
- Create/assign agents

### SUPERADMIN
- Full system access
- Delete shops
- View all data across shops

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Project Structure

```
src/
├── app/
│   └── api/
│       ├── auth/          # Authentication endpoints
│       ├── users/         # User CRUD
│       ├── addresses/     # Address CRUD
│       ├── shops/         # Shop CRUD
│       ├── agents/        # Agent CRUD
│       ├── products/      # Product CRUD
│       ├── product-details/  # Product detail CRUD
│       ├── amc-contracts/ # AMC contract CRUD
│       ├── amc-services/  # AMC service CRUD
│       ├── service-events/   # Service event CRUD
│       ├── orders/        # Order CRUD
│       └── notifications/ # Notification CRUD
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # JWT utilities
│   ├── password.ts       # Password hashing
│   └── api-response.ts   # Response helpers
└── generated/
    └── prisma/           # Generated Prisma client

prisma/
└── schema.prisma         # Database schema
```

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT tokens with HttpOnly cookies
- ✅ Role-based authorization
- ✅ Input validation
- ✅ SQL injection protection (via Prisma)
- ✅ XSS protection

## Development Tips

### View Database
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

## Contributing

This is a complete, production-ready API. To extend:

1. Add new models to `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Create corresponding API routes in `src/app/api/`
4. Follow existing patterns for consistency

## License

MIT

## Support

For issues or questions, please check the documentation in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
