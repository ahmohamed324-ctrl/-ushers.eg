'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageSquare, Bell, LogOut, User as UserIcon, LayoutDashboard, BellOff, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { BackButton } from '@/components/back-button';
import api from '@/lib/axios';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/me');
      if (res.data.isSuccess) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id: string, link?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
      if (link) {
        window.location.href = link;
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-background backdrop-blur-2xl border-b border-border shadow-[0_4px_32px_oklch(0.08_0.030_248/0.8)]'
          : 'bg-background backdrop-blur-xl border-b border-border'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-6">
        {/* Logo */}
        <div className="flex gap-4 md:gap-8 lg:gap-12 items-center">
          <div className="flex items-center gap-2">
            <BackButton />
            <Link href="/" className="flex items-center group py-2">
              <Logo size="sm" className="transition-opacity group-hover:opacity-80" />
            </Link>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex gap-8 items-center">
            {[
              { href: '/jobs', label: 'Browse Jobs' },
              { href: '/companies', label: 'Companies' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                style={{ letterSpacing: '0.1em' }}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end space-x-3">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link href="/chat">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all outline-none border-0 bg-transparent cursor-pointer">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-80 bg-card border-border shadow-[0_8px_32px_oklch(0.08_0.030_248/0.8)] max-h-[400px] overflow-y-auto"
                  align="end"
                >
                  <div className="flex items-center justify-between py-3 px-4 border-b border-border sticky top-0 bg-card z-10">
                    <DropdownMenuLabel className="font-normal p-0">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Notifications</p>
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                        <Check className="h-3 w-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <BellOff className="h-8 w-8 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`flex flex-col gap-1 p-4 border-b border-border last:border-0 cursor-pointer transition-colors ${!notification.isRead ? 'bg-muted hover:bg-muted' : 'hover:bg-accent hover:text-accent-foreground'}`}
                          onClick={() => markAsRead(notification.id, notification.link)}
                        >
                          <div className="flex justify-between items-start">
                            <p className={`text-sm ${!notification.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <div className="flex items-center gap-2.5">
                  <span className="hidden md:inline-block text-xs font-medium tracking-wider uppercase text-muted-foreground">
                    {user.firstName}
                  </span>
                  <DropdownMenuTrigger className="outline-none">
                    <Avatar className="h-8 w-8 ring-1 ring-border hover:ring-primary transition-all cursor-pointer">
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {user.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent
                  className="w-56 bg-card border-border shadow-[0_8px_32px_oklch(0.08_0.030_248/0.8)]"
                  align="end"
                >
                  <DropdownMenuLabel className="font-normal py-3 px-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer mx-1 rounded-md">
                    <Link href={`/dashboard/${user.role.toLowerCase()}`} className="flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer mx-1 rounded-md">
                    <Link href="/profile" className="flex items-center w-full">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer mx-1 mb-1 rounded-md"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-sm font-medium tracking-wider text-[oklch(0.70_0.022_82)] hover:text-foreground hover:bg-muted transition-all"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className="text-sm font-medium tracking-wider bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground border-0 shadow-[0_4px_16px_oklch(0.94_0.010_82/0.2)] hover:shadow-[0_6px_24px_oklch(0.94_0.010_82/0.3)] transition-all hover:-translate-y-0.5 rounded-full px-5"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
