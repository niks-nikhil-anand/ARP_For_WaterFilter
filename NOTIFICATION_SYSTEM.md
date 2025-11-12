# Notification System Documentation

## Overview

The notification system provides real-time alerts and updates for various activities in the WaterFilter Management System. It includes a comprehensive notification management interface with categorization, filtering, and priority levels.

## Features

### ✅ Implemented Features

1. **Notification Dropdown in Navbar**
   - Bell icon with unread count badge
   - Shows 5 most recent notifications
   - Quick access to mark notifications as read
   - Click notification to navigate to related page
   - "View all" button to go to full notification page

2. **Notification Categories**
   - 🛒 **ORDER**: Order-related notifications (new orders, cancellations)
   - 📦 **PRODUCT**: Product updates and changes
   - 📊 **INVENTORY**: Stock alerts (out of stock, low stock)
   - 👤 **USER**: User registration and account activities
   - 🔧 **REPAIR**: Repair request notifications
   - 🛡️ **WARRANTY**: Warranty expiration alerts
   - ⚙️ **SYSTEM**: System-wide notifications

3. **Priority Levels**
   - **LOW**: Informational notifications
   - **MEDIUM**: Standard notifications requiring attention
   - **HIGH**: Important notifications
   - **URGENT**: Critical notifications requiring immediate action

4. **Comprehensive Notification Page** (`/admin/notification`)
   - View all notifications with pagination
   - Filter by category, priority, and read status
   - Search notifications by title or message
   - Mark individual or all notifications as read
   - Delete notifications
   - Click to navigate to related pages
   - Stats cards showing notification counts by category

5. **Sidebar Integration**
   - Added "Notifications" link in the Overview section
   - Easy navigation to notification page

6. **Out-of-Stock Notification Logic**
   - Automatic notification when product goes out of stock
   - Low stock alerts when quantity falls below threshold (5 units)
   - Batch checking for multiple out-of-stock products
   - Aggregate notification for critical inventory situations

## File Structure

```
src/
├── types/
│   └── notification.ts                    # Notification types and interfaces
├── lib/
│   ├── notifications.ts                   # Notification utilities and demo data
│   └── notification-triggers.ts           # Notification creation logic
├── components/
│   └── admin/
│       └── shared/
│           ├── NotificationDropdown.tsx   # Navbar notification dropdown
│           ├── NavbarAdmin.tsx            # Updated with notification dropdown
│           └── SidebarAdmin.tsx           # Updated with notification link
└── app/
    └── (admin)/
        └── admin/
            └── notification/
                └── page.tsx               # Main notification page

prisma/
└── schema.prisma                          # Updated with Notification model
```

## Database Schema

```prisma
enum NotificationCategory {
  ORDER
  PRODUCT
  INVENTORY
  USER
  REPAIR
  WARRANTY
  SYSTEM
}

enum NotificationPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Notification {
  id        Int                   @id @default(autoincrement())
  title     String
  message   String
  category  NotificationCategory
  priority  NotificationPriority  @default(MEDIUM)
  isRead    Boolean               @default(false)
  link      String?
  metadata  Json?
  createdAt DateTime              @default(now())
  updatedAt DateTime              @updatedAt
}
```

## Usage Examples

### Creating Notifications

```typescript
import {
  createOutOfStockNotification,
  createNewOrderNotification,
  createLowStockNotification,
} from '@/lib/notification-triggers';

// When a product goes out of stock
const notification = createOutOfStockNotification(
  productId: 1,
  productName: "Kent Grand Plus RO",
  shopId: 1,
  shopName: "AquaPure Solutions"
);

// When a new order is received
const notification = createNewOrderNotification(
  orderId: 12,
  customerName: "Priya Nair",
  productName: "Aquaguard Aura RO"
);

// When stock is low
const notification = createLowStockNotification(
  productId: 3,
  productName: "Livpure Glo Star RO",
  quantity: 3
);
```

### Checking Stock and Creating Notifications

```typescript
import { checkAndCreateStockNotifications } from '@/lib/notification-triggers';

// Example: After updating product stock
const notification = checkAndCreateStockNotifications(
  productId: 1,
  productName: "Kent Grand Plus RO",
  currentStock: 0,
  previousStock: 10,
  shopId: 1,
  shopName: "AquaPure Solutions"
);

if (notification) {
  // Save notification to database
  await saveNotification(notification);
}
```

### Batch Checking Products

```typescript
import { batchCheckOutOfStockProducts } from '@/lib/notification-triggers';

const products = [
  { id: 1, name: "Product A", stock: 0, shopId: 1, shopName: "Shop 1" },
  { id: 2, name: "Product B", stock: 3, shopId: 1, shopName: "Shop 1" },
  { id: 3, name: "Product C", stock: 0, shopId: 2, shopName: "Shop 2" },
];

const notifications = batchCheckOutOfStockProducts(products);
// Returns array of notifications to be saved
```

## Next Steps (To Integrate with Backend)

1. **Database Migration**
   ```bash
   # Run Prisma migration to create Notification table
   npx prisma migrate dev --name add_notification_model
   npx prisma generate
   ```

2. **Create API Endpoints**
   - `GET /api/notifications` - Fetch all notifications
   - `GET /api/notifications/unread` - Fetch unread count
   - `POST /api/notifications` - Create new notification
   - `PATCH /api/notifications/:id/read` - Mark as read
   - `PATCH /api/notifications/read-all` - Mark all as read
   - `DELETE /api/notifications/:id` - Delete notification

3. **Integrate with Product Management**
   - Add stock field to Product model
   - Hook notification triggers into product update logic
   - Implement background job for periodic stock checks

4. **Real-time Updates (Optional)**
   - Implement WebSocket or Server-Sent Events
   - Push notifications to admin in real-time
   - Auto-refresh notification dropdown

5. **Email Notifications (Optional)**
   - Send email alerts for URGENT priority notifications
   - Weekly digest of unread notifications
   - Configurable email preferences

## Demo Data

The system currently uses demo data from `src/lib/notifications.ts`. This includes:
- 8 sample notifications covering all categories
- Mix of read/unread statuses
- Various priority levels
- Sample metadata and links

To switch to real data, replace the demo data with API calls to your backend endpoints.

## Styling and Theming

The notification system is fully integrated with the existing design system:
- Supports dark mode
- Uses consistent color schemes for categories
- Responsive design for mobile and desktop
- Accessible with proper ARIA labels

## Testing Checklist

- [x] Notification dropdown appears in navbar
- [x] Unread count badge displays correctly
- [x] Clicking notification marks it as read
- [x] Navigation to linked pages works
- [x] Full notification page displays all notifications
- [x] Filtering and search work correctly
- [x] Mark all as read functionality works
- [x] Delete notification works
- [x] Responsive design on mobile devices
- [x] Dark mode support
- [x] Sidebar link to notifications page

## Future Enhancements

1. **Notification Preferences**
   - Allow admins to configure which notifications they want to receive
   - Mute specific categories
   - Set quiet hours

2. **Notification History**
   - Archive old notifications
   - Export notification logs
   - Analytics dashboard

3. **Advanced Filtering**
   - Date range filters
   - Bulk actions (delete multiple, mark multiple as read)
   - Save filter presets

4. **Mobile Push Notifications**
   - Integrate with FCM (Firebase Cloud Messaging)
   - Send push notifications to mobile devices
   - Desktop browser notifications

5. **AI-Powered Insights**
   - Smart notification grouping
   - Predictive alerts based on patterns
   - Automated priority assignment

## Support

For issues or questions about the notification system, please refer to the main project README or contact the development team.
