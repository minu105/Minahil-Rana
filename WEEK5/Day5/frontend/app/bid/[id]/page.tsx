"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import styles from "./bid.module.css";
import { useNotifications } from "@/context/NotificationsContext";
import { getSocket } from "@/lib/socket";

interface Car {
  _id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage?: number;
  description?: string;
  photos?: string[];
  color?: string;
  transmission?: string;
  fuelType?: string;
  bodyType?: string;
}

interface Bidder { _id?: string; id?: string; name?: string; email?: string; avatarUrl?: string; nationality?: string; mobile?: string; idType?: string; }

interface BidItem { _id: string; amount: number; createdAt?: string; bidder?: Bidder }

interface Auction {
  _id: string;
  status: string;
  startPrice?: number;
  endAt?: string;
  startAt?: string;
  car: any; 
  topBid?: { amount?: number; bidder?: Bidder };
  bids?: BidItem[];
  minIncrement?: number;
  lotNumber?: number;
}

function fmt(n?: number) { return typeof n === 'number' ? n.toLocaleString() : n as any; }

import Image from "next/image";

export default function BidPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { joinAuctionRoom, leaveAuctionRoom } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<BidItem[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [me, setMe] = useState<any|null>(null);
  const paidKey = useMemo(() => (me?._id || me?.id) && (auction?._id || id)
    ? `auctionPayment:${auction?._id || id}:${me?._id || me?.id}` : "",
    [me, auction, id]
  );
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!paidKey) return;
    try {
      const v = typeof window !== 'undefined' ? window.localStorage.getItem(paidKey) : null;
      setIsPaid(v === 'paid');
    } catch {}
  }, [paidKey]);
  const [toast, setToast] = useState<{type:'success'|'error', message:string}|null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [topProfile, setTopProfile] = useState<Bidder | undefined>(undefined);
  const router = useRouter();

  const backendOrigin = useMemo(()=>{
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    return base.replace(/\/$/, "");
  },[]);

  // Normalize bidder data coming from backend to expected shape
  const normalizeBidder = (b: any | undefined | null): Bidder | undefined => {
    if (!b) return undefined;
    // If backend sent only an ObjectId string
    if (typeof b === 'string') {
      return { _id: b, id: b };
    }
    const first = b.firstName || b.firstname || b.givenName;
    const last = b.lastName || b.lastname || b.surname;
    const full = b.fullName || b.displayName || b.username || [first, last].filter(Boolean).join(' ').trim();
    const email = b.email || b.emailAddress || b.mail;
    const avatar = b.avatarUrl || b.avatar || b.photoUrl || b.profilePicture || b.picture;
    return {
      _id: b._id || b.id,
      id: b.id || b._id,
      name: b.name || full || undefined,
      email,
      avatarUrl: avatar,
      nationality: b.nationality,
      mobile: b.mobile || b.phone,
      idType: b.idType
    };
  };

  const normalizeBid = (bid: any): BidItem => ({
    _id: bid._id || bid.id || String(Date.now()),
    amount: Number(bid.amount) || 0,
    createdAt: bid.createdAt || bid.created_at || new Date().toISOString(),
    bidder: normalizeBidder(bid.bidder || bid.user || bid.createdBy)
  });

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
        // Try to get current user (ignore errors)
        try {
          const meRes = await api.get('/auth/me');
          setMe(meRes.data?.user ?? meRes.data ?? null);
        } catch {}
        const aRes = await api.get(`/auctions/${id}`);
        let a: Auction = aRes.data?.auction ?? aRes.data;

        let car: Car | null = null;
        if (a?.car) {
          try {
            const carRes = await api.get(`/cars/${a.car}`);
            car = carRes.data?.car ?? carRes.data;
          } catch (e) {
            console.warn('Failed to load car details for auction', a.car, e);
          }
        }
        const merged: any = car ? { ...a, car } : a;
        setAuction(merged);

        // Try to get bids from multiple sources
        let initialBids: BidItem[] = [];
        
        // Try bids endpoint
        try {
          const bRes = await api.get(`/auctions/${id}/bids`, { params: { limit: 50 } });
          console.log('Initial bids load:', bRes.data);
          
          if (Array.isArray(bRes.data) && bRes.data.length > 0) {
            initialBids = bRes.data.map(normalizeBid);
          } else if (bRes.data?.items && Array.isArray(bRes.data.items)) {
            initialBids = bRes.data.items.map(normalizeBid);
          } else if (bRes.data?.bids && Array.isArray(bRes.data.bids)) {
            initialBids = bRes.data.bids.map(normalizeBid);
          }
        } catch (e) {
          console.warn('Failed to load bids:', e);
        }
        
        // Fallback: Try a generic /bids endpoint filtered by auction id
        if (initialBids.length === 0) {
          try {
            const gRes = await api.get(`/bids`, { params: { auction: id, limit: 100, sort: '-createdAt' } });
            console.log('Generic /bids load:', gRes.data);
            if (Array.isArray(gRes.data) && gRes.data.length > 0) {
              initialBids = gRes.data.map(normalizeBid);
            } else if (gRes.data?.items && Array.isArray(gRes.data.items)) {
              initialBids = gRes.data.items.map(normalizeBid);
            }
          } catch (e) {
            console.warn('Generic /bids load failed:', e);
          }
        }
        
        // If the dedicated endpoint didn't return, try embedded auction.bids
        if (initialBids.length === 0 && Array.isArray(merged?.bids) && merged.bids.length > 0) {
          try {
            initialBids = merged.bids.map(normalizeBid);
          } catch {}
        }
        
        // If no bids found but auction has topBid, create a bid entry strictly from auction.topBid data
        if (initialBids.length === 0 && merged.topBid && merged.topBid.amount) {
          console.log('Creating bid from auction topBid:', merged.topBid);
          initialBids = [{
            _id: 'top-bid-' + Date.now(),
            amount: merged.topBid.amount,
            createdAt: new Date().toISOString(),
            bidder: normalizeBidder((merged as any).topBid?.bidder || (merged as any).topBid?.user)
          }];
        }
        
        // Sort newest-first for stack behavior
        initialBids = [...initialBids].sort((a,b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (tb !== ta) return tb - ta;
          return (b.amount || 0) - (a.amount || 0);
        });
        console.log('Setting initial bids:', initialBids);
        setBids(initialBids);

        // Calculate next minimum bid
        const currentHighest = Math.max(
          (merged.topBid?.amount ?? 0),
          (initialBids.length > 0 ? Math.max(...initialBids.map(b => b.amount)) : 0),
          (merged.startPrice ?? 0)
        );
        const nextMin = currentHighest + (merged.minIncrement || 100);
        setAmount(String(nextMin));
      } catch (e:any) {
        console.error('Load auction detail failed', e);
        setToast({ type: 'error', message: 'Failed to load auction' });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Join auction room for real-time updates and handle newBid events
  useEffect(() => {
    if (!id) return;
    try { joinAuctionRoom(id); } catch {}

    const sock = getSocket();
    const onNewBid = (p: any) => {
      if (!p || String(p.auctionId) !== String(id)) return;
      // append incoming bid to top of list
      setBids(prev => [
        normalizeBid({ _id: p.bidId || `rt-${Date.now()}`, amount: Number(p.amount)||0, createdAt: p.createdAt || new Date().toISOString(), bidder: p.bidder || p.user }),
        ...prev,
      ]);
    };
    sock?.on('newBid', onNewBid);

    return () => {
      try { leaveAuctionRoom(id); } catch {}
      sock?.off('newBid', onNewBid);
    };
  }, [id, joinAuctionRoom, leaveAuctionRoom]);

  const topBidAmount = useMemo(() => {
    if (!auction) return 0;
    const auctionTop = auction.topBid?.amount ?? 0;
    const bidsTop = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
    return Math.max(auctionTop, bidsTop, auction.startPrice || 0);
  }, [auction, bids]);

  const topBidder = useMemo(() => {
    if (!bids || bids.length === 0) return normalizeBidder((auction as any)?.topBid?.bidder || (auction as any)?.topBid?.user);
    const top = bids.reduce((max, current) => (current.amount > max.amount ? current : max), bids[0]);
    // Fallbacks: use auction.topBid when bidder not populated; if the latest highest is the current user's amount, show current user
    return (
      normalizeBidder(top?.bidder) ||
      normalizeBidder((auction as any)?.topBid?.bidder || (auction as any)?.topBid?.user) ||
      (top?.amount === topBidAmount ? normalizeBidder(me) : undefined)
    );
  }, [bids, auction, topBidAmount, me]);

  // Enrich top bidder profile using /users/:id if needed
  useEffect(() => {
    const needsEnrich = (u?: Bidder) => {
      if (!u) return false;
      // if missing at least one key field, try enrichment
      return !(u.name && u.email && u.avatarUrl);
    };
    (async () => {
      const u = topBidder;
      if (!u) { setTopProfile(undefined); return; }
      if (!needsEnrich(u)) { setTopProfile(u); return; }
      const uid = u._id || u.id;
      if (!uid) { setTopProfile(u); return; }
      try {
        const r = await api.get(`/users/${uid}`);
        const full = normalizeBidder(r.data);
        setTopProfile({ ...u, ...full });
      } catch {
        setTopProfile(u);
      }
    })();
  }, [topBidder]);

  const step = Math.max(1, Number(auction?.minIncrement ?? 100));

  async function submitBid() {
    if (!auction) return;
    if (!me) {
      setToast({ type: 'error', message: 'Please login to place a bid' });
      try {
        router.push(`/login?redirect=/bid/${auction?._id || id}`);
      } catch {}
      return;
    }
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= topBidAmount) {
      setToast({ type: 'error', message: 'Enter a higher bid amount' });
      return;
    }
    try {
      setSubmitting(true);
      
      // Submit the bid
      const bidResponse = await api.post(`/auctions/${auction._id}/bids`, { amount: val });
      console.log('Bid response:', bidResponse.data);
      const newBid = bidResponse.data?.bid || bidResponse.data;
      // Optimistically prepend new bid for instant UI update
      setBids(prev => [
        normalizeBid({ _id: newBid?._id, amount: val, createdAt: new Date().toISOString(), bidder: newBid?.bidder || me }),
        ...prev
      ]);
      // Optimistically set top bidder profile to the current logged-in user
      try {
        // Prefer full profile from /users/me
        const myFull = await api.get('/users/me').then(r => r.data).catch(() => null);
        setTopProfile(normalizeBidder(myFull) || normalizeBidder(me));
      } catch { setTopProfile(normalizeBidder(me)); }
      
      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try multiple approaches to get bids
      let freshBids: BidItem[] = [];
      
      try {
        // Approach 1: Standard bids endpoint
        const bidsRes = await api.get(`/auctions/${auction._id}/bids`, { params: { limit: 100 } });
        console.log('Bids response:', bidsRes.data);
        
        if (Array.isArray(bidsRes.data) && bidsRes.data.length > 0) {
          freshBids = bidsRes.data.map(normalizeBid);
        } else if (bidsRes.data?.items && Array.isArray(bidsRes.data.items)) {
          freshBids = bidsRes.data.items.map(normalizeBid);
        } else if (bidsRes.data?.bids && Array.isArray(bidsRes.data.bids)) {
          freshBids = bidsRes.data.bids.map(normalizeBid);
        }
      } catch (e) {
        console.warn('Failed to fetch bids:', e);
      }
      
      // Approach 2: Generic /bids with auction filter
      if (freshBids.length === 0) {
        try {
          const gen = await api.get(`/bids`, { params: { auction: auction._id, limit: 100, sort: '-createdAt' } });
          console.log('Generic /bids after submit:', gen.data);
          if (Array.isArray(gen.data) && gen.data.length > 0) {
            freshBids = gen.data.map(normalizeBid);
          } else if (gen.data?.items && Array.isArray(gen.data.items)) {
            freshBids = gen.data.items.map(normalizeBid);
          }
        } catch (e) {
          console.warn('Generic /bids after submit failed:', e);
        }
      }
      
      // Fallback: If no bids returned but we have a new bid, add it manually
      if (freshBids.length === 0 && newBid) {
        console.log('Using fallback - adding new bid manually');
        // Attribute the bid to the server-returned bidder if present, otherwise to the logged-in user
        const currentUser = normalizeBidder(me);
        const manualBid: BidItem = {
          _id: newBid._id || Date.now().toString(),
          amount: val,
          createdAt: new Date().toISOString(),
          bidder: normalizeBidder(newBid.bidder) || currentUser || undefined
        };
        // Merge with any previously known bids so older ones remain visible
        freshBids = [manualBid, ...bids];
      }
      
      // Merge with existing bids to avoid losing older entries
      freshBids = [...freshBids, ...bids];

      // De-duplicate; prioritize unique _id when present
      const seen = new Set<string>();
      freshBids = freshBids.filter(b => {
        const key = b._id ? String(b._id) : `${b.amount}-${b.createdAt}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Enforce stack-like ordering: newest first; fallback to amount when timestamps missing
      freshBids = [...freshBids].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tb !== ta) return tb - ta;
        return (b.amount || 0) - (a.amount || 0);
      });
      console.log('Final processed bids:', freshBids);
      setBids(freshBids);
      
      // Refresh auction data
      const auctionRes = await api.get(`/auctions/${auction._id}`);
      console.log('Auction response:', auctionRes.data);
      const freshAuction = auctionRes.data?.auction ?? auctionRes.data;
      
      // Preserve car data and photos to prevent images from disappearing
      if (auction.car && !freshAuction.car) {
        freshAuction.car = auction.car;
      } else if (auction.car && freshAuction.car && !freshAuction.car.photos) {
        freshAuction.car.photos = auction.car.photos;
      }
      
      // Update auction with new top bid if needed
      if (freshBids.length > 0) {
        const highestBid = Math.max(...freshBids.map(b => b.amount));
        const topBidEntry = freshBids.find(b => b.amount === highestBid);
        let bidder = normalizeBidder(topBidEntry?.bidder);
        if (!bidder && highestBid === val) bidder = normalizeBidder(newBid?.bidder) || normalizeBidder(me) || bidder;
        // Store both for compatibility with backend shape
        const bidUserId = bidder?._id || bidder?.id || (me?._id || me?.id);
        freshAuction.topBid = { amount: highestBid, bidder, user: bidUserId } as any;
      }
      
      setAuction(freshAuction);
      
      // Set next minimum bid amount
      const currentMax = Math.max(
        (freshAuction?.topBid?.amount ?? 0),
        (freshBids.length > 0 ? Math.max(...freshBids.map(b => b.amount)) : 0),
        (freshAuction?.startPrice ?? 0)
      );
      const nextMin = currentMax + (freshAuction?.minIncrement || 100);
      setAmount(String(nextMin));
      
      setToast({ type: 'success', message: 'Bid submitted successfully!' });
    } catch (e:any) {
      console.error('Bid submission error:', e);
      const msg = e?.response?.data?.message || e?.message || 'Bid submission failed';
      setToast({ type: 'error', message: String(msg) });
    } finally {
      setSubmitting(false);
    }
  }

  const getTimeRemaining = (endTimeStr?: string) => {
    if (!endTimeStr) return { d: 0, h: 0, m: 0, s: 0, ended: true };
    const diff = new Date(endTimeStr).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, ended: true };
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return { d, h, m, s, ended: false };
  };

  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, ended: true });

  useEffect(() => {
    if (auction?.endAt) {
      setTimeLeft(getTimeRemaining(auction.endAt));
      const timer = setInterval(() => {
        setTimeLeft(getTimeRemaining(auction.endAt));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [auction?.endAt]);

  if (loading) return <div className={styles.page}><Navbar /><div className={styles.container}>Loading...</div><Footer /></div>;
  if (!auction) return <div className={styles.page}><Navbar /><div className={styles.container}>Auction not found.</div><Footer /></div>;

  const auctionEnded = (() => {
    const endedByTimer = timeLeft.ended;
    const endedByClock = auction?.endAt ? new Date(auction.endAt).getTime() <= Date.now() : false;
    return endedByTimer || endedByClock || auction?.status === 'ended' || auction?.status === 'closed';
  })();

  const winnerUser = (() => {
    if (bids && bids.length > 0) {
      const top = bids.reduce((max, cur) => (cur.amount > max.amount ? cur : max), bids[0]);
      return normalizeBidder(top.bidder);
    }
    return normalizeBidder((auction as any)?.topBid?.bidder || (auction as any)?.topBid?.user);
  })();

  const isMeWinner = (() => {
    const meId = (me as any)?._id || (me as any)?.id;
    const wId = winnerUser?._id || winnerUser?.id;
    return !!(meId && wId && String(meId) === String(wId));
  })();

  // Decide button interactivity clearly
  const canInteract = (() => {
    // Always allow clicking when auction ended (to view results)
    if (auctionEnded) return true;
    // When live, require login
    return auction?.status === 'live' && !!me;
  })();

  function onMakePayment() {
    // Navigate to a payment page or open modal – placeholder navigation
    try {
      router.push(`/bid/${auction?._id || id}/payment`);
    } catch {}
  }

  function onViewResults() {
    try {
      if (auction?._id) router.push(`/bid/${auction._id}/results`);
    } catch {}
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{auction?.car?.title || 'Auction Details'}</h1>
          <p className={styles.heroSub}>Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mus.</p>
          <div className={styles.breadcrumb}><span>Home</span><span>›</span><span>Auction Detail</span></div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.titleBar}>
          <div>{auction?.car?.title}</div>
          <button className={styles.iconBtn} aria-label="bookmark">
            <img src="/images/star.png" width={20} height={20} alt="star" />
          </button>
        </div>

        <div className={styles.mainGrid}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            <div className={styles.gallery}>
              <div className={styles.mainImageWrapper}>
                {auction?.status === 'live' && <div className={styles.liveBadge}>Live (H)</div>}
<img src={images[activeImage] || 'https://via.placeholder.com/600x400/f0f0f0/666?text=Car+Image'} alt={auction.car?.title || 'Car'} className={styles.mainImage} />
              </div>
              <div className={styles.thumbnailGrid}>
                {images.slice(0, 6).map((img: string, i: number) => (
<img key={i} src={img || 'https://via.placeholder.com/100x80/f0f0f0/666?text=Car'} alt={`thumbnail-${i}`} className={`${styles.thumbnail} ${i === activeImage ? styles.activeThumbnail : ''}`} onClick={() => setActiveImage(i)} />
                ))}
              </div>
            </div>

            {auctionEnded ? (
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
                  <div className={`${styles.kpiValue} ${styles.kpiWinAmount}`}>${fmt(topBidAmount)}</div>
                  <div className={styles.kpiLabel}>Winning Bid</div>
                </div>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>{auction.lotNumber || '-'}</div>
                  <div className={styles.kpiLabel}>Lot No.</div>
                </div>
                {isMeWinner && !isPaid && (
                  <>
                    <div className={`${styles.kpiItem} ${styles.kpiNoteRow}`} style={{flex: 2, textAlign:'left'}}>
                      <div className={styles.kpiNote}>Note: Please make your payment in next 6 Days</div>
                    </div>
                    <div className={styles.kpiItem} style={{textAlign:'right'}}>
                      <div className={styles.kpiLabel}>Pending Amount</div>
                      <div className={styles.kpiValue}>${fmt(topBidAmount)}</div>
                    </div>
                  </>
                )}
                {isMeWinner && (
                  <div className={styles.kpiItem} style={{flexBasis: '220px'}}>
                    <button className={styles.btnOutline} onClick={onMakePayment} disabled={isPaid}>
                      {isPaid ? 'Payment Done' : 'Make Payments'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.kpisBar}>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue} style={{display: 'flex', gap: '4px'}}>
                    <div className={styles.timeBox}>{String(timeLeft.d).padStart(2,'0')}</div>
                    <div className={styles.timeBox}>{String(timeLeft.h).padStart(2,'0')}</div>
                    <div className={styles.timeBox}>{String(timeLeft.m).padStart(2,'0')}</div>
                    <div className={styles.timeBox}>{String(timeLeft.s).padStart(2,'0')}</div>
                  </div>
                  <div className={styles.kpiLabel}>Days Hours Mins Secs</div>
                </div>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>${fmt(topBidAmount)}</div>
                  <div className={styles.kpiLabel}>Current Bid</div>
                </div>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>{auction.endAt ? new Date(auction.endAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A'}</div>
                  <div className={styles.kpiLabel}>End Time</div>
                </div>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>${fmt(auction.minIncrement)}</div>
                  <div className={styles.kpiLabel}>Min. Increment</div>
                </div>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>{bids.length}</div>
                  <div className={styles.kpiLabel}>Total Bids</div>
                </div>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>{auction.lotNumber || '-'}</div>
                  <div className={styles.kpiLabel}>Lot No.</div>
                </div>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>{fmt(auction.car?.mileage)} K.M</div>
                  <div className={styles.kpiLabel}>Odometer</div>
                </div>
              </div>
            )}

            <div className={styles.section}>
              <div className={`${styles.sectionHeader} ${styles.descHeader}`}>
                <span className={styles.sectionAccent} />
                <span>Description</span>
              </div>
              <div className={styles.sectionBody}>
                <p>{auction.car?.description || 'Lorem ipsum dolor sit amet consectetur. Duis ac sodales vulputate dolor volutpat ac. Turpis ut neque eu adipiscing nibh nunc gravida. Ipsum at feugiat id dui elementum nibh nec suspendisse. Ut sapien metus elementum tincidunt euismod.'}</p>
              </div>
            </div>

            <div className={`${styles.section} ${styles.topBidderSection}`}>
              <div className={styles.sectionHeader}>Top Bidder</div>
              <div className={styles.sectionBody}>
                {topProfile || topBidder ? (
                  <div className={styles.topBidderCard}>
                    {(() => { const u = (topProfile || topBidder)!; return (
<img className={styles.topAvatar} src={u.avatarUrl?.startsWith('http')? u.avatarUrl : (u.avatarUrl ? `${backendOrigin}${u.avatarUrl}` : 'https://via.placeholder.com/80x80/e0e0e0/666?text=User')} alt={u.name||'User'} width={80} height={80} />
                    ); })()}
                    <div className={styles.metaGrid}>
                      {(() => { const u = (topProfile || topBidder)!; return (
                        <>
                          <div><b>Full Name</b><div>{u.name || u.email || '—'}</div></div>
                          <div><b>Email</b><div className={styles.emailPill}>{u.email || '—'}</div></div>
                          <div><b>Mobile Number</b><div>{u.mobile || '—'}</div></div>
                          <div><b>Nationality</b><div>{u.nationality || '—'}</div></div>
                          <div><b>ID Type</b><div>{u.idType || '—'}</div></div>
                        </>
                      ); })()}
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign: 'center', padding: '2rem'}}>No bids yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            <div className={styles.sideCard}>
                <div className={styles.sideTopRow}>
                    <div>
                        <div className={styles.sideLabel}>Bid Starts From</div>
                        <div className={styles.sideValue}>${fmt(auction.startPrice)}</div>
                    </div>
                    <div>
                        <div className={styles.sideLabel}>Current Bid</div>
                        <div className={styles.sideValue}>${fmt(topBidAmount)}</div>
                    </div>
                </div>
                <div className={styles.bidForm}>
                    <label className={styles.bidPlacedLabel}>Bid Placed</label>
                    <div className={styles.stepper}>
                        <button className={styles.stepBtn} onClick={()=>setAmount(a=>String(Math.max(topBidAmount + step, (Number(a)||0) - step)))}>-</button>
                        <input className={styles.input} value={`$${amount}`} onChange={(e) => setAmount(e.target.value.replace(/\$/g, ''))} type="text" />
                        <button className={styles.stepBtn} onClick={()=>setAmount(a=>String((Number(a)||0)+step))}>+</button>
                    </div>
                    <button
                      className={styles.btn}
                      disabled={submitting}
                      onClick={() => {
                        if (auctionEnded) return onViewResults();
                        if (!me) return router.push(`/login?redirect=/bid/${auction?._id || id}`);
                        return submitBid();
                      }}
                    >
                      {submitting
                        ? 'Submitting...'
                        : (auctionEnded
                          ? 'View Auction Results'
                          : (!me ? 'Login to Bid' : 'Submit A Bid'))}
                    </button>
                </div>
            </div>

            <div className={`${styles.sideCard} ${styles.biddersListCard}`}>
              <div className={styles.sectionHeader}>Bidders List</div>
              <div className={styles.sectionBody}>
                <div className={styles.list}>
                  {bids.length === 0 ? (
                    <div style={{padding: '1rem', textAlign: 'center'}}>No bids yet.</div>
) : bids.map((b, i) => (
                    <div key={b._id || i} className={styles.listItem}>
                      <div>{b.bidder?.name || b.bidder?.email || `Bidder ${i+1}`}</div>
                      <div style={{fontWeight:700}}>${fmt(b.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`} onAnimationEnd={()=>setToast(null)}>
            {toast.message}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
