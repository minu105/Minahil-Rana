'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Meme } from '@/services/memeSources';
import { getMixedMemes } from '@/services/memeSources';

export default function Page() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const batch = await getMixedMemes(12);
      setMemes((prev) => {
        const seen = new Set(prev.map((m) => m.url || m.postLink || m.title));
        const merged = [...prev];
        for (const m of batch) {
          const key = m.url || m.postLink || m.title;
          if (key && !seen.has(key)) {
            seen.add(key);
            merged.push(m);
          }
        }
        return merged;
      });
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, loading]);

  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Brainrot Dev Memes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto p-4">
        {memes.map((meme, idx) => (
          <div
            key={(meme.postLink ?? meme.url) + idx}
            className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex flex-col items-center p-3"
          >
            <h2 className="text-sm sm:text-base font-semibold text-center mb-2">
              {meme.title}
            </h2>
            <img
              src={meme.url}
              alt={meme.title}
              className="max-h-80 w-auto max-w-full rounded-lg object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <div ref={loaderRef} className="h-12 flex items-center justify-center">
        {loading && <p className="text-gray-400">Loading more memes...</p>}
      </div>
    </main>
  );
}
