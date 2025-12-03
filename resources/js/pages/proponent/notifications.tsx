import { useMemo, useState, useEffect } from 'react'
import { Link, Head, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { BellIcon, Check, CheckCheck } from 'lucide-react'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  redirect_url: string | null
  created_at: string
  created_at_human: string
}

interface NotificationsProps {
  notifications: {
    data: Notification[]
    links: any
    meta: any
  }
}

export default function Notifications({ notifications }: NotificationsProps) {
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread')
  const [csrfToken, setCsrfToken] = useState<string>('')

  // Extract CSRF token once on component mount
  useEffect(() => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    setCsrfToken(token)
  }, [])
  
  const unreadNotifications = useMemo(
    () => notifications.data ? notifications.data.filter(n => !n.is_read) : [],
    [notifications.data]
  )
  
  const readNotifications = useMemo(
    () => notifications.data ? notifications.data.filter(n => n.is_read) : [],
    [notifications.data]
  )
  
  const currentNotifications = activeTab === 'unread' ? unreadNotifications : readNotifications
  const hasNotifications = currentNotifications.length > 0

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'project_assigned': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'evaluation_completed_approved': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'evaluation_completed_declined': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      'evaluation_completed_revision': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      'approved_for_certification': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      'returned_for_review': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      'certificate_generated': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
      'message_received': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
      'message_replied': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
      'project_submitted': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'project_revised': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      'project_approved_by_evaluator': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    }
    return colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'project_assigned': 'Project Assigned',
      'evaluation_completed_approved': 'Approved',
      'evaluation_completed_declined': 'Declined',
      'evaluation_completed_revision': 'Revision Required',
      'approved_for_certification': 'Approved for Certification',
      'returned_for_review': 'Returned for Review',
      'certificate_generated': 'Certificate Generated',
      'message_received': 'Message Received',
      'message_replied': 'Message Reply',
      'project_submitted': 'Project Submitted',
      'project_revised': 'Project Revised',
      'project_approved_by_evaluator': 'Approved by Evaluator',
      'evaluation_status_change': 'Evaluation Update',
      'project_evaluation_update': 'Evaluation Update',
    }
    return labels[type] || type
  }

  const handleMarkAllAsRead = async () => {
    if (unreadNotifications.length === 0) return
    
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
      })
      
      if (response.ok) {
        router.reload()
      } else {
        console.error('Failed to mark all as read')
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if it's unread
      if (!notification.is_read) {
        const response = await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
        })
        
        if (response.ok) {
          // Reload to refresh notification data from server
          router.reload()
        }
      }

      // Redirect to the notification URL
      if (notification.redirect_url) {
        router.visit(notification.redirect_url)
      }
    } catch (error) {
      console.error('Error handling notification click:', error)
      // Still redirect even if marking as read fails
      if (notification.redirect_url) {
        router.visit(notification.redirect_url)
      }
    }
  }

  return (
    <AppLayout>
      <Head title="Notifications" />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <BellIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        </div>
        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('unread')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unread'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Unread
              {unreadNotifications.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'read'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Read
              {readNotifications.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {readNotifications.length > 99 ? '99+' : readNotifications.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      {hasNotifications ? (
        <div className="space-y-3">
          {currentNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg border transition-colors cursor-pointer relative ${
                notification.is_read
                  ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {notification.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getTypeColor(notification.type)}`}>
                      {getTypeLabel(notification.type)}
                    </span>
                    {activeTab === 'read' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 whitespace-nowrap">
                        <Check className="w-3 h-3 mr-1" />
                        Read
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.created_at_human}
                    </span>
                    {notification.redirect_url && (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Click to view →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4">
            <BellIcon className="h-full w-full" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'unread' ? 'No unread notifications' : 'No read notifications'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {activeTab === 'unread' 
              ? "You'll see notifications here when something important happens"
              : "Previously read notifications will appear here"
            }
          </p>
        </div>
      )}

      {/* Pagination Info */}
      {hasNotifications && notifications.meta && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Showing {currentNotifications.length} {activeTab} notifications
            {notifications.meta.total && ` (${notifications.meta.total} total)`}
          </p>
        </div>
      )}
      </div>
    </AppLayout>
  )
}
