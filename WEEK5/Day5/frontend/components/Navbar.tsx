"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { useState } from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  transparent?: boolean;
  showAuthButtons?: boolean;
}

export default function Navbar({ transparent = false, showAuthButtons = false }: NavbarProps) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div>Call Us <strong>570-694-4002</strong></div>
        <div>Email id: <strong>info@cardeposit.com</strong></div>
      </div>

      {/* Header */}
      <header className={transparent ? styles.header : styles.headerSolid}>
        <div className={styles.logoRow}>
          <div className={styles.logo}>
            <Image src="/images/carlogo.png" alt="Car Deposit" width={120} height={40} />
          </div>
          <nav className={styles.nav}>
            <Link href="/">Home</Link>
            <Link href="/auctions">Car Auction</Link>
            <Link href="/sell">Sell Your Car</Link>
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          {(showAuthButtons || user) ? (
            user ? (
              <div className={styles.authButtons}>
                <Link href="/my-account" className={styles.signIn}>My Account</Link>
                <button onClick={handleLogout} className={styles.registerNow}>Logout</button>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/login" className={styles.signIn}>Sign in</Link>
                <Link href="/register" className={styles.registerNow}>Register now</Link>
              </div>
            )
          ) : (
            <div className={styles.headerIcons}>
              <Image src="/images/star.png" alt="Star" width={20} height={20} className={styles.icon} />

              {/* Notifications Bell */}
              <div className={styles.notifWrapper}>
                <button aria-label="Notifications" className={styles.bellBtn} onClick={() => setOpen(v => !v)}>
                  <Image src="/images/bell.png" alt="Bell" width={20} height={20} className={styles.icon} />
                  {unreadCount > 0 && <span className={styles.badge}>{Math.min(unreadCount, 9)}{unreadCount > 9 ? '+' : ''}</span>}
                </button>

                {open && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <button className={styles.markAll} onClick={() => markAllRead()}>Mark all read</button>
                      )}
                    </div>
                    <div className={styles.dropdownList}>
                      {notifications.length === 0 && (
                        <div className={styles.empty}>No notifications</div>
                      )}
                      {notifications.map(n => (
                        <Link
                          key={n._id}
                          href={
                            n.type === 'winner' ? `/bid/${n.payload?.auctionId}` :
                            n.type === 'auction_ended' ? `/bid/${n.payload?.auctionId}/results` :
                            n.type === 'outbid' ? `/bid/${n.payload?.auctionId}` :
                            '/auctions'
                          }
                          className={styles.item + (n.read ? '' : ' ' + styles.unread)}
                          onClick={() => {
                            setOpen(false);
                            if (!n.read) markRead(n._id);
                          }}
                        >
                          <div className={styles.itemTitle}>
                            {n.type === 'winner' && 'You won the auction'}
                            {n.type === 'auction_ended' && 'Auction ended'}
                            {n.type === 'outbid' && 'You have been outbid'}
                            {n.type === 'new_bid' && 'New bid on your auction'}
                            {!['winner','auction_ended','outbid','new_bid'].includes(n.type) && n.type}
                          </div>
                          <div className={styles.itemSub}>{n.payload?.message || ''}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Image src="/images/car.png" alt="Car" width={20} height={20} className={styles.icon} />
            </div>
          )}
        </div>
      </header>
    </>
  );
}
