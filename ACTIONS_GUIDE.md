# Actions Guide

Complete guide for using server actions in the Water Filter Management System.

## Overview

Server actions are organized by panel type and provide type-safe, server-side API calls for your frontend components.

## Directory Structure

```
src/actions/
├── auth/               # Authentication actions
│   └── index.ts
├── admin/              # Admin panel actions
│   ├── users.ts
│   ├── shops.ts
│   ├── agents.ts
│   └── index.ts
├── shop/               # Shop panel actions
│   ├── products.ts
│   ├── orders.ts
│   ├── service-events.ts
│   ├── amc-contracts.ts
│   └── index.ts
├── agent/              # Agent panel actions
│   ├── tasks.ts
│   └── index.ts
├── common/             # Shared actions
│   ├── notifications.ts
│   └── index.ts
└── index.ts            # Master export
```

---

## Authentication Actions

### Import
```typescript
import { authActions } from '@/actions';
```

### Available Actions

#### Signup
```typescript
const result = await authActions.signup({
  name: "John Doe",
  email: "john@example.com",
  password: "securepass123",
  mobile: "1234567890",
  role: "USER" // Optional: USER | AGENT | ADMIN | SUPERADMIN
});

if (result.success) {
  console.log("User created:", result.data);
}
```

#### Login
```typescript
const result = await authActions.login({
  email: "john@example.com",
  password: "securepass123"
});

if (result.success) {
  console.log("Logged in:", result.data);
  // Redirect to dashboard
}
```

#### Logout
```typescript
const result = await authActions.logout();
if (result.success) {
  // Redirect to login page
}
```

#### Get Current User
```typescript
const result = await authActions.getCurrentUser();
if (result.success) {
  console.log("Current user:", result.data);
}
```

---

## Admin Panel Actions

### Import
```typescript
import { adminActions } from '@/actions';
```

### User Management

#### GET All Users
```typescript
const result = await adminActions.getAllUsers();
if (result.success) {
  const users = result.data;
}
```

#### GET Single User
```typescript
const result = await adminActions.getUserById(1);
```

#### CREATE User
```typescript
const result = await adminActions.createUser({
  name: "Jane Smith",
  email: "jane@example.com",
  password: "pass123",
  mobile: "9876543210",
  role: "AGENT",
  status: "ACTIVE"
});
```

#### UPDATE User (Partial)
```typescript
const result = await adminActions.updateUser(1, {
  name: "Jane Doe",
  mobile: "1111111111"
});
```

#### REPLACE User (Full)
```typescript
const result = await adminActions.replaceUser(1, {
  name: "Jane Doe",
  email: "jane@example.com",
  mobile: "1111111111",
  role: "ADMIN"
});
```

#### DELETE User
```typescript
const result = await adminActions.deleteUser(1);
```

#### Helper Functions
```typescript
// Toggle user status
await adminActions.toggleUserStatus(1, "BLOCKED");

// Change user role
await adminActions.changeUserRole(1, "ADMIN");
```

### Shop Management

#### GET All Shops
```typescript
const result = await adminActions.getAllShops();
```

#### GET Single Shop
```typescript
const result = await adminActions.getShopById(1);
```

#### CREATE Shop
```typescript
const result = await adminActions.createShop({
  name: "AquaPure Store",
  address: "123 Main St, City",
  userId: 5 // Optional: for SUPERADMIN
});
```

#### UPDATE Shop
```typescript
const result = await adminActions.updateShop(1, {
  name: "AquaPure Store - Downtown"
});
```

#### REPLACE Shop
```typescript
const result = await adminActions.replaceShop(1, {
  name: "New Shop Name",
  address: "New Address"
});
```

#### DELETE Shop
```typescript
const result = await adminActions.deleteShop(1);
```

### Agent Management

#### GET All Agents
```typescript
const result = await adminActions.getAllAgents();
```

#### GET Single Agent
```typescript
const result = await adminActions.getAgentById(1);
```

#### CREATE Agent
```typescript
const result = await adminActions.createAgent({
  userId: 10,
  shopId: 2 // Optional
});
```

#### UPDATE Agent
```typescript
const result = await adminActions.updateAgent(1, {
  shopId: 3
});
```

