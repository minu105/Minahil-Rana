"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "../bid.module.css";
import { api } from "@/lib/api";

type Auction = { _id: string; endAt?: string; startPrice?: number; lotNumber?: number; status?: string; topBid?: { amount?: number } };

export default function PaymentPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // fetch current user (best-effort)
        const mePaths = ["/auth/me", "/api/auth/me", "/users/me"];
        for (const p of mePaths) {
          try { const r = await api.get(p); if (r?.data) { setMe(r.data.user || r.data); break; } } catch {}
        }
        // fetch auction to display KPIs
        try { const a = await api.get(`/auctions/${id}`); setAuction(a.data?.auction || a.data); } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const paidKey = useMemo(() => (me?._id || me?.id) ? `auctionPayment:${id}:${me._id || me.id}` : "", [id, me]);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentDate, setPaymentDate] = useState<string | null>(null);

  useEffect(() => {
    if (!paidKey) return;
    const v = typeof window !== 'undefined' ? window.localStorage.getItem(paidKey) : null;
    const d = typeof window !== 'undefined' ? window.localStorage.getItem(`${paidKey}:date`) : null;
    setIsPaid(v === 'paid');
    setPaymentDate(d);
  }, [paidKey]);

  const confirmPayment = () => {
    if (!paidKey) return;
    try {
      const now = new Date().toISOString();
      window.localStorage.setItem(paidKey, 'paid');
      window.localStorage.setItem(`${paidKey}:date`, now);
      setIsPaid(true);
      setPaymentDate(now);
      router.replace(`/bid/${id}/results`);
    } catch {}
  };

  const topBidAmount = useMemo(() => {
    if (!auction) return 0;
    const a = auction.topBid?.amount || 0;
    return Math.max(a, auction.startPrice || 0);
  }, [auction]);

  const expectedDelivery = useMemo(() => {
    const base = paymentDate ? new Date(paymentDate) : null;
    if (!base) return null;
    const d = new Date(base.getTime());
    d.setDate(d.getDate() + 2);
    return d.toISOString();
  }, [paymentDate]);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <h2 style={{textAlign:'center', marginTop:'2rem'}}>Steps of Payment</h2>

        <div className={styles.mainGrid} style={{gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
          {/* Left: KPIs like design */}
          <div>
            <div className={`${styles.kpisBar} ${styles.kpisEnded}`} style={{marginBottom:'16px'}}>
              <div className={styles.kpiItem}>
                <div className={styles.kpiValue}>{auction?.endAt ? new Date(auction.endAt).toLocaleDateString('en-GB') : '—'}</div>
                <div className={styles.kpiLabel}>Winning Date</div>
              </div>
              <div className={styles.kpiItem}>
                <div className={styles.kpiValue}>{auction?.endAt ? new Date(auction.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                <div className={styles.kpiLabel}>End Time</div>
              </div>
              <div className={styles.kpiItem}>
                <div className={`${styles.kpiValue} ${styles.kpiWinAmount}`}>${topBidAmount.toLocaleString()}</div>
                <div className={styles.kpiLabel}>Winning Bid</div>
              </div>
              <div className={styles.kpiItem}>
                <div className={styles.kpiValue}>{auction?.lotNumber || '-'}</div>
                <div className={styles.kpiLabel}>Lot No.</div>
              </div>
            </div>
            {/* Repeat blocks to mimic design preview (optional) */}
            <div className={`${styles.kpisBar}`} style={{opacity:0.7}}>
              <div className={styles.kpiItem}><div className={styles.kpiValue}>{auction?.endAt ? new Date(auction.endAt).toLocaleDateString('en-GB') : '—'}</div><div className={styles.kpiLabel}>Winning Date</div></div>
              <div className={styles.kpiItem}><div className={styles.kpiValue}>{auction?.endAt ? new Date(auction.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div><div className={styles.kpiLabel}>End Time</div></div>
              <div className={styles.kpiItem}><div className={styles.kpiValue}>${topBidAmount.toLocaleString()}</div><div className={styles.kpiLabel}>Winning Bid</div></div>
              <div className={styles.kpiItem}><div className={styles.kpiValue}>{auction?.lotNumber || '-'}</div><div className={styles.kpiLabel}>Lot No.</div></div>
            </div>
          </div>

          {/* Right: Stepper card */}
          <div>
            <div className={styles.sideCard}>
              <div style={{display:'flex', gap:'16px', marginBottom:'12px'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700}}>{paymentDate ? new Date(paymentDate).toLocaleDateString('en-GB') : '—'}</div>
                  <div style={{color:'#666'}}>Payment Date</div>
                </div>
                <div style={{flex:1, textAlign:'right'}}>
                  <div style={{fontWeight:700}}>{expectedDelivery ? new Date(expectedDelivery).toLocaleDateString('en-GB') : '—'}</div>
                  <div style={{color:'#666'}}>{isPaid ? 'Expected Delivery Date' : 'Expected Delivery Date'}</div>
                </div>
              </div>

              {/* Progress line with 3 steps */}
              <div style={{position:'relative', padding:'24px 8px 8px'}}>
                <div style={{height:4, background:'#e6e6e6', position:'absolute', left:24, right:24, top:36, borderRadius:2}} />
                <div style={{height:4, background:'#22c55e', position:'absolute', left:24, width: isPaid ? '66%' : '33%', top:36, borderRadius:2, transition:'width .3s'}} />
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  {[0,1,2].map((idx) => {
                    const active = isPaid ? idx <= 1 : idx <= 0;
                    return (
                      <div key={idx} style={{display:'flex', flexDirection:'column', alignItems:'center', width:'33%'}}>
                        <div style={{width:24, height:24, borderRadius:'50%', border:`2px solid ${active ? '#22c55e' : '#d1d5db'}`, background: active ? '#22c55e' : '#fff'}} />
                        <div style={{marginTop:8, color: active ? '#16a34a' : '#666'}}>
                          {idx === 0 ? 'Ready For Shipping' : idx === 1 ? 'In Transit' : 'Delivered'}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              <div style={{display:'flex', justifyContent:'flex-end', marginTop:'16px'}}>
                <button className={styles.btn} onClick={confirmPayment} disabled={!paidKey || isPaid}>
                  {isPaid ? 'Payment Done' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
