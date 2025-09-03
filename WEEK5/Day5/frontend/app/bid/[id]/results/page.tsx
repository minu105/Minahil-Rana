"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import styles from "../bid.module.css";

interface Bidder { _id?: string; id?: string; name?: string; email?: string; avatarUrl?: string; nationality?: string; mobile?: string; idType?: string; }
interface BidItem { _id: string; amount: number; createdAt?: string; bidder?: Bidder }
interface Auction { _id: string; status: string; endAt?: string; startPrice?: number; minIncrement?: number; lotNumber?: number; car?: any; topBid?: { amount?: number; bidder?: Bidder } }

const normalizeBidder = (b: any | undefined | null): Bidder | undefined => {
  if (!b) return undefined;
  if (typeof b === 'string') return { _id: b, id: b };
  const first = b.firstName || b.firstname || b.givenName;
  const last = b.lastName || b.lastname || b.surname;
  const full = b.fullName || b.displayName || b.username || [first, last].filter(Boolean).join(' ').trim();
  const email = b.email || b.emailAddress || b.mail;
  const avatar = b.avatarUrl || b.avatar || b.photoUrl || b.profilePicture || b.picture;
  return { _id: b._id || b.id, id: b.id || b._id, name: b.name || full || undefined, email, avatarUrl: avatar, nationality: b.nationality, mobile: b.mobile || b.phone, idType: b.idType };
};

const normalizeBid = (bid: any): BidItem => ({ _id: bid._id || bid.id || String(Date.now()), amount: Number(bid.amount) || 0, createdAt: bid.createdAt || bid.created_at || new Date().toISOString(), bidder: normalizeBidder(bid.bidder || bid.user || bid.createdBy) });

