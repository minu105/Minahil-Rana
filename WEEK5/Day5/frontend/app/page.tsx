"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./homepage.module.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface Car {
  _id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  bodyType: string;
  photos: string[];
}

interface Auction {
  _id: string;
  car: Car;
  startPrice: number;
  topBid?: { amount: number };
  endAt: string;
  status: string;
}

export default function HomePage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [activeBodyType, setActiveBodyType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    make: 'All',
    model: 'All',
    year: 'All',
    bodyType: 'All',
    price: 'All'
  });

  const getImageUrl = (photo: string) => {
    if (photo.startsWith('http')) return photo;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    return `${baseUrl}${photo.startsWith('/') ? '' : '/'}${photo}`;
  };

  useEffect(() => {
    fetchLiveAuctions();
  }, []);

  async function fetchLiveAuctions() {
    try {
      const response = await api.get('/auctions?status=live&limit=8');
      const auctions = response.data?.items || [];
      
      // If no auctions from API, show mock data for demo
      if (auctions.length === 0) {
        setAuctions(getMockAuctions());
      } else {
        setAuctions(auctions);
      }
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
      // Show mock data on error for demo purposes
      setAuctions(getMockAuctions());
    } finally {
      setLoading(false);
    }
  }

  function getMockAuctions() {
    return [
      {
        _id: '1',
        car: {
          _id: '1',
          title: 'Mazda MX - 5',
          make: 'Mazda',
          model: 'MX-5',
          year: 2023,
          bodyType: 'Sports',
          photos: ['/images/default-car.svg']
        },
        startPrice: 1079.99,
        topBid: { amount: 1079.99 },
        endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: 'live'
      },
      {
        _id: '2',
        car: {
          _id: '2',
          title: 'Porsche 911',
          make: 'Porsche',
          model: '911',
          year: 2023,
          bodyType: 'Sports',
          photos: ['/images/default-car.svg']
        },
        startPrice: 3079.99,
        topBid: { amount: 3079.99 },
        endAt: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
        status: 'live'
      },
      {
        _id: '3',
        car: {
          _id: '3',
          title: 'Alpine A110',
          make: 'Alpine',
          model: 'A110',
          year: 2023,
          bodyType: 'Sports',
          photos: ['/images/default-car.svg']
        },
        startPrice: 1079.99,
        topBid: { amount: 1079.99 },
        endAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        status: 'live'
      },
      {
        _id: '4',
        car: {
          _id: '4',
          title: 'BMW M4',
          make: 'BMW',
          model: 'M4',
          year: 2023,
          bodyType: 'Sports',
          photos: ['/images/default-car.svg']
        },
        startPrice: 1879.99,
        topBid: { amount: 1879.99 },
        endAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'live'
      }
    ];
  }

  const bodyTypes = ['All', 'Sedan', 'Sports', 'Hatchback', 'Convertible', 'SUV', 'Coupe'];

  const handleSearch = () => {
    console.log('Search filters:', searchFilters);
    // Implement search functionality
  };

  const formatTimeRemaining = (endAt: string) => {
    const end = new Date(endAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={styles.homepage}>
      <Navbar transparent={true} showAuthButtons={true} />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.welcomeBadge}>WELCOME TO AUCTION</div>
          <h1 className={styles.heroTitle}>
            Find Your<br />
            Dream Car
          </h1>
          <p className={styles.heroDescription}>
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Duis
            ullamcorper mauris tristique lorem vulputate suspendisse
            quis elit.
          </p>
          
          {/* Search Filters */}
          <div className={styles.searchBox}>
            <select 
              className={styles.searchSelect}
              value={searchFilters.make}
              onChange={(e) => setSearchFilters({...searchFilters, make: e.target.value})}
            >
              <option value="">Make</option>
              <option value="Audi">Audi</option>
              <option value="BMW">BMW</option>
              <option value="Mercedes">Mercedes</option>
              <option value="Toyota">Toyota</option>
            </select>
            
            <select 
              className={styles.searchSelect}
              value={searchFilters.model}
              onChange={(e) => setSearchFilters({...searchFilters, model: e.target.value})}
            >
              <option value="">Model</option>
              <option value="A4">A4</option>
              <option value="M3">M3</option>
              <option value="C-Class">C-Class</option>
            </select>
            
            <select 
              className={styles.searchSelect}
              value={searchFilters.year}
              onChange={(e) => setSearchFilters({...searchFilters, year: e.target.value})}
            >
              <option value="">Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
            
            <select 
              className={styles.searchSelect}
              value={searchFilters.price}
              onChange={(e) => setSearchFilters({...searchFilters, price: e.target.value})}
            >
              <option value="">Price</option>
              <option value="0-25000">$0 - $25,000</option>
              <option value="25000-50000">$25,000 - $50,000</option>
              <option value="50000-100000">$50,000 - $100,000</option>
              <option value="100000+">$100,000+</option>
            </select>
            
            <button className={styles.searchButton} onClick={handleSearch}>
              <span>🔍</span> Search
            </button>
          </div>
        </div>
      </section>

      {/* Live Auction Section */}
      <section className={styles.liveAuction}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Live Auction</h2>
          <div className={styles.sectionDivider}></div>
          
          <div className={styles.auctionTabs}>
            <button className={`${styles.auctionTab} ${styles.active}`}>Live Auction</button>
          </div>
          
          <div className={styles.auctionSlider}>
            {loading ? (
              <div className={styles.loading}>Loading auctions...</div>
            ) : auctions.length > 0 ? (
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                direction="horizontal"
                loop={false}
                centeredSlides={false}
                slidesOffsetBefore={0}
                slidesOffsetAfter={0}
                watchOverflow={true}
                observer={true}
                observeParents={true}
                pagination={{ clickable: true, dynamicBullets: true }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 16 },
                  768: { slidesPerView: 3, spaceBetween: 16 },
                  1024: { slidesPerView: 3, spaceBetween: 16 },
                  1280: { slidesPerView: 4, spaceBetween: 16 },
                }}
                style={{ overflow: 'hidden' }}
                className={styles.swiperContainer}
              >
                {auctions.map((auction) => (
                  <SwiperSlide key={auction._id}>
                    <div className={styles.auctionCard}>
                      <div className={styles.cardImage}>
                        <Image 
                          src={auction.car.photos && auction.car.photos.length > 0 
                            ? getImageUrl(auction.car.photos[0]) 
                            : '/images/default-car.svg'} 
                          alt={auction.car.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          className={styles.carImage}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/default-car.svg';
                          }}
                        />
                      </div>
                      
                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardTitle}>{auction.car.title}</h3>
                          <div className={styles.cardMeta}>
                            {auction.car.year} • {auction.car.make} {auction.car.model}
                          </div>
                        </div>
                        
                        <div className={styles.priceSection}>
                          <div className={styles.currentBid}>
                            <span className={styles.bidLabel}>Current Bid</span>
                            <span className={styles.bidAmount}>
                              ${auction.topBid?.amount?.toLocaleString() || auction.startPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className={styles.timeRemaining}>
                            <span className={styles.timeLabel}>Time Left</span>
                            <span className={styles.timeValue}>{formatTimeRemaining(auction.endAt)}</span>
                          </div>
                        </div>
                        
                        <div className={styles.bidInfo}>
                          <span>Current Bid</span>
                          <span>Waiting for Bid</span>
                        </div>
                        
                        <button className={styles.submitBid}>Submit A Bid</button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className={styles.noAuctions}>No live auctions available</div>
            )}
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
