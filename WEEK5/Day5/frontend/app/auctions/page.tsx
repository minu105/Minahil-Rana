"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import styles from "./auctions.module.css";

interface Car {
  _id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  bodyType: string;
  photos: string[];
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  description?: string;
}

interface Auction {
  _id: string;
  car: Car;
  startingBid: number;
  currentBid: number;
  endTime: string;
  status: string;
  bids: any[];
  seller?: any;
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishAdded, setWishAdded] = useState<Record<string, boolean>>({});
  const [me, setMe] = useState<any>(null);
  const [searchFilters, setSearchFilters] = useState({
    make: "",
    model: "",
    year: "",
    bodyType: "",
    priceRange: "",
    sortBy: "endTime",
    status: ""
  });
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [usingMock, setUsingMock] = useState(false);
  const [wishCars, setWishCars] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAuctions();
  }, [currentPage, searchFilters]);

  // Preload wishlist on mount to mark existing items
  useEffect(() => {
    // Load current user for ownership checks
    (async () => {
      try { const { data } = await api.get('/users/me'); setMe(data); } catch {}
    })();
    (async () => {
      try {
        const { data } = await api.get('/wishlist');
        const map: Record<string, boolean> = {};
        (Array.isArray(data) ? data : []).forEach((w: any) => {
          const id = w?.car?._id || w?.car?.id;
          if (typeof id === 'string') map[id] = true;
        });
        setWishCars(map);
      } catch {}
    })();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      // Convert UI filters to backend params
      const paramsObj: Record<string, string> = {
        page: currentPage.toString(),
        limit: "12",
        // Optional: status can be 'scheduled' | 'live' | 'ended' | 'completed' | 'cancelled'
      };

      if (searchFilters.make) paramsObj.make = searchFilters.make;
      if (searchFilters.model) paramsObj.model = searchFilters.model;
      if (searchFilters.year) paramsObj.year = searchFilters.year;
      if (searchFilters.bodyType) paramsObj.bodyType = searchFilters.bodyType;
      if (searchFilters.status) paramsObj.status = searchFilters.status;
      if (searchText) paramsObj.q = searchText;

      if (searchFilters.priceRange) {
        const [minS, maxS] = searchFilters.priceRange.split("-");
        const min = Number(minS) || 0;
        const max = maxS?.includes("+") ? undefined : Number(maxS);
        paramsObj.priceMin = String(min);
        if (max !== undefined) paramsObj.priceMax = String(max);
      }

      const params = new URLSearchParams(paramsObj);
      
      const response = await api.get(`/auctions?${params}`);
      console.log('[AuctionsPage] GET /auctions params=', paramsObj, 'baseURL=', (api.defaults as any).baseURL);
      console.log('[AuctionsPage] response.data', response.data);
      const rawItems = (response.data?.items ?? []) as any[];

      // Map backend fields to UI expectations
      const mapped: Auction[] = rawItems.map((it: any) => ({
        _id: it._id,
        car: it.car,
        startingBid: it.startPrice ?? 0,
        currentBid: (it.topBid?.amount ?? it.startPrice ?? 0),
        endTime: it.endAt ?? it.endTime,
        status: it.status,
        bids: Array.isArray(it.bids) ? it.bids : [],
        seller: it.seller,
      }));

      console.log('[AuctionsPage] mapped items length', mapped.length);
      setAuctions(mapped);
      const t = Number(response.data?.total ?? mapped.length);
      setTotal(t);
      setTotalPages(Math.max(1, Math.ceil((t || 0) / 12)));
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAuctions([]);
      setToast({ type: 'error', message: 'Failed to load auctions from server' });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const makeLive = async (auctionId: string) => {
    try {
      setUpdatingId(auctionId);
      const res = await api.patch(`/auctions/${auctionId}`, { status: 'live' });
      const updated = (res.data?.auction ?? res.data) as any;
      // Optimistically update UI
      if (updated && updated._id) {
        setAuctions(prev => prev.map(a => a._id === updated._id ? { ...a, status: updated.status ?? 'live' } : a));
      }
      setToast({ type: 'success', message: 'Auction set to live' });
      // Also re-fetch to ensure server truth
      fetchAuctions();
    } catch (e) {
      const res = (e as any)?.response;
      const status = res?.status;
      const msg = res?.data?.message || (e as any)?.message || 'Failed to update status';
      if (status === 404) {
        setToast({ type: 'error', message: 'Only the seller can make this auction live.' });
      } else if (status === 400) {
        setToast({ type: 'error', message: typeof msg === 'string' ? msg : 'Only scheduled auctions can be edited' });
      } else if (status === 401) {
        setToast({ type: 'error', message: 'Please login to continue' });
      } else {
        setToast({ type: 'error', message: typeof msg === 'string' ? msg : 'Failed to update status' });
      }
    }
    finally {
      setUpdatingId(null);
    }
  };

  const getImageUrl = (photo: string) => {
    if (photo.startsWith('http')) return photo;
    if (photo.startsWith('/uploads/')) return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${photo}`;
    return photo;
  };

  const addToWishlist = async (auctionId: string, carId?: string) => {
    // If we are showing mock/fallback data, avoid hitting backend with invalid IDs
    if (usingMock || !/^([a-f\d]{24})$/i.test(auctionId)) {
      setToast({ type: 'error', message: 'This is demo data only; cannot add to wishlist.' });
      return;
    }
    try {
      await api.post(`/wishlist/by-auction/${auctionId}`);
      setWishAdded(prev => ({ ...prev, [auctionId]: true }));
      if (carId) setWishCars(prev => ({ ...prev, [carId]: true }));
      setToast({ type: 'success', message: 'Added to wishlist' });
    } catch (e) {
      console.error('Failed to add to wishlist', e);
      const status = (e as any)?.response?.status;
      const msg = (e as any)?.response?.data?.message || (e as any)?.message;
      // If auction missing on server but we have carId, try adding by carId
      if ((status === 404 || (typeof msg === 'string' && /auction not found/i.test(msg))) && carId && /^([a-f\d]{24})$/i.test(carId)) {
        try {
          await api.post('/wishlist', { carId });
          setWishAdded(prev => ({ ...prev, [auctionId]: true }));
          setWishCars(prev => ({ ...prev, [carId]: true }));
          setToast({ type: 'success', message: 'Added to wishlist' });
          return;
        } catch (e2) {
          const msg2 = (e2 as any)?.response?.data?.message || (e2 as any)?.message;
          const st2 = (e2 as any)?.response?.status;
          setToast({ type: 'error', message: typeof msg2 === 'string' ? `${st2 ? st2+': ' : ''}${msg2}` : 'Could not add to wishlist' });
          return;
        }
      }
      setToast({ type: 'error', message: status === 401 ? 'Please login to use wishlist' : (typeof msg === 'string' ? `${status ? status+': ' : ''}${msg}` : 'Could not add to wishlist') });
    }
  };

  return (
    <div className={styles.auctionsPage}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Auction</h1>
          <p className={styles.heroDescription}>
            Lorem ipsum dolor sit amet consectetur. At in pretium semper massa volutpat.
          </p>
          <div className={styles.breadcrumbs}>Home &gt; Auction</div>
        </div>
      </section>


      {/* Content with Right Sidebar */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Left: List */}
          <div className={styles.listArea}>
            <div className={styles.resultsHeader}>
              <span>Showing {auctions.length > 0 ? `${(currentPage-1)*12+1}-${(currentPage-1)*12+auctions.length}` : 0} of {total} Results</span>
              <div className={styles.inlineSearch}>
                <input 
                  type="text" 
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <button className={styles.searchBtn} onClick={() => { setCurrentPage(1); fetchAuctions(); }}>🔍</button>
              </div>
            </div>

            {loading ? (
              <div className={styles.loading}>Loading auctions...</div>
            ) : auctions.length === 0 ? (
              <div className={styles.noResults}>No auctions found</div>
            ) : (
              auctions.map((a) => (
                <div key={a._id} className={styles.listItem}>
                  <div className={styles.thumb}>
                    <Image
                      src={getImageUrl(a.car.photos?.[0] || '/images/placeholder-car.jpg')}
                      alt={a.car.title}
                      width={220}
                      height={150}
                    />
                    <button
                      className={`${styles.wishBtn} ${(wishAdded[a._id] || wishCars[(a as any).car?._id]) ? styles.wishActive : ''}`}
                      title={wishAdded[a._id] ? 'Added to Wishlist' : 'Add to Wishlist'}
                      onClick={() => addToWishlist(a._id, (a as any).car?._id)}
                      aria-label="Add to wishlist"
                    >
                      <Image src="/images/star.png" alt="star" width={16} height={16} />
                    </button>
                    <div className={styles.timeRemaining}>{getTimeRemaining(a.endTime)}</div>
                  </div>
                  <div className={styles.itemBody}>
                    <div className={styles.itemHeader}>
                      <h3>{a.car.title}</h3>
                      <span className={styles.badgeLive}>{a.status}</span>
                      {a.status === 'scheduled' && me?._id && ( ((a as any).seller?._id || (a as any).seller) === me._id ) && (
                        <button
                          className={styles.filterBtn}
                          style={{ marginLeft: 8 }}
                          onClick={() => makeLive(a._id)}
                          disabled={updatingId === a._id}
                        >
                          {updatingId === a._id ? 'Updating...' : 'Make Live'}
                        </button>
                      )}
                    </div>
                    <div className={styles.ratingRow}>
                      <span className={styles.stars}>★★★★★</span>
                    </div>
                    <div className={styles.itemMeta}>
                      <span>{a.car.make} {a.car.model}</span>
                      <span>•</span>
                      <span>{a.car.year}</span>
                      <span>•</span>
                      <span>{a.car.mileage?.toLocaleString()} miles</span>
                    </div>
                    <div className={styles.itemFooter}>
                      <div>
                        <div className={styles.bidLabel}>Current Bid</div>
                        <div className={styles.bidAmount}>${a.currentBid.toLocaleString()}</div>
                      </div>
                      <div className={styles.bidCount}>{a.bids.length} bids</div>
                      <button
                        className={styles.submitBtn}
                        onClick={() => { window.location.href = `/bid/${a._id}`; }}
                      >
                        {a.status === 'ended' ? 'View Results' : (a.status === 'live' ? 'Submit a Bid' : 'View Details')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {totalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Sidebar Filters */}
          <aside className={styles.sidebar}>
            <h4 className={styles.sidebarTitle}>Filter By</h4>
            <div className={styles.sidebarGroup}>
              <label>Make</label>
              <select className={styles.filterSelect} value={searchFilters.make} onChange={(e) => setSearchFilters({ ...searchFilters, make: e.target.value })}>
                <option value="">Any</option>
                <option value="Kia">Kia</option>
                <option value="Dodge">Dodge</option>
                <option value="BMW">BMW</option>
                <option value="Audi">Audi</option>
              </select>
            </div>
            <div className={styles.sidebarGroup}>
              <label>Model</label>
              <select className={styles.filterSelect} value={searchFilters.model} onChange={(e) => setSearchFilters({ ...searchFilters, model: e.target.value })}>
                <option value="">Any</option>
                <option value="Carnival">Carnival</option>
                <option value="Rover">Rover</option>
              </select>
            </div>
            <div className={styles.sidebarGroup}>
              <label>Year</label>
              <select className={styles.filterSelect} value={searchFilters.year} onChange={(e) => setSearchFilters({ ...searchFilters, year: e.target.value })}>
                <option value="">Any</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
            <div className={styles.sidebarGroup}>
              <label>Price Range</label>
              <select className={styles.filterSelect} value={searchFilters.priceRange} onChange={(e) => setSearchFilters({ ...searchFilters, priceRange: e.target.value })}>
                <option value="">Any</option>
                <option value="0-20000">$0 - $20,000</option>
                <option value="20000-40000">$20,000 - $40,000</option>
                <option value="40000+">$40,000+</option>
              </select>
            </div>
            <div className={styles.sidebarGroup}>
              <label>Status</label>
              <select className={styles.filterSelect} value={searchFilters.status} onChange={(e) => setSearchFilters({ ...searchFilters, status: e.target.value })}>
                <option value="">All</option>
                <option value="live">Live</option>
                <option value="scheduled">Scheduled</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <button className={styles.filterBtn} onClick={() => { setCurrentPage(1); fetchAuctions(); }}>Filter</button>
          </aside>
        </div>
      </section>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}
             onAnimationEnd={() => setToast(null)}>
          {toast.message}
        </div>
      )}

      <Footer />
    </div>
  );
}
