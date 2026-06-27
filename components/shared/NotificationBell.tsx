'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, X, Check, Trash2 } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  complaint_id?: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  async function loadNotifications() {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications?limit=10')
      const data = await res.json()

      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('[v0] Load notifications error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true }),
      })
      loadNotifications()
    } catch (error) {
      console.error('[v0] Mark as read error:', error)
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      loadNotifications()
    } catch (error) {
      console.error('[v0] Delete notification error:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin_alert':
        return '🚨'
      case 'officer_assigned':
        return '👤'
      case 'status_change':
        return '🔄'
      case 'complaint_update':
        return '💬'
      case 'new_complaint':
        return '📝'
      default:
        return '📢'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-400 hover:text-slate-200" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl z-50">
          <div className="border-b border-slate-700/50 p-4">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && <p className="text-xs text-slate-400 mt-1">{unreadCount} unread</p>}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-slate-700/30 p-4 hover:bg-slate-800/50 transition-colors ${!notification.read ? 'bg-slate-800/30' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-1">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{notification.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 hover:bg-slate-700 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
