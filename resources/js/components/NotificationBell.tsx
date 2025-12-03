import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NotificationDropdown } from './NotificationDropdown'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  read_at: string | null
  created_at: string
  link?: string
  action_url?: string
  redirect_url?: string
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchUnreadCount = async () => {
    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      const response = await fetch('/api/notifications/unread-count', {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': token || '',
        },
      })
      if (!response.ok) {
        console.error('Unread count response error:', response.status, response.statusText)
        return
      }
      const data = await response.json()
      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      const response = await fetch('/api/notifications?per_page=20', {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': token || '',
        },
      })
      const data = await response.json()
      setNotifications(data.data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const handleNotificationClick = (notification: Notification) => {
    // Get CSRF token from meta tag
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    
    fetch(`/api/notifications/${notification.id}/read`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': token || '',
      },
    }).then(() => {
      fetchUnreadCount()
      fetchNotifications() // Refresh notifications to update read/unread tabs
      const redirectUrl = notification.redirect_url || notification.action_url || notification.link
      if (redirectUrl) {
        console.log('Redirecting to:', redirectUrl)
        window.location.href = redirectUrl
      } else {
        console.warn('No redirect URL found for notification:', notification)
      }
    }).catch(error => {
      console.error('Error marking notification as read:', error)
    })
  }

  const handleRefresh = () => {
    fetchUnreadCount()
    fetchNotifications()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="group relative h-9 w-9">
                <Bell className="!size-5 opacity-80 group-hover:opacity-100" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent className="w-96" align="end">
          <NotificationDropdown 
            notifications={notifications} 
            isLoading={isLoading} 
            onNotificationClick={handleNotificationClick} 
            unreadCount={unreadCount}
            onRefresh={handleRefresh}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
