"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import styles from "./sell.module.css";

interface CarItem { _id: string; title: string; make: string; model: string; year: number; photos?: string[]; }

export default function SellPage() {
  const [mode, setMode] = useState<"existing"|"new">("existing");
  const [me, setMe] = useState<any>(null);
  const [myCars, setMyCars] = useState<CarItem[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [makeLive, setMakeLive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  // Existing car
  const [selectedCarId, setSelectedCarId] = useState<string>("");

  // New car form
  const YEARS = Array.from({length: 40}, (_,i)=> new Date().getFullYear() - i);
  const MAKES = ["Toyota","Honda","Kia","Hyundai","Suzuki","BMW","Audi","Mercedes"];
  const MODELS_BY_MAKE: Record<string,string[]> = {
    Toyota:["Corolla","Yaris","Camry","Hilux"],
    Honda:["Civic","City","BR-V"],
    Kia:["Sportage","Picanto","Carnival"],
    Hyundai:["Elantra","Sonata","Tucson"],
    Suzuki:["Alto","Wagon R","Cultus"],
    BMW:["3 Series","5 Series","X5"],
    Audi:["A3","A4","Q7"],
    Mercedes:["C Class","E Class","GLA"]
  };
  const BODY_TYPES = ["Sedan","SUV","Coupe","Hatchback","Truck","Van"];
  const ENGINE_SIZES = ["4 Cylinder","6 Cylinder","8 Cylinder","10 Cylinder","12 Cylinder"];
  const PAINT = ["Original paint","Partially Repainted","Totally Repainted"];

  const [carForm, setCarForm] = useState({
    title: "",
    make: "",
    model: "",
    year: "",
    bodyType: "",
    vin: "",
    mileage: "",
    engineSize: "",
    paintStatus: "",
    hasGccSpecs: "",
    accidentHistory: "",
    fullServiceHistory: "",
    features: "",
    modified: "stock" as "stock"|"modified",
    maxBid: "",
    photos: [] as string[], // accept image URLs for now
  });

  // Auction common fields
  const [startPrice, setStartPrice] = useState<string>("");
  const [minIncrement, setMinIncrement] = useState<string>("500");
  const [startAt, setStartAt] = useState<string>("");
  const [endAt, setEndAt] = useState<string>("");
  const [sellerType, setSellerType] = useState<'Dealer'|'Private party'>('Dealer');

  const ORIGIN = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api").replace(/\/api$/, "");

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/users/me'); setMe(data); } catch {}
    })();
  }, []);

  // Helper to format a Date to yyyy-MM-ddTHH:mm in local time
  function toInputDateTime(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth()+1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    }

  // Prefill sensible defaults to avoid HTML validation blocking when time is missing
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // +1h
    const end = new Date(start.getTime() + 48 * 60 * 60 * 1000); // +48h
    setStartAt((prev) => prev || toInputDateTime(start));
    setEndAt((prev) => prev || toInputDateTime(end));
  }, []);

  useEffect(() => {
    if (mode === 'existing' && me?._id) {
      setCarsLoading(true);
      api.get('/cars', { params: { owner: me._id, limit: 100 }})
        .then(({data}) => setMyCars(data?.items || []))
        .catch(()=> setMyCars([]))
        .finally(()=> setCarsLoading(false));
    }
  }, [mode, me]);

  const models = MODELS_BY_MAKE[carForm.make] || [];

  function addPhotoField() {
    const url = prompt('Paste photo URL');
    if (!url) return;
    setCarForm(f => ({...f, photos: [...f.photos, url]}));
  }

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('photos', f));
    setUploading(true);
    setMessage("");
    try {
      const { data } = await api.post('/uploads/photos', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const paths: string[] = data?.paths || [];
      if (paths.length > 0) {
        setCarForm(f => ({ ...f, photos: [...f.photos, ...paths] }));
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
      // allow re-selecting same files
      e.currentTarget.value = '';
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      if (!startPrice || !minIncrement) {
        setMessage('Please fill auction price and schedule.');
        return;
      }
      // Ensure start/end are valid datetimes; fallback to defaults if missing
      let startVal = startAt;
      let endVal = endAt;
      if (!startVal) {
        const s = new Date(Date.now() + 60 * 60 * 1000);
        startVal = toInputDateTime(s);
        setStartAt(startVal);
      }
      if (!endVal) {
        const e2 = new Date(Date.now() + 49 * 60 * 60 * 1000);
        endVal = toInputDateTime(e2);
        setEndAt(endVal);
      }
      if (mode === 'existing') {
        if (!selectedCarId) { setMessage('Please select one of your cars.'); return; }
        const payload = {
          carId: selectedCarId,
          startPrice: Number(startPrice),
          minIncrement: Number(minIncrement),
          startAt: startVal, endAt: endVal,
        };
        const { data } = await api.post('/auctions', payload);
        const createdId = data?._id || data?.id;
        if (makeLive && createdId) {
          await api.patch(`/auctions/${createdId}`, { status: 'live' });
        }
        setMessage(`Auction created successfully.${createdId ? ` View: /bid/${createdId}` : ''}`);
        // Reset form after successful submission
        setSelectedCarId("");
        setStartPrice("");
        setMinIncrement("500");
        setMakeLive(false);
        // Reset time fields to defaults
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000); // +1h
        const end = new Date(start.getTime() + 48 * 60 * 60 * 1000); // +48h
        setStartAt(toInputDateTime(start));
        setEndAt(toInputDateTime(end));
        if (createdId) {
          // Optional: redirect directly for convenience
          // window.location.href = `/bid/${createdId}`;
        }
      } else {
        // new car + auction
        if (!carForm.title || !carForm.make || !carForm.model || !carForm.year || !carForm.bodyType) {
          setMessage('Please fill all required car fields.');
          return;
        }
        const payload = {
          title: carForm.title,
          make: carForm.make,
          model: carForm.model,
          year: Number(carForm.year),
          bodyType: carForm.bodyType,
          mileage: carForm.mileage ? Number(carForm.mileage) : undefined,
          engineSize: carForm.engineSize || undefined,
          paintStatus: carForm.paintStatus || undefined,
          hasGccSpecs: carForm.hasGccSpecs === 'Yes' ? true : carForm.hasGccSpecs === 'No' ? false : undefined,
          accidentHistory: carForm.accidentHistory || undefined,
          fullServiceHistory: carForm.fullServiceHistory === 'Yes' ? true : carForm.fullServiceHistory === 'No' ? false : undefined,
          photos: carForm.photos,
          startPrice: Number(startPrice),
          minIncrement: Number(minIncrement),
          startAt: startVal, endAt: endVal,
        };
        const { data } = await api.post('/auctions/with-car', payload);
        const createdId = data?.auction?._id || data?.auction?.id;
        if (makeLive && createdId) {
          await api.patch(`/auctions/${createdId}`, { status: 'live' });
        }
        setMessage(`Car and auction created successfully.${createdId ? ` View: /bid/${createdId}` : ''}`);
        // Reset form after successful submission
        setCarForm({
          title: "",
          make: "",
          model: "",
          year: "",
          bodyType: "",
          vin: "",
          mileage: "",
          engineSize: "",
          paintStatus: "",
          hasGccSpecs: "",
          accidentHistory: "",
          fullServiceHistory: "",
          features: "",
          modified: "stock",
          maxBid: "",
          photos: [],
        });
        setStartPrice("");
        setMinIncrement("500");
        setMakeLive(false);
        // Reset time fields to defaults
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000); // +1h
        const end = new Date(start.getTime() + 48 * 60 * 60 * 1000); // +48h
        setStartAt(toInputDateTime(start));
        setEndAt(toInputDateTime(end));
        if (createdId) {
          // window.location.href = `/bid/${createdId}`;
        }
      }
      // optional: redirect or reset
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Failed to create auction');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>Sell Your Car</h1>
          <p className={styles.subtitle}>Lorem ipsum dolor sit amet consectetur. At in pretium semper massa volutpat.</p>
          <div className={styles.breadcrumbs}>Home &gt; Sell Your Car</div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.formHeading}>Tell us about your car</h2>
          <p className={styles.formSubtext}>Please give us some basic details about yourself and your car to get started.</p>

          <div className={styles.toggleRow}>
            <button type="button" className={`${styles.toggleBtn} ${mode==='existing'?styles.toggleActive:''}`} onClick={()=>setMode('existing')}>Use Existing Car</button>
            <button type="button" className={`${styles.toggleBtn} ${mode==='new'?styles.toggleActive:''}`} onClick={()=>setMode('new')}>Create New Car</button>
          </div>

          <form className={styles.formCard} onSubmit={onSubmit}>
            {mode === 'existing' ? (
              <div className={styles.block}>
                <div className={styles.blockTitle}>Select Your Car</div>
                {carsLoading ? (
                  <div>Loading your cars...</div>
                ) : (
                  <select className={styles.input} value={selectedCarId} onChange={(e)=>setSelectedCarId(e.target.value)} required>
                    <option value="">Select a car</option>
                    {myCars.map(c => (
                      <option key={c._id} value={c._id}>{c.title || `${c.make} ${c.model} ${c.year}`}</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <>
                <div className={styles.block}>
                  <div className={styles.blockTitle}>Your Info</div>
                  <div className={styles.pillsRow}>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${sellerType==='Dealer'?styles.pillActive:''}`}
                      onClick={()=>setSellerType('Dealer')}
                    >Dealer</button>
                    <button
                      type="button"
                      className={`${styles.pillBtn} ${sellerType==='Private party'?styles.pillActive:''}`}
                      onClick={()=>setSellerType('Private party')}
                    >Private party</button>
                  </div>
                  <div className={styles.grid2}>
                    <div>
                      <label className={styles.label}>First name*</label>
                      <input className={styles.input} placeholder="First name" defaultValue={me?.name?.split(' ')?.[0] || ''} />
                    </div>
                    <div>
                      <label className={styles.label}>Last name*</label>
                      <input className={styles.input} placeholder="Last name" defaultValue={me?.name?.split(' ')?.slice(1).join(' ') || ''} />
                    </div>
                    <div>
                      <label className={styles.label}>Email*</label>
                      <input type="email" className={styles.input} placeholder="Email" defaultValue={me?.email || ''} />
                    </div>
                    <div>
                      <label className={styles.label}>Phone number*</label>
                      <input className={styles.input} placeholder="PK (+92)" defaultValue={me?.phone || ''} />
                    </div>
                  </div>
                </div>
                <div className={styles.block}>
                  <div className={styles.blockTitle}>Car Details</div>
                  <div className={styles.grid2}>
                    <div>
                      <label className={styles.label}>VIN*</label>
                      <input className={styles.input} placeholder="Enter VIN" value={carForm.vin} onChange={(e)=>setCarForm(f=>({...f, vin:e.target.value}))} />
                    </div>
                    <div>
                      <label className={styles.label}>Title*</label>
                      <input className={styles.input} placeholder="e.g. Toyota Corolla Altis" value={carForm.title} onChange={(e)=>setCarForm(f=>({...f, title:e.target.value}))} required />
                    </div>
                    <div>
                      <label className={styles.label}>Year*</label>
                      <select className={styles.input} value={carForm.year} onChange={(e)=>setCarForm(f=>({...f, year:e.target.value}))} required>
                        <option value="">Select Year</option>
                        {YEARS.map(y=> (<option key={y} value={y}>{y}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Make*</label>
                      <select className={styles.input} value={carForm.make} onChange={(e)=>{ const make = e.target.value; setCarForm(f=>({...f, make, model:""})); }} required>
                        <option value="">Select Make</option>
                        {MAKES.map(m=> (<option key={m} value={m}>{m}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Model*</label>
                      <select className={styles.input} value={carForm.model} onChange={(e)=>setCarForm(f=>({...f, model:e.target.value}))} required>
                        <option value="">All Models</option>
                        {models.map(m=> (<option key={m} value={m}>{m}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Body Type*</label>
                      <select className={styles.input} value={carForm.bodyType} onChange={(e)=>setCarForm(f=>({...f, bodyType:e.target.value}))} required>
                        <option value="">Select</option>
                        {BODY_TYPES.map(bt => (<option key={bt} value={bt}>{bt}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Mileage (in miles)</label>
                      <input className={styles.input} placeholder="e.g. 35000" value={carForm.mileage} onChange={(e)=>setCarForm(f=>({...f, mileage:e.target.value}))} />
                    </div>
                    <div>
                      <label className={styles.label}>Engine size</label>
                      <select className={styles.input} value={carForm.engineSize} onChange={(e)=>setCarForm(f=>({...f, engineSize:e.target.value}))}>
                        <option value="">Select</option>
                        <option value="4 Cylinder">4 Cylinder</option>
                        <option value="6 Cylinder">6 Cylinder</option>
                        <option value="8 Cylinder">8 Cylinder</option>
                        <option value="10 Cylinder">10 Cylinder</option>
                        <option value="12 Cylinder">12 Cylinder</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Paint*</label>
                      <select className={styles.input} value={carForm.paintStatus} onChange={(e)=>setCarForm(f=>({...f, paintStatus:e.target.value}))}>
                        <option value="">Select</option>
                        <option value="Original paint">Original paint</option>
                        <option value="Partially Repainted">Partially Repainted</option>
                        <option value="Totally Repainted">Totally Repainted</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Has GCC Specs</label>
                      <select className={styles.input} value={carForm.hasGccSpecs} onChange={(e)=>setCarForm(f=>({...f, hasGccSpecs:e.target.value}))}>
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Accident History</label>
                      <select className={styles.input} value={carForm.accidentHistory} onChange={(e)=>setCarForm(f=>({...f, accidentHistory:e.target.value}))}>
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Full Service History</label>
                      <select className={styles.input} value={carForm.fullServiceHistory} onChange={(e)=>setCarForm(f=>({...f, fullServiceHistory:e.target.value}))}>
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div className={styles.fullRow}>
                      <label className={styles.label}>Noteworthy options/features</label>
                      <textarea className={styles.textarea} placeholder="Describe noteworthy features" value={carForm.features} onChange={(e)=>setCarForm(f=>({...f, features:e.target.value}))} />
                    </div>
                    <div className={styles.fullRow}>
                      <label className={styles.label}>Has the car been modified?</label>
                      <div className={styles.pillsRow}>
                        <button type="button" className={`${styles.pillBtn} ${carForm.modified==='stock'?styles.pillActive:''}`} onClick={()=>setCarForm(f=>({...f, modified:'stock'}))}>Completely stock</button>
                        <button type="button" className={`${styles.pillBtn} ${carForm.modified==='modified'?styles.pillActive:''}`} onClick={()=>setCarForm(f=>({...f, modified:'modified'}))}>Modified</button>
                      </div>
                    </div>
                    <div>
                      <label className={styles.label}>Max Bid*</label>
                      <input className={styles.input} placeholder="$" value={carForm.maxBid} onChange={(e)=>setCarForm(f=>({...f, maxBid:e.target.value}))} />
                    </div>
                    <div className={styles.fullRow}>
                      <label className={styles.label}>Upload Photos</label>
                      <div className={styles.photoRow}>
                        <input type="file" multiple accept="image/*" onChange={onPickFiles} />
                        <button type="button" className={styles.addPhotoBtn} onClick={addPhotoField}>Add via URL</button>
                        {uploading && <span>Uploading...</span>}
                        {carForm.photos.length>0 && (
                          <div className={styles.photoList}>
                            {carForm.photos.map((p, idx)=> (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={idx} src={p.startsWith('http')?p:`${ORIGIN}${p}`} alt="photo" className={styles.photoThumb} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className={styles.block}>
              <div className={styles.blockTitle}>Auction Schedule & Pricing</div>
              <div className={styles.grid2}>
                <div>
                  <label className={styles.label}>Start Price*</label>
                  <input type="number" min={0} className={styles.input} placeholder="$" value={startPrice} onChange={(e)=>setStartPrice(e.target.value)} required />
                </div>
                <div>
                  <label className={styles.label}>Min Increment*</label>
                  <input type="number" min={1} className={styles.input} value={minIncrement} onChange={(e)=>setMinIncrement(e.target.value)} required />
                </div>
                <div>
                  <label className={styles.label}>Start At*</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={startAt}
                    min={toInputDateTime(new Date())}
                    onChange={(e)=>setStartAt(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.label}>End At*</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={endAt}
                    min={startAt || toInputDateTime(new Date())}
                    onChange={(e)=>setEndAt(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <input id="makeLive" type="checkbox" checked={makeLive} onChange={(e)=>setMakeLive(e.target.checked)} />
                <label htmlFor="makeLive">Make this auction live immediately</label>
              </div>
            </div>

            {message && <div className={styles.message}>{message}</div>}

            <div className={styles.actions}>
              <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting? 'Submitting...' : 'Submit'}</button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
