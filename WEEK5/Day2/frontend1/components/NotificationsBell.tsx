'use client';
import  { useEffect, useState } from 'react';
import { Bell } from "lucide-react";
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';

type Notification = {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
  fromUser?: string;
};

// 🔹 normalize har incoming notification
function normalizeNotification(n: any): Notification {
  console.log("🔧 Normalizing notification:", n);
  
  const normalized = {
    _id: n._id || n.id || crypto.randomUUID(),
    message: n.message || n.text || "No message",
    read: n.read === true,   // ✅ agar backend me missing ho to default false
    createdAt: n.createdAt || n.created_at || new Date().toISOString(),
    type: n.type || 'unknown',
    fromUser: typeof n.fromUser === 'object' && n.fromUser?.name 
      ? n.fromUser.name 
      : (n.fromUser || n.fromUserName || 'someone'),
  };
  
  console.log("✅ Normalized result:", normalized);
  return normalized;
}

export default function NotificationsBell() {
  const authContext = useAuth();
  const { user, token, isLoading, notifVersion } = authContext;
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  // Debug auth context
  console.log("🔐 Auth context in NotificationsBell:", { 
    hasUser: !!user, 
    hasToken: !!token,
    isLoading,
    userId: user?.id, 
    notifVersion,
    rawContext: authContext
  });

  const unreadCount = items.filter((n: Notification) => !n.read).length;
  
  console.log("🔔 Current notification state:", {
    totalItems: items.length,
    unreadCount,
    open,  // Add open state to debugging
    items: items.slice(0, 3) // Show first 3 for debugging
  });

  // Debug dropdown rendering
  if (open) {
    console.log("🎨 Dropdown should be visible because open is true");
  } else {
    console.log("🎨 Dropdown hidden because open is false");
  }

  useEffect(() => {
    console.log("🎯 NotificationsBell useEffect triggered:", { user: !!user, token: !!token, isLoading, userId: user?.id });
    
    // Don't run if still loading
    if (isLoading) {
      console.log("⏳ Still loading authentication, skipping notification fetch");
      return;
    }

    if (!user || !token) {
      console.log("❌ Missing user or token, clearing notifications");
      setItems([]);
      return;
    }

    // fetch notifications
    console.log('🔔 Fetching notifications for user:', user.id);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    api.get('/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        console.log("📥 Raw notifications from backend:", data);
        console.log("📥 Number of notifications:", data.length);
        console.log("📥 Data type:", typeof data, Array.isArray(data));
        
        if (!Array.isArray(data)) {
          console.error("❌ Backend returned non-array data:", data);
          setItems([]);
          return;
        }
        
        const normalized = data.map((n: any) => {
          const normalizedNotif = normalizeNotification(n);
          console.log("📝 Normalized notification:", normalizedNotif);
          return normalizedNotif;
        });
        console.log("📋 All normalized notifications:", normalized);
        setItems(normalized);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch notifications:", err.message);
        console.error("❌ Full error:", err);
        console.error("❌ Error response:", err.response?.data);
        console.error("❌ Error status:", err.response?.status);
      });

    // realtime listener
    const s = getSocket();
    function onNew(n: any) {
      console.log("🔴 Incoming real-time notification:", n);
      setItems((prev: Notification[]) => [normalizeNotification(n), ...prev]);
    }
    s.on('notification.created', onNew);

    return () => {
      s.off('notification.created', onNew);
    };
  }, [user, token, isLoading, notifVersion]); // Add isLoading dependency

  function markAllRead() {
    if (!token) return;
    api.patch('/notifications/read-all', {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setItems((prev: Notification[]) => prev.map((n: Notification) => ({ ...n, read: true })));
    });
  }

  // Temporary test function
  function testFetchNotifications() {
    console.log("🧪 Testing notification fetch manually...");
    if (!token) {
      console.log("❌ No token available");
      return;
    }
    
    api.get('/notifications')
      .then(({ data }) => {
        console.log("✅ Manual fetch successful:", data);
      })
      .catch((err) => {
        console.error("❌ Manual fetch failed:", err);
      });
  }

  const bellButtonStyle: React.CSSProperties = {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: 'var(--text)'
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    fontSize: '12px',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    right: '0',
    marginTop: '8px',
    width: '320px',
    backgroundColor: 'var(--panel)',
    color: 'var(--text)',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    padding: '16px',
    zIndex: 1000,
    border: `1px solid var(--border)`,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  };

  const markAllButtonStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#3b82f6',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  };

  const notificationItemStyle = (isRead: boolean): React.CSSProperties => ({
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '8px',
    backgroundColor: isRead ? 'transparent' : '#2a3c61',
    fontWeight: isRead ? 'normal' : 'bold',
  });

  const timestampStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '4px',
  };

  return (
    <div style={{ position: 'relative' }}>
      {isLoading ? (
        // Show loading state
        <button
          style={{ ...bellButtonStyle, opacity: 0.7 }}
          disabled
        >
          <Bell style={{ width: '24px', height: '24px', color: '#888' }} />
        </button>
      ) : !user || !token ? (
        // Show disabled bell when not authenticated
        <button
          style={{ ...bellButtonStyle, opacity: 0.5, cursor: 'not-allowed' }}
          disabled
        >
          <Bell style={{ width: '24px', height: '24px', color: '#666' }} />
        </button>
      ) : (
        // Show functional bell when authenticated
        <>
          <button
            style={bellButtonStyle}
            onClick={() => {
              console.log("🔔 Bell clicked! Current open state:", open);
              console.log("🔔 Auth state:", { user: !!user, token: !!token, isLoading });
              setOpen(!open);
              console.log("🔔 Setting open to:", !open);
            }}
          >
            <Bell style={{ width: '22px', height: '22px', color: 'currentColor' }} />
            {unreadCount > 0 && (
              <span style={badgeStyle}>
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div style={dropdownStyle}>
              <div style={headerStyle}>
                <span style={{ fontWeight: 'bold' }}>Notifications</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{ ...markAllButtonStyle, color: '#10b981' }}
                    onClick={testFetchNotifications}
                  >
                    Test Fetch
                  </button>
                  <button
                    style={markAllButtonStyle}
                    onClick={markAllRead}
                  >
                    Mark all read
                  </button>
                </div>
              </div>
              {items.length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                  No notifications yet
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {items.map((n, index) => {
                    console.log(`📝 Rendering notification ${index}:`, n);
                    return (
                      <div
                        key={n._id}
                        style={notificationItemStyle(n.read)}
                      >
                        <div style={{ fontSize: '14px' }}>
                          {n.message}
                        </div>
                        <div style={timestampStyle}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          From: {n.fromUser} • Type: {n.type}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
