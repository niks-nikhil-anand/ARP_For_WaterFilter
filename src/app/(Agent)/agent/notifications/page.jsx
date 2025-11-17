'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import AgentNavbar from '@/components/agent/AgentNavbar'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  Trash2,
  CheckCheck,
  Filter
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const NotificationsPage = () => {
  const agentName = "Rajesh Kumar"

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 'not-001',
      type: 'ticket_assigned',
      title: 'New Ticket Assigned',
      message: 'Ticket #TKT-005 has been assigned to you. Customer: Vikram Singh, Issue: Water Filter Repair',
      timestamp: '2025-11-18T08:45:00',
      isRead: false,
      priority: 'high',
      category: 'Tickets'
    },
    {
      id: 'not-002',
      type: 'ticket_urgent',
      title: 'Urgent Ticket Requires Attention',
      message: 'High priority ticket #TKT-001 has been pending for 2 days. Please resolve at earliest.',
      timestamp: '2025-11-18T07:30:00',
      isRead: false,
      priority: 'urgent',
      category: 'Tickets'
    },
    {
      id: 'not-003',
      type: 'achievement',
      title: 'Achievement Unlocked: Top Performer',
      message: 'Congratulations! You have resolved the most tickets this month.',
      timestamp: '2025-11-17T18:00:00',
      isRead: false,
      priority: 'normal',
      category: 'Achievements'
    },
    {
      id: 'not-004',
      type: 'system',
      title: 'System Maintenance Scheduled',
      message: 'The system will undergo maintenance on Nov 20, 2025 from 2:00 AM to 4:00 AM IST.',
      timestamp: '2025-11-17T15:20:00',
      isRead: true,
      priority: 'normal',
      category: 'System'
    },
    {
      id: 'not-005',
      type: 'feedback',
      title: 'Customer Feedback Received',
      message: 'Priya Patel rated your service 5 stars for ticket #TKT-002. Great job!',
      timestamp: '2025-11-17T14:10:00',
      isRead: true,
      priority: 'normal',
      category: 'Feedback'
    },
    {
      id: 'not-006',
      type: 'ticket_resolved',
      title: 'Ticket Resolution Confirmed',
      message: 'Your resolution for ticket #TKT-004 has been approved. ₹3,500 added to your earnings.',
      timestamp: '2025-11-16T16:45:00',
      isRead: true,
      priority: 'normal',
      category: 'Tickets'
    },
    {
      id: 'not-007',
      type: 'reminder',
      title: 'Upcoming Appointment Reminder',
      message: 'You have a scheduled maintenance visit tomorrow at 10:00 AM for customer Amit Sharma.',
      timestamp: '2025-11-16T09:00:00',
      isRead: true,
      priority: 'high',
      category: 'Reminders'
    },
    {
      id: 'not-008',
      type: 'announcement',
      title: 'New Parts Available in Inventory',
      message: 'Premium RO membranes and carbon filters are now available. Check inventory for details.',
      timestamp: '2025-11-15T11:30:00',
      isRead: true,
      priority: 'normal',
      category: 'Announcements'
    }
  ])

  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const categoryMatch = filterCategory === 'All' || notification.category === filterCategory
    const statusMatch = filterStatus === 'All' ||
      (filterStatus === 'Unread' && !notification.isRead) ||
      (filterStatus === 'Read' && notification.isRead)
    return categoryMatch && statusMatch
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type, priority) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
    }
    switch (type) {
      case 'ticket_assigned':
      case 'ticket_urgent':
        return <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'achievement':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'feedback':
        return <CheckCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      default:
        return <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">High</Badge>
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Normal</Badge>
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now - date
    const diffInMins = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMins < 60) {
      return `${diffInMins} minute${diffInMins !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id))
  }

  const deleteAllRead = () => {
    setNotifications(notifications.filter(notification => !notification.isRead))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <AgentNavbar agentName={agentName} />

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Notifications
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Stay updated with your latest alerts and messages
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                  {unreadCount} Unread
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Action Buttons and Filters */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Tickets">Tickets</SelectItem>
                      <SelectItem value="Achievements">Achievements</SelectItem>
                      <SelectItem value="Feedback">Feedback</SelectItem>
                      <SelectItem value="System">System</SelectItem>
                      <SelectItem value="Reminders">Reminders</SelectItem>
                      <SelectItem value="Announcements">Announcements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Unread">Unread</SelectItem>
                    <SelectItem value="Read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="dark:border-gray-700 dark:text-white"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteAllRead}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:border-gray-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Read
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400">No notifications found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Try adjusting your filters
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`dark:border-gray-800 transition-all hover:shadow-md ${
                  notification.isRead
                    ? 'bg-white dark:bg-gray-900'
                    : 'bg-blue-50 dark:bg-blue-950 border-l-4 border-l-blue-600 dark:border-l-blue-400'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-full ${
                      notification.isRead
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              notification.isRead
                                ? 'text-gray-900 dark:text-white'
                                : 'text-blue-900 dark:text-blue-100'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <span>•</span>
                            <span>{notification.category}</span>
                            {notification.priority !== 'normal' && (
                              <>
                                <span>•</span>
                                {getPriorityBadge(notification.priority)}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Card */}
        {filteredNotifications.length > 0 && (
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 border-none text-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">{notifications.length}</p>
                  <p className="text-sm text-blue-100">Total</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{unreadCount}</p>
                  <p className="text-sm text-blue-100">Unread</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length}
                  </p>
                  <p className="text-sm text-blue-100">High Priority</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {notifications.filter(n => n.category === 'Tickets').length}
                  </p>
                  <p className="text-sm text-blue-100">Ticket Related</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