export default function BidResultsPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const router = useRouter();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(true);

  const backendOrigin = useMemo(()=>{
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    return base.replace(/\/$/, "");
  },[]);

  const images = useMemo(() => {
    const photos = (auction?.car?.photos ?? []) as string[];
    return photos.map((p: string) => {
      if (!p) return '';
      if (p.startsWith('http')) return p;
      const rel = p.startsWith('/') ? p : `/${p}`;
      return `${backendOrigin}${rel}`;
    });
  }, [auction, backendOrigin]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const aRes = await api.get(`/auctions/${id}`);
        let a: Auction = aRes.data?.auction ?? aRes.data;
        let car: any = null;
        if (a?.car) {
          try { const carRes = await api.get(`/cars/${a.car}`); car = carRes.data?.car ?? carRes.data; } catch {}
        }
        const merged: any = car ? { ...a, car } : a;
        setAuction(merged);

        let initialBids: BidItem[] = [];
        try {
          const bRes = await api.get(`/auctions/${id}/bids`, { params: { limit: 100 } });
          if (Array.isArray(bRes.data)) initialBids = bRes.data.map(normalizeBid);
          else if (bRes.data?.items) initialBids = bRes.data.items.map(normalizeBid);
          else if (bRes.data?.bids) initialBids = bRes.data.bids.map(normalizeBid);
        } catch {}
        if (initialBids.length === 0) {
          try {
            const gRes = await api.get(`/bids`, { params: { auction: id, limit: 100, sort: '-createdAt' } });
            if (Array.isArray(gRes.data)) initialBids = gRes.data.map(normalizeBid);
            else if (gRes.data?.items) initialBids = gRes.data.items.map(normalizeBid);
          } catch {}
        }
        if (initialBids.length === 0 && merged.topBid?.amount) {
          initialBids = [{ _id: 'top-bid-'+Date.now(), amount: merged.topBid.amount, createdAt: new Date().toISOString(), bidder: normalizeBidder((merged as any).topBid?.bidder || (merged as any).topBid?.user) }];
        }
        initialBids = [...initialBids].sort((a,b)=>{
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (tb !== ta) return tb - ta; return (b.amount||0)-(a.amount||0);
        });
        setBids(initialBids);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const topBidAmount = useMemo(()=>{
    if (!auction) return 0;
    const auctionTop = auction.topBid?.amount ?? 0;
    const bidsTop = bids.length>0 ? Math.max(...bids.map(b=>b.amount)) : 0;
    return Math.max(auctionTop, bidsTop, auction.startPrice || 0);
  }, [auction, bids]);

  const winnerUser = useMemo(() => {
    if (bids && bids.length > 0) {
      const top = bids.reduce((max, cur) => (cur.amount > max.amount ? cur : max), bids[0]);
      return normalizeBidder(top.bidder);
    }
    return normalizeBidder((auction as any)?.topBid?.bidder || (auction as any)?.topBid?.user);
  }, [bids, auction]);

  const [winnerProfile, setWinnerProfile] = useState<Bidder | undefined>(undefined);

  useEffect(() => {
    // initialize from computed winnerUser
    setWinnerProfile(winnerUser);
  }, [winnerUser]);

  useEffect(() => {
    // if we only have an id and no name/email, try fetching the user profile
    const needsFetch = winnerProfile && (!winnerProfile.name && !winnerProfile.email) && (winnerProfile._id || winnerProfile.id);
    const userId = winnerProfile?._id || winnerProfile?.id;
    if (!needsFetch || !userId) return;
    (async () => {
      const tryPaths = [
        `/users/${userId}`,
        `/api/users/${userId}`,
        `/users/profile/${userId}`,
      ];
      for (const p of tryPaths) {
        try {
          const res = await api.get(p);
          const u = res.data?.user || res.data;
          if (u) {
            const norm = normalizeBidder(u);
            setWinnerProfile(prev => ({ ...prev, ...norm }));
            break;
          }
        } catch (_) {
          // try next path
        }
      }
    })();
  }, [winnerProfile]);

  if (loading) return <div className={styles.page}><Navbar /><div className={styles.container}>Loading...</div><Footer /></div>;
  if (!auction) return <div className={styles.page}><Navbar /><div className={styles.container}>Auction not found.</div><Footer /></div>;

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{auction?.car?.title || 'Auction Results'}</h1>
          <p className={styles.heroSub}>Final results summary and winner details</p>
          <div className={styles.breadcrumb}><span>Home</span><span>›</span><span>Auction Results</span></div>
        </div>

        {/* Winner Profile */}
        <div className={styles.topBidderSection}>
          <div className={styles.sectionHeader}>Winner</div>
          <div className={styles.sectionBody}>
            {winnerProfile ? (
              <div className={styles.topBidderCard}>
                <img
                  className={styles.topAvatar}
                  src={winnerProfile.avatarUrl?.startsWith('http') ? winnerProfile.avatarUrl : (winnerProfile.avatarUrl ? `${backendOrigin}${winnerProfile.avatarUrl}` : 'https://via.placeholder.com/80x80/e0e0e0/666?text=User')}
                  alt={winnerProfile.name || 'User'}
                  width={80}
                  height={80}
                />
                <div className={styles.metaGrid}>
                  <div><b>Full Name</b><div>{winnerProfile.name || winnerProfile.email || '—'}</div></div>
                  <div><b>Email</b><div className={styles.emailPill}>{winnerProfile.email || '—'}</div></div>
                  <div><b>Winning Amount</b><div>${topBidAmount.toLocaleString()}</div></div>
                </div>
              </div>
            ) : (
              <div style={{textAlign:'center', padding:'1.25rem'}}>No winner information available.</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* KPIs Ended Bar */}
        <div className={`${styles.kpisBar} ${styles.kpisEnded}`}>
          <div className={styles.kpiItem}>
            <div className={styles.kpiValue}>{auction.endAt ? new Date(auction.endAt).toLocaleDateString('en-GB') : '—'}</div>
            <div className={styles.kpiLabel}>Winning Date</div>
          </div>
          <div className={styles.kpiItem}>
            <div className={styles.kpiValue}>{auction.endAt ? new Date(auction.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
            <div className={styles.kpiLabel}>End Time</div>
          </div>
          <div className={styles.kpiItem}>
            <div className={`${styles.kpiValue} ${styles.kpiWinAmount}`}>${topBidAmount.toLocaleString()}</div>
            <div className={styles.kpiLabel}>Winning Bid</div>
          </div>
          <div className={styles.kpiItem}>
            <div className={styles.kpiValue}>{auction.lotNumber || '-'}</div>
            <div className={styles.kpiLabel}>Lot No.</div>
          </div>
        </div>

        {/* Bidders list */}
        <div className={`${styles.sideCard} ${styles.biddersListCard}`}>
          <div className={styles.sectionHeader}>Bidders List</div>
          <div className={styles.sectionBody}>
            <div className={styles.list}>
              {bids.length === 0 ? (
                <div style={{padding: '1rem', textAlign: 'center'}}>No bids.</div>
              ) : bids.map((b, i) => (
                <div key={b._id || i} className={styles.listItem}>
                  <div>{b.bidder?.name || b.bidder?.email || `Bidder ${i+1}`}</div>
                  <div style={{fontWeight:700}}>${b.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