#### DELETE Agent
```typescript
const result = await adminActions.deleteAgent(1);
```

#### Reassign Agent
```typescript
const result = await adminActions.reassignAgent(1, 5); // agentId, newShopId
```

---

## Shop Panel Actions

### Import
```typescript
import { shopActions } from '@/actions';
```

### Product Management

#### GET All Products
```typescript
const result = await shopActions.getAllProducts();
// or with filter
const result = await shopActions.getAllProducts(shopId);
```

#### GET Single Product
```typescript
const result = await shopActions.getProductById(1);
```

#### CREATE Product
```typescript
const result = await shopActions.createProduct({
  name: "AquaPure RO System",
  company: "AquaPure",
  type: "RO",
  color: "White",
  offer: "20% OFF",
  warrantyPeriod: "2 years"
});
```

#### UPDATE Product
```typescript
const result = await shopActions.updateProduct(1, {
  offer: "30% OFF",
  color: "Blue"
});
```

#### REPLACE Product
```typescript
const result = await shopActions.replaceProduct(1, {
  name: "Updated Product Name",
  company: "Company",
  type: "UV",
  warrantyPeriod: "3 years"
});
```

#### DELETE Product
```typescript
const result = await shopActions.deleteProduct(1);
```

### Order Management

#### GET All Orders
```typescript
// All orders
const result = await shopActions.getAllOrders();

// With filters
const result = await shopActions.getAllOrders({
  shopId: 1,
  productId: 5
});
```

#### GET Single Order
```typescript
const result = await shopActions.getOrderById(1);
```

#### CREATE Order
```typescript
const result = await shopActions.createOrder({
  productId: 10,
  customerName: "Customer Name",
  customerEmail: "customer@example.com",
  customerPhone: "1234567890"
});
```

#### UPDATE Order
```typescript
const result = await shopActions.updateOrder(1, {
  customerPhone: "9876543210"
});
```

#### DELETE Order
```typescript
const result = await shopActions.deleteOrder(1);
```

### Service Event Management

#### GET All Service Events
```typescript
// All events
const result = await shopActions.getAllServiceEvents();

// With filters
const result = await shopActions.getAllServiceEvents({
  type: "WARRANTY",
  productId: 10
});
```

#### GET Single Service Event
```typescript
const result = await shopActions.getServiceEventById(1);
```

#### CREATE Service Event
```typescript
const result = await shopActions.createServiceEvent({
  type: "AMC",
  productId: 10,
  customerId: 5,
  startDate: "2025-01-01",
  endDate: "2026-01-01",
  pricePaid: 5000,
  amcContractId: 2,
  agentId: 3,
  description: "Annual maintenance contract"
});
```

#### UPDATE Service Event
```typescript
const result = await shopActions.updateServiceEvent(1, {
  remarks: "Service completed successfully",
  feedback: "Customer satisfied"
});
```

#### DELETE Service Event
```typescript
const result = await shopActions.deleteServiceEvent(1);
```

#### Helper Functions
```typescript
// Assign agent to service
await shopActions.assignAgent(eventId, agentId);

// Update feedback
await shopActions.updateFeedback(eventId, "Great service!");
```

### AMC Contract Management

#### GET All AMC Contracts
```typescript
const result = await shopActions.getAllAMCContracts();
// or with shopId
const result = await shopActions.getAllAMCContracts(shopId);
```

#### GET Single Contract
```typescript
const result = await shopActions.getAMCContractById(1);
```

#### CREATE Contract
```typescript
const result = await shopActions.createAMCContract({
  name: "Gold Plan",
  duration: "12 months",
  price: 5000
});
```

#### UPDATE Contract
```typescript
const result = await shopActions.updateAMCContract(1, {
  price: 5500
});
```

#### DELETE Contract
```typescript
const result = await shopActions.deleteAMCContract(1);
```

---

## Agent Panel Actions

### Import
```typescript
import { agentActions } from '@/actions';
```

### Task Management

#### GET My Tasks
```typescript
// All tasks
const result = await agentActions.getMyTasks();

// Filtered by type
const result = await agentActions.getMyTasks({ type: "REPAIR" });
```

#### GET Single Task
```typescript
const result = await agentActions.getTaskById(1);
```

