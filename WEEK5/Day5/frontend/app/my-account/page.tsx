"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { api } from "@/lib/api";

export default function MyAccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info'|'cars'|'bids'|'wishlist'>('info');
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    nationality: "",
    idType: "", // backend doesn't store idType; kept for UI, will be ignored
    idNumber: "",
  });
  const [avatar, setAvatar] = useState<string>("/images/carlogo.png");
  const [editMode, setEditMode] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [myCars, setMyCars] = useState<any[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const NATIONALITIES = [
    "Pakistan",
    "India",
    "Bangladesh",
    "Sri Lanka",
    "Nepal",
    "China",
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "United Kingdom",
    "United States",
    "Canada",
  ];

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Derive backend origin to prefix relative avatarUrl like /uploads/...
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";
  const ORIGIN = API_BASE.replace(/\/api$/, "");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data } = await api.get("/users/me");
        if (!mounted) return;
        setForm({
          fullName: data.name || "",
          email: data.email || "",
          mobile: data.phone || "",
          nationality: data.nationality || "",
          idType: "",
          idNumber: data.idNumber || "",
        });
        setUserId(data._id || data.id || null);
        const url: string | undefined = data.avatarUrl;
        setAvatar(url ? (url.startsWith("http") ? url : `${ORIGIN}${url}`) : "/images/carlogo.png");
      } catch (e) {
        // keep defaults if unauthorized; page can still render UI
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function loadMyCars() {
    if (!userId) return;
    setCarsLoading(true);
    try {
      const { data } = await api.get('/cars', { params: { owner: userId, limit: 50 } });
      setMyCars(data?.items || []);
    } catch (e) {
      setMyCars([]);
    } finally {
      setCarsLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'cars') {
      loadMyCars();
    }
  }, [activeTab, userId]);

  async function loadMyBids() {
    setBidsLoading(true);
    try {
      const { data } = await api.get('/bids/mine', { params: { limit: 50 } });
      setMyBids(data?.items || []);
    } catch {
      setMyBids([]);
    } finally {
      setBidsLoading(false);
    }
  }

  async function loadWishlist() {
    setWishlistLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(Array.isArray(data) ? data : []);
    } catch {
      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'bids') loadMyBids();
    if (activeTab === 'wishlist') loadWishlist();
  }, [activeTab]);

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mauris.</p>
          <div className={styles.breadcrumbs}>Home &gt; My Profile</div>
        </div>
      </section>

      {/* Content */}
      <section className={styles.section}>
        <div className={styles.container}>
          {/* Left Sidebar */}
          <aside className={styles.sidebar}>
            <ul className={styles.sideList}>
              <li className={styles.sideItem}><a href="#" className={`${styles.sideLink} ${activeTab==='info'?styles.sideLinkActive:''}`} onClick={(e)=>{e.preventDefault();setActiveTab('info')}}>Personal Information</a></li>
              <li className={styles.sideItem}><a href="#" className={`${styles.sideLink} ${activeTab==='cars'?styles.sideLinkActive:''}`} onClick={(e)=>{e.preventDefault();setActiveTab('cars')}}>My Cars</a></li>
              <li className={styles.sideItem}><a href="#" className={`${styles.sideLink} ${activeTab==='bids'?styles.sideLinkActive:''}`} onClick={(e)=>{e.preventDefault();setActiveTab('bids')}}>My Bids</a></li>
              <li className={styles.sideItem}><a href="#" className={`${styles.sideLink} ${activeTab==='wishlist'?styles.sideLinkActive:''}`} onClick={(e)=>{e.preventDefault();setActiveTab('wishlist')}}>Wishlist</a></li>
            </ul>
          </aside>

          {/* Right Content */}
          <div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>{activeTab==='info' ? 'Personal Information' : activeTab==='cars' ? 'My Cars' : activeTab==='bids' ? 'My Bids' : 'Wishlist'}</div>
                {activeTab==='info' ? (<button className={styles.editBtn} type="button" title={editMode ? "View" : "Edit"} onClick={()=>setEditMode(!editMode)}>✎</button>) : null}
              </div>
              <div className={styles.cardBody}>
                {activeTab==='info' && (
                <div className={styles.infoGrid}>
                  <div className={styles.avatarWrap}>
                    <Image src={avatar} alt="Avatar" width={120} height={120} />
                    {/* Show upload control only in edit mode */}
                    {editMode && (
                      <>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
                        ref={fileRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("file", file);
                          try {
                            const { data } = await api.post("/users/me/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
                            const finalUrl = data?.avatarUrl ? (data.avatarUrl.startsWith("http") ? data.avatarUrl : `${ORIGIN}${data.avatarUrl}`) : undefined;
                            if (finalUrl) setAvatar(finalUrl);
                          } catch (err) {
                            // silently fail for now per requirement
                          }
                        }}
                      />
                      {/* Full-cover clickable overlay with pencil/text */}
                      <button
                        className={styles.avatarWrapBtn}
                        type="button"
                        aria-label="Upload photo"
                        onClick={() => {
                          const el = fileRef.current;
                          if (!el) return;
                          // @ts-ignore
                          if (typeof el.showPicker === 'function') { el.showPicker(); } else { el.click(); }
                        }}
                      >
                        <div className={styles.avatarOverlay}>
                          ✎ Upload
                        </div>
                      </button>
                      </>
                    )}
                  </div>

                  <div className={styles.infoCols}>
                    <div className={styles.field}>
                      <div className={styles.fieldRow}>
                        <label className={styles.label}>Full Name</label>
                        {editMode ? (
                          <input className={styles.input} placeholder="Enter your full name" value={form.fullName} onChange={(e)=>update('fullName', e.target.value)} />
                        ) : (
                          <span className={styles.value}>{form.fullName || '— Not set —'}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldRow}>
                        <label className={styles.label}>Email</label>
                        {editMode ? (
                          <input className={styles.input} placeholder="Enter your email" value={form.email} onChange={(e)=>update('email', e.target.value)} />
                        ) : (
                          <span className={styles.value}>{form.email || '— Not set —'}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldRow}>
                        <label className={styles.label}>Mobile Number</label>
                        {editMode ? (
                          <input className={styles.input} placeholder="03xx-xxxxxxx" value={form.mobile} onChange={(e)=>update('mobile', e.target.value)} />
                        ) : (
                          <span className={styles.value}>{form.mobile || '— Not set —'}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldRow}>
                        <label className={styles.label}>Nationality</label>
                        {editMode ? (
                          <select
                            className={styles.input}
                            value={form.nationality}
                            onChange={(e)=>update('nationality', e.target.value)}
                          >
                            <option value="">Select nationality</option>
                            {NATIONALITIES.map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={styles.value}>{form.nationality || '— Not set —'}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldRow}>
                        <label className={styles.label}>ID Type</label>
                        {editMode ? (
                          <input className={styles.input} placeholder="e.g. CNIC, Passport" value={form.idType} onChange={(e)=>update('idType', e.target.value)} />
                        ) : (
                          <span className={styles.value}>{form.idType || '— Not set —'}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldRow}>
                        <label className={styles.label}>ID Number</label>
                        {editMode ? (
                          <input className={styles.input} placeholder="Enter your ID number" value={form.idNumber} onChange={(e)=>update('idNumber', e.target.value)} />
                        ) : (
                          <span className={styles.value}>{form.idNumber || '— Not set —'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {activeTab==='cars' && (
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16}}>
                    {carsLoading && (<div>Loading your cars...</div>)}
                    {!carsLoading && myCars.length===0 && (<div>No cars found.</div>)}
                    {myCars.map((c)=> (
                      <div key={c._id} style={{background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, overflow:'hidden'}}>
                        {Array.isArray(c.photos) && c.photos[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.photos[0].startsWith('http')?c.photos[0]:`${ORIGIN}${c.photos[0]}`} alt={c.title} style={{width:'100%', height:150, objectFit:'cover'}} />
                        ) : (
                          <div style={{height:150, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center'}}>No Photo</div>
                        )}
                        <div style={{padding:12}}>
                          <div style={{fontWeight:700, color:'#22306E', marginBottom:6}}>{c.title}</div>
                          <div style={{fontSize:14, color:'#6B7280'}}>{c.make} • {c.model} • {c.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab==='bids' && (
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16}}>
                    {bidsLoading && (<div>Loading your bids...</div>)}
                    {!bidsLoading && myBids.length===0 && (<div>No bids yet.</div>)}
                    {myBids.map((row:any)=>{
                      const car = row.car || {};
                      const auc = row.auction || {};
                      const img = Array.isArray(car.photos) && car.photos[0] ? (car.photos[0].startsWith('http')?car.photos[0]:`${ORIGIN}${car.photos[0]}`) : null;
                      const winning = auc?.topBid?.amount ?? auc?.startPrice;
                      const myAmount = row.bid?.amount;
                      const endAt = auc?.endAt ? new Date(auc.endAt) : null;
                      const now = new Date();
                      const timeLeft = endAt ? Math.max(0, endAt.getTime()-now.getTime()) : 0;
                      const hrs = Math.floor(timeLeft/36e5), mins = Math.floor((timeLeft%36e5)/6e4), secs = Math.floor((timeLeft%6e4)/1e3);
                      return (
                        <div key={row.bid?._id || `${car._id}-bid`} style={{background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, overflow:'hidden'}}>
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={car.title || 'Car'} style={{width:'100%', height:150, objectFit:'cover'}} />
                          ) : (
                            <div style={{height:150, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center'}}>No Photo</div>
                          )}
                          <div style={{padding:12}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                              <div style={{fontWeight:700, color:'#22306E'}}>{car.title || `${car.make||''} ${car.model||''}`}</div>
                            </div>
                            <div style={{display:'flex', gap:12, marginTop:10}}>
                              <div style={{background:'#EFF6FF', color:'#1E3A8A', padding:'8px 10px', borderRadius:8, fontWeight:600}}>${winning?.toLocaleString?.() || winning}</div>
                              <div style={{background:'#FEE2E2', color:'#B91C1C', padding:'8px 10px', borderRadius:8, fontWeight:600}}>${myAmount?.toLocaleString?.() || myAmount}</div>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, color:'#6B7280', fontSize:12}}>
                              <div>Time Left: {hrs}h {mins}m {secs}s</div>
                              <div>Total Bids: {row.totalBids ?? 0}</div>
                            </div>
                            <button className={styles.btn} style={{marginTop:12}} type="button">Submit A Bid</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab==='wishlist' && (
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16}}>
                    {wishlistLoading && (<div>Loading your wishlist...</div>)}
                    {!wishlistLoading && wishlist.length===0 && (<div>No wishlist items.</div>)}
                    {wishlist.map((w:any)=>{
                      const car = w.car || {};
                      const auc = w.auction || {};
                      const img = Array.isArray(car.photos) && car.photos[0] ? (car.photos[0].startsWith('http')?car.photos[0]:`${ORIGIN}${car.photos[0]}`) : null;
                      const price = auc?.topBid?.amount ?? auc?.startPrice;
                      return (
                        <div key={w._id || car._id} style={{background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, overflow:'hidden'}}>
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={car.title || 'Car'} style={{width:'100%', height:150, objectFit:'cover'}} />
                          ) : (
                            <div style={{height:150, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center'}}>No Photo</div>
                          )}
                          <div style={{padding:12}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                              <div style={{fontWeight:700, color:'#22306E'}}>{car.title || `${car.make||''} ${car.model||''}`}</div>
                              <button title="Remove" style={{border:'none', background:'transparent', cursor:'pointer'}}>★</button>
                            </div>
                            <div style={{color:'#6B7280', fontSize:13, marginTop:6}}>{car.make} • {car.model} • {car.year}</div>
                            <div style={{fontWeight:700, color:'#22306E', marginTop:8}}>${price?.toLocaleString?.() || price}</div>
                            <button className={styles.btn} style={{marginTop:12}} type="button">Submit A Bid</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab==='info' && (
                <div className={styles.actions}>
                  {editMode ? (
                    <>
                      <button className={styles.btnSecondary + ' ' + styles.btn} type="button" onClick={()=>setEditMode(false)} disabled={saving}>Cancel</button>
                      <button
                        className={styles.btn}
                        type="button"
                        disabled={saving}
                        onClick={async ()=>{
                          try {
                            setSaving(true);
                            const payload: any = {
                              name: form.fullName || undefined,
                              email: form.email || undefined,
                              phone: form.mobile || undefined,
                              nationality: form.nationality || undefined,
                              idNumber: form.idNumber || undefined,
                            };
                            await api.patch('/users/me', payload);
                            setEditMode(false);
                          } catch (e) {
                            // ignore errors per requirement
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >{saving ? 'Saving...' : 'Save Changes'}</button>
                    </>
                  ) : null}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
