"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, CalendarClock } from "lucide-react";
import { timeAgo } from "@/lib/utils/date-formatter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} from "@/server/actions/notification-actions";
import { Notification } from "@prisma/client";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    const [fetchedNotifications, count] = await Promise.all([
      getNotifications(),
      getUnreadNotificationCount(),
    ]);
    setNotifications(fetchedNotifications);
    setUnreadCount(count);
  };

  useEffect(() => {
    fetchNotifications();
    // Optionally set up an interval to poll for new notifications
    const interval = setInterval(fetchNotifications, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Mark all as read on backend but keep visual unread state while open
      const result = await markAllAsRead();
      if (result.success) {
        setUnreadCount(0);
      }
    } else if (!open) {
      // Clear visual unread state when popover closes
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent clicking the notification itself
    const result = await deleteNotification(id);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 border-border/60 hover:bg-accent hover:border-primary/30 transition-all duration-300 rounded-full"
        >
          <Bell size={18} className="text-muted-foreground transition-colors group-hover:text-foreground" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center text-[10px] rounded-full animate-in zoom-in"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl overflow-hidden shadow-lg border-border/60 z-50">
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 backdrop-blur-sm border-b border-border/40">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <span className="text-xs text-muted-foreground font-medium">
            {notifications.length} total
          </span>
        </div>
        
        <ScrollArea className="max-h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                <Check size={24} className="text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/40">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative flex items-start gap-3 p-4 transition-colors hover:bg-secondary/40 ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="mt-1 shrink-0">
                    <CalendarClock size={16} className={!notification.read ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm leading-tight ${!notification.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  )}

                  <div className="absolute right-2 top-2 opacity-0 hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(e, notification.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