#### UPDATE Task
```typescript
const result = await agentActions.updateTask(1, {
  remarks: "Checked water pressure, filter replaced",
  parts: "Filter cartridge x2"
});
```

#### Helper Functions
```typescript
// Add remarks
await agentActions.addRemarks(taskId, "Service notes");

// Add parts used
await agentActions.addPartsUsed(taskId, "Filter, O-rings");

// Add description
await agentActions.addDescription(taskId, "Full system check");

// Update details (JSON field)
await agentActions.updateTaskDetails(taskId, '{"checkpoints": [...]}');

// Complete task
await agentActions.completeTask(taskId, "Service completed", "Parts list");
```

---

## Common Actions

### Import
```typescript
import { commonActions } from '@/actions';
```

### Notifications

#### GET My Notifications
```typescript
// All notifications
const result = await commonActions.getMyNotifications();

// Filtered
const result = await commonActions.getMyNotifications({
  isRead: false,
  category: "ORDER"
});
```

#### GET Single Notification
```typescript
const result = await commonActions.getNotificationById(1);
```

#### CREATE Notification (Admin/Shop)
```typescript
const result = await commonActions.createNotification({
  title: "New Order",
  message: "You have received a new order #123",
  category: "ORDER",
  priority: "HIGH",
  link: "/orders/123",
  recipientId: 5
});
```

#### Mark As Read
```typescript
const result = await commonActions.markAsRead(1);
```

#### Mark All As Read
```typescript
const result = await commonActions.markAllAsRead();
```

#### DELETE Notification
```typescript
const result = await commonActions.deleteNotification(1);
```

---

## Usage in Components

### Example: User List Component

```typescript
'use client';

import { adminActions } from '@/actions';
import { useEffect, useState } from 'react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const result = await adminActions.getAllUsers();
    if (result.success) {
      setUsers(result.data);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    const result = await adminActions.deleteUser(id);
    if (result.success) {
      loadUsers(); // Reload list
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {users.map((user: any) => (
        <div key={user.id}>
          <span>{user.name}</span>
          <button onClick={() => handleDelete(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Example: Create Product Form

```typescript
'use client';

import { shopActions } from '@/actions';
import { useState } from 'react';

export default function CreateProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    type: '',
    color: '',
    warrantyPeriod: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await shopActions.createProduct(formData);

    if (result.success) {
      alert('Product created successfully!');
      // Reset form or redirect
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Create Product</button>
    </form>
  );
}
```

---

## Error Handling

All actions return a consistent response format:

```typescript
// Success
{
  success: true,
  data: { /* response data */ },
  message: "Optional success message"
}

// Error
{
  success: false,
  error: "Error message"
}
```

Always check the `success` property:

```typescript
const result = await someAction();

if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  console.error(result.error);
}
```

---

## Type Safety

All actions are fully typed. Use TypeScript for better developer experience:

```typescript
import { adminActions } from '@/actions';

// TypeScript will autocomplete and type-check
const result = await adminActions.createUser({
  name: "John",
  email: "john@example.com",
  password: "pass123",
  // TypeScript will show available optional fields
});

if (result.success) {
  // result.data is properly typed
  const user = result.data;
  console.log(user.id, user.name, user.email);
}
```

---

## Best Practices

1. **Always handle errors**
   ```typescript
   const result = await action();
   if (!result.success) {
     toast.error(result.error);
     return;
   }
   ```

2. **Use loading states**
   ```typescript
   const [loading, setLoading] = useState(false);

   async function handleAction() {
     setLoading(true);
     const result = await action();
     setLoading(false);
   }
   ```

3. **Reload data after mutations**
   ```typescript
   async function handleDelete(id: number) {
     const result = await deleteAction(id);
     if (result.success) {
       await loadData(); // Refresh the list
     }
   }
   ```

4. **Use environment variables**
   - Set `NEXT_PUBLIC_API_URL` in `.env` for production
   - Defaults to `http://localhost:3000` in development

---

## Summary

- **Admin Panel**: User, Shop, Agent management
- **Shop Panel**: Products, Orders, Service Events, AMC Contracts
- **Agent Panel**: Task/Service Event management
- **Common**: Notifications, Authentication

All actions use server-side API calls with proper authentication and error handling.
