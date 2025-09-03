'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export type AppNotification = {
  _id: string;
  type: 'new_bid' | 'outbid' | 'auction_ended' | 'winner' | string;
  payload: any;
  createdAt?: string;
  read?: boolean;
};

type Ctx = {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  joinAuctionRoom: (auctionId: string) => void;
  leaveAuctionRoom: (auctionId: string) => void;
};

const NotificationsContext = createContext<Ctx>({
  notifications: [],
  unreadCount: 0,
  async markRead() {},
  async markAllRead() {},
  joinAuctionRoom() {},
  leaveAuctionRoom() {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadInitial = useCallback(async () => {
    try {
      const [{ data: list }, { data: cnt }] = await Promise.all([
        api.get('/notifications', { params: { page: 1, limit: 20 } }),
        api.get('/notifications/unread-count'),
      ]);
      console.log('API Response - Notifications:', list);
      console.log('API Response - Unread count:', cnt);
      
      setNotifications(list.items || []);
      setUnreadCount(cnt.count || 0);
      console.log('Notifications loaded:', list.items?.length || 0, 'unread:', cnt.count || 0);
      
      // Log each notification for debugging
      if (list.items && list.items.length > 0) {
        list.items.forEach((notif: any, index: number) => {
          console.log(`Notification ${index + 1}:`, notif);
        });
      }
    } catch (e: any) {
      console.error('Failed to load notifications:', e);
      console.error('Error details:', e.response?.data || e.message);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      console.log('No token available, skipping notification setup');
      return; // wait for auth
    }
    
    console.log('Setting up notifications with token:', token ? 'present' : 'missing');
    loadInitial();

    const sock = getSocket();
    if (!sock) {
      console.error('Failed to get socket connection');
      return;
    }

    console.log('Socket obtained:', sock.id, 'connected:', sock.connected);

    const onNotif = (n: AppNotification) => {
      console.log('Received notification:', n);
      setNotifications(prev => [n, ...prev].slice(0, 20));
      setUnreadCount(c => c + 1);
      // Toast message based on type
      if (n.type === 'outbid') {
        toast((t) => (
          <span>
            You have been outbid. <a href={`/bid/${n.payload?.auctionId}`} style={{ color: '#2563eb', textDecoration: 'underline' }} onClick={() => toast.dismiss(t.id)}>Bid again</a>
          </span>
        ), { icon: '⚠️' });
      } else if (n.type === 'winner') {
        toast((t) => (
          <span>
            You won the auction! <a href={`/bid/${n.payload?.auctionId}`} style={{ color: '#16a34a', textDecoration: 'underline' }} onClick={() => toast.dismiss(t.id)}>Go to payment</a>
          </span>
        ), { icon: '🏆' });
      } else if (n.type === 'auction_ended') {
        toast((t) => (
          <span>
            Auction ended. <a href={`/bid/${n.payload?.auctionId}/results`} style={{ color: '#2563eb', textDecoration: 'underline' }} onClick={() => toast.dismiss(t.id)}>View results</a>
          </span>
        ), { icon: '⏰' });
      } else if (n.type === 'new_bid') {
        toast.success('New bid placed on your auction');
      }
    };

    sock.on('notification', onNotif);

    // live room events can also show toasts for non-persisted events
    const onNewBid = (p: any) => {
      console.log('New bid event:', p);
      // Optional lightweight toast for users viewing the auction page
      // toast(`${p.amount} new bid`, { icon: '💰' });
    };
    const onAuctionEnded = (p: any) => {
      console.log('Auction ended event:', p);
      toast((t) => (
        <span>
          Auction ended. <a href={`/bid/${p.auctionId}/results`} style={{ color: '#2563eb', textDecoration: 'underline' }} onClick={() => toast.dismiss(t.id)}>View results</a>
        </span>
      ), { icon: '⏰' });
    };

    sock.on('newBid', onNewBid);
    sock.on('auctionEnded', onAuctionEnded);

    console.log('Socket listeners attached');

    return () => {
      sock.off('notification', onNotif);
      sock.off('newBid', onNewBid);
      sock.off('auctionEnded', onAuctionEnded);
    };
  }, [token, loadInitial]);

  const markRead = useCallback(async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      console.log('Mark read response:', response.data);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const response = await api.post('/notifications/mark-all-read');
      console.log('Mark all read response:', response.data);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const joinAuctionRoom = useCallback((auctionId: string) => {
    const sock = getSocket();
    sock?.emit('join_auction', { auctionId });
  }, []);

  const leaveAuctionRoom = useCallback((auctionId: string) => {
    const sock = getSocket();
    sock?.emit('leave_auction', { auctionId });
  }, []);

  const value = useMemo(() => ({ notifications, unreadCount, markRead, markAllRead, joinAuctionRoom, leaveAuctionRoom }), [notifications, unreadCount, markRead, markAllRead, joinAuctionRoom, leaveAuctionRoom]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export const useNotifications = () => useContext(NotificationsContext);
