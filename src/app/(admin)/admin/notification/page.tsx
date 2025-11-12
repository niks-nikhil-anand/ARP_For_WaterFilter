'use client';

import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Filter,
  Search,
  Trash2,
  Eye,
  ExternalLink,
  AlertCircle,
  Package,
  ShoppingCart,
  Users,
  Wrench,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Notification,
  NotificationCategory,
  NotificationPriority,
} from '@/types/notification';
import {
  demoNotifications,
  getUnreadCount,
  getCategoryColor,
  getCategoryIcon,
  markAsRead,
  markAllAsRead,
  getPriorityColor,
} from '@/lib/notifications';

const NotificationPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const unreadCount = getUnreadCount(notifications);

  // Filter and search logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'ALL' || notification.category === categoryFilter;

      const matchesPriority =
        priorityFilter === 'ALL' || notification.priority === priorityFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'READ' && notification.isRead) ||
        (statusFilter === 'UNREAD' && !notification.isRead);

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [notifications, searchTerm, categoryFilter, priorityFilter, statusFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const categoryCounts: Record<NotificationCategory, number> = {
      [NotificationCategory.ORDER]: 0,
      [NotificationCategory.PRODUCT]: 0,
      [NotificationCategory.INVENTORY]: 0,
      [NotificationCategory.USER]: 0,
      [NotificationCategory.REPAIR]: 0,
      [NotificationCategory.WARRANTY]: 0,
      [NotificationCategory.SYSTEM]: 0,
    };

    notifications.forEach((n) => {
      categoryCounts[n.category]++;
    });

    return {
      total: notifications.length,
      unread: unreadCount,
      read: notifications.length - unreadCount,
      ...categoryCounts,
    };
  }, [notifications, unreadCount]);

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.isRead) {
      setNotifications(markAsRead(notifications, notification.id));
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(markAllAsRead(notifications));
  };

  const handleDelete = (notification: Notification) => {
    setSelectedNotification(notification);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedNotification) {
      setNotifications(notifications.filter((n) => n.id !== selectedNotification.id));
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryIconComponent = (category: NotificationCategory) => {
    const iconMap: Record<NotificationCategory, React.ReactNode> = {
      [NotificationCategory.ORDER]: <ShoppingCart className="h-5 w-5" />,
      [NotificationCategory.PRODUCT]: <Package className="h-5 w-5" />,
      [NotificationCategory.INVENTORY]: <AlertCircle className="h-5 w-5" />,
      [NotificationCategory.USER]: <Users className="h-5 w-5" />,
      [NotificationCategory.REPAIR]: <Wrench className="h-5 w-5" />,
      [NotificationCategory.WARRANTY]: <ShieldCheck className="h-5 w-5" />,
      [NotificationCategory.SYSTEM]: <Settings className="h-5 w-5" />,
    };
    return iconMap[category];
  };

  return (
    <div className="h-[90vh] max-h-[92vh] overflow-y-auto">
      <div className="container mx-auto py-10 px-4 pb-20">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground mt-2">
                Stay updated with all system activities and alerts
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4" />
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="border rounded-lg p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Unread</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {stats.unread}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Inventory Alerts</span>
              </div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {stats.INVENTORY}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <CheckCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Read</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats.read}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {Object.values(NotificationCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                {Object.values(NotificationPriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="UNREAD">Unread</SelectItem>
                <SelectItem value="READ">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="border rounded-lg p-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No notifications found
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search term
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'border rounded-lg p-4 transition-all hover:shadow-md',
                    !notification.isRead &&
                      'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                        getCategoryColor(notification.category)
                      )}
                    >
                      {getCategoryIconComponent(notification.category)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge
                              variant="outline"
                              className={cn('text-xs', getCategoryColor(notification.category))}
                            >
                              {getCategoryIcon(notification.category)} {notification.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn('text-xs', getPriorityColor(notification.priority))}
                            >
                              {notification.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(notification)}
                              title="Mark as read"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {notification.link && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleNotificationClick(notification)}
                              title="View details"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(notification)}
                            title="Delete"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationPage;
