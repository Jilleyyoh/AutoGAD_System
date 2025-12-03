import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link, usePage } from '@inertiajs/react'
import { CheckCheck, X, Check } from 'lucide-react'
import { useState, useMemo } from 'react'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  read_at: string | null
  created_at: string
  link?: string
  action_url?: string
}

interface NotificationDropdownProps {
  notifications: Notification[]
  isLoading: boolean
  onNotificationClick: (notification: Notification) => void
  unreadCount: number
  onRefresh?: () => void // New callback for refreshing data
}

const typeColors: Record<string, { bg: string; text: string }> = {
  project_assigned: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
  evaluation_completed_approved: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
  evaluation_completed_declined: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
  evaluation_completed_revision: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
  approved_for_certification: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
  returned_for_review: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200' },
  certificate_generated: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-200' },
  message_received: { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-800 dark:text-cyan-200' },
  message_replied: { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-800 dark:text-cyan-200' },
  project_submitted: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
  project_revised: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
  project_approved_by_evaluator: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}

export function NotificationDropdown({
  notifications,
  isLoading,
  onNotificationClick,
  unreadCount,
  onRefresh,
}: NotificationDropdownProps) {
  const { auth } = usePage().props as any
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread')

  const unreadNotifications = useMemo(
    () => notifications.filter(n => !n.read_at),
    [notifications]
  )
  
  const readNotifications = useMemo(
    () => notifications.filter(n => n.read_at),
    [notifications]
  )
  
  const currentNotifications = activeTab === 'unread' ? unreadNotifications : readNotifications
  const hasNotifications = currentNotifications.length > 0

  const getNotificationsRoute = () => {
    const roleId = auth?.user?.role_id
    const roleName = auth?.user?.role?.name?.toLowerCase()
    
    if (roleId === 2 || roleName === 'evaluator') {
      return '/evaluator/notifications'
    }
    if (roleId === 3 || roleName === 'admin1') {
      return '/admin1/notifications'
    }
    if (roleId === 4 || roleName === 'admin2') {
      return '/admin2/notifications'
    }
    // Default to proponent
    return '/proponent/notifications'
  }

  const getCsrfToken = () => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    return token || ''
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'include',
      })
      if (response.ok) {
        // Call refresh callback instead of reloading the page
        onRefresh?.()
      } else {
        console.error('Mark all as read failed with status:', response.status)
        const errorData = await response.text()
        console.error('Error response:', errorData)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
      })
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getTypeColor = (type: string) => typeColors[type] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200' }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadNotifications.length > 0 && activeTab === 'unread' && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="text-xs px-2 py-1">
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
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
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {readNotifications.length > 99 ? '99+' : readNotifications.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      <Separator />

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">Loading notifications...</div>
          </div>
        ) : !hasNotifications ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div className="text-sm text-muted-foreground">
              {activeTab === 'unread' ? 'No unread notifications' : 'No read notifications'}
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {currentNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-accent ${
                  !notification.read_at ? 'bg-blue-50 dark:bg-blue-950' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {!notification.read_at && <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        getTypeColor(notification.type).bg
                      } ${getTypeColor(notification.type).text}`}>
                        {notification.type.replace(/_/g, ' ')}
                      </span>
                      {notification.read_at && activeTab === 'read' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Read
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.created_at)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-center p-4">
        <Link href={getNotificationsRoute()} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          View all
        </Link>
      </div>
    </div>
  )
}
