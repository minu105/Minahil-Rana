"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import styles from "./page.module.css";

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

interface Bidder { _id?: string; id?: string; name?: string; email?: string; avatarUrl?: string }

interface BidItem { _id: string; amount: number; createdAt?: string; bidder?: Bidder }

interface Auction {
  _id: string;
  status: string;
  startPrice?: number;
  endAt?: string;
  startAt?: string;
  car: any; // backend returns only ObjectId here; we'll fetch Car separately
  topBid?: { amount?: number; bidder?: Bidder };
  bids?: BidItem[];
}

function fmt(n?: number) { return typeof n === 'number' ? n.toLocaleString() : n as any; }

export default function AuctionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";

  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<BidItem[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [toast, setToast] = useState<{type:'success'|'error', message:string}|null>(null);

  const backendOrigin = useMemo(()=>{
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    return base.replace(/\/$/, "");
  },[]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const aRes = await api.get(`/auctions/${id}`);
        const a: Auction = aRes.data;

        // fetch car details explicitly
        let car: Car | null = null;
        if (a?.car) {
          try {
            const carRes = await api.get(`/cars/${a.car}`);
            car = carRes.data;
          } catch (e) {
            console.warn('Failed to load car details for auction', a.car, e);
          }
        }
        // merge fetched car into auction for UI rendering
        const merged: any = car ? { ...a, car } : a;
        setAuction(merged);

        // load bids (controller returns an array)
        const bRes = await api.get(`/auctions/${id}/bids`, { params: { limit: 50 } });
        setBids(Array.isArray(bRes.data) ? bRes.data : (bRes.data?.items || []));

        const nextMin = ((a as any)?.topBid?.amount ?? a.startPrice ?? 0) + 10;
        setAmount(String(nextMin));
      } catch (e:any) {
        console.error('Load auction detail failed', e);
        setToast({ type: 'error', message: 'Failed to load auction' });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const images = useMemo(() => {
    // prefer fetched car's photos when we have one
    const arr = ((auction as any)?.car?.photos || []) as string[];
    return arr.map((p: string) => {
      if (!p) return '';
      if (p.startsWith('http')) return p;
      // if relative like "/uploads/abc.jpg" or "uploads/abc.jpg"
      const rel = p.startsWith('/') ? p : `/${p}`;
      return `${backendOrigin}${rel}`;
    });
  }, [auction, backendOrigin]);

  const topBidAmount = (auction as any)?.topBid?.amount ?? auction?.startPrice ?? 0;
  // Backend stores only user id for topBid; profile details may not be available. Use bidder from bids list if enriched, else placeholders.
  const topBidder = bids[0]?.bidder || (auction as any)?.topBid?.bidder;

  const step = Math.max(1, Number((auction as any)?.minIncrement ?? 10));

  async function submitBid() {
    if (!auction) return;
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= (((auction as any).topBid?.amount) ?? auction.startPrice ?? 0)) {
      setToast({ type: 'error', message: 'Enter a higher bid amount' });
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await api.post(`/auctions/${auction._id}/bids`, { amount: val });
      // optimistic refresh
      const newBid: BidItem | undefined = data?.bid || data;
      if (newBid) setBids(prev => [newBid, ...prev]);
      // refresh auction for new top bid
      const { data: fresh } = await api.get(`/auctions/${auction._id}`);
      setAuction(fresh);
      const nextMin = (fresh?.topBid?.amount ?? fresh?.startPrice ?? 0) + 10;
      setAmount(String(nextMin));
      setToast({ type: 'success', message: 'Bid submitted!' });
    } catch (e:any) {
      const msg = e?.response?.data?.message || e?.message || 'Bid failed';
      setToast({ type: 'error', message: String(msg) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      {/* Hero header */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{auction?.car?.title || 'Audi Q3'}</h1>
          <div className={styles.heroSub}>Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mus.</div>
          <div className={styles.breadcrumb}><span>Home</span><span>›</span><span>Auction Detail</span></div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.titleBar}>
          <div>{auction?.car?.title || 'Auction'}</div>
          <div className={styles.titleRight}>
            <button className={styles.iconBtn} aria-label="bookmark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/star.png" width={20} height={20} alt="star" />
            </button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : !auction ? (
          <div>Not found</div>
        ) : (
          <>
            <div className={styles.grid}>
              {/* Left: Gallery and description */}
              <div>
                <div className={styles.gallery}>
                  {/* main image with live badge */}
                  <div className={styles.mainWrap}>
                    {auction?.status === 'live' && (
                      <div className={styles.liveBadge}>Live</div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={images[activeImage] || '/images/placeholder-car.jpg'}
                      alt={auction.car.title}
                      className={styles.mainImage}
                    />
                  </div>
                  {/* thumbs */}
                  <div className={styles.thumbs}>
                    {(Array.from({ length: 6 }).map((_, i) => images[i] || '/images/placeholder-car.jpg')).map((src: string, i: number) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt={`thumb-${i}`} className={styles.thumb} onClick={() => setActiveImage(i)} />
                    ))}
                  </div>
                </div>

                {/* KPIs row (single white bar with dividers) */}
                <div className={styles.kpisBar}>
                  <div className={styles.kpiItem}><div className={styles.kpiValue}>${fmt(topBidAmount)}</div><div className={styles.kpiLabel}>Current Bid</div></div>
                  <div className={styles.kpiItem}><div className={styles.kpiValue}>{auction.car.year}</div><div className={styles.kpiLabel}>Year</div></div>
                  <div className={styles.kpiItem}><div className={styles.kpiValue}>{fmt(auction.car.mileage)}</div><div className={styles.kpiLabel}>Mileage</div></div>
                  <div className={styles.kpiItem}><div className={styles.kpiValue}>{auction.car.fuelType||'-'}</div><div className={styles.kpiLabel}>Fuel</div></div>
                  <div className={styles.kpiItem}><div className={styles.kpiValue}>{auction.car.transmission||'-'}</div><div className={styles.kpiLabel}>Transmission</div></div>
                  <div className={styles.kpiItem}><div className={styles.kpiValue}>{auction.car.bodyType||'-'}</div><div className={styles.kpiLabel}>Body</div></div>
                </div>

                {/* Description */}
                <div className={styles.section}>
                  <div className={`${styles.sectionHeader} ${styles.descHeader}`}>
                    <span className={styles.sectionAccent} />
                    <span>Description</span>
                  </div>
                  <div className={styles.sectionBody}>
                    <p style={{whiteSpace:'pre-wrap'}}>
                      {auction.car.description ||
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
                    </p>
                  </div>
                </div>

                {/* All car fields available (quick spec table) */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>Specifications</div>
                  <div className={styles.sectionBody}>
                    <div className={styles.metaRow}>
                      {Object.entries(auction.car || {}).filter(([k,v]) => !['photos','description','_id','title'].includes(k) && v !== undefined && v !== null && v !== '').slice(0,10).map(([k,v]) => (
                        <div key={k}><b>{k}</b><div>{typeof v === 'number' ? v.toLocaleString() : Array.isArray(v) ? v.join(', ') : String(v)}</div></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top bidder */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>Top Bidder</div>
                  <div className={styles.sectionBody}>
                    {topBidder ? (
                      <div className={styles.topBidder}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className={styles.topAvatar} src={topBidder.avatarUrl?.startsWith('http')? topBidder.avatarUrl : (topBidder.avatarUrl ? `${backendOrigin}${topBidder.avatarUrl}` : '/images/carlogo.png')} alt={topBidder.name||'User'} />
                        <div className={styles.metaRow} style={{flex:1}}>
                          <div><b>Full Name</b><div>{topBidder.name || '—'}</div></div>
                          <div><b>Email</b><div>{topBidder.email || '—'}</div></div>
                          <div><b>Mobile Number</b><div>—</div></div>
                          <div><b>Nationality</b><div>—</div></div>
                          <div><b>ID Type</b><div>—</div></div>
                        </div>
                      </div>
                    ) : (
                      <div>No bids yet.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Bid panel */}
              <div>
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
                    <div className={styles.stepper}>
                      <input
                        className={styles.input}
                        value={amount}
                        onChange={(e)=>setAmount(e.target.value)}
                        type="number"
                        min={(topBidAmount||0)+step}
                        step={step}
                      />
                      <button className={styles.stepBtn} onClick={()=>setAmount(a=>String(Math.max(((topBidAmount||0)+step), (Number(a)||0) - step)))}>-</button>
                      <button className={styles.stepBtn} onClick={()=>setAmount(a=>String((Number(a)||0)+step))}>+</button>
                    </div>
                    <button className={styles.btn} disabled={submitting || auction.status !== 'live'} onClick={submitBid}>{submitting? 'Submitting...' : 'Submit A Bid'}</button>
                  </div>
                </div>

                <div className={styles.section} style={{marginTop:16}}>
                  <div className={styles.sectionHeader}>Bidders List</div>
                  <div className={styles.sectionBody}>
                    <div className={styles.list}>
                      {bids.length === 0 ? (
                        <div>No bids yet.</div>
                      ) : bids.map((b, i) => (
                        <div key={b._id || i} className={styles.listItem}>
                          <div>{b.bidder?.name ? b.bidder.name : `Bidder ${i+1}`}</div>
                          <div style={{fontWeight:700}}>${fmt(b.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {toast && (
          <div className={`${styles.section}`} onAnimationEnd={()=>setToast(null)}>
            <div className={styles.sectionBody} style={{color: toast.type==='success'? '#065f46':'#991b1b'}}>{toast.message}</div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
