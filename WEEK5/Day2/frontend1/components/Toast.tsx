'use client';
import React, { useEffect, useState } from 'react';

export default function Toast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    function handler(e: Event) {
      const ce = e as CustomEvent<string>;
      setMsg(ce.detail);
      const t = setTimeout(() => setMsg(null), 2500);
      return () => clearTimeout(t);
    }
    window.addEventListener('toast', handler as EventListener);
    return () => window.removeEventListener('toast', handler as EventListener);
  }, []);

  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, background: '#122036',
      border: '1px solid #2a3c61', padding: '10px 12px', borderRadius: 10,
      boxShadow: '0 6px 24px rgba(0,0,0,.3)'
    }}>
      {msg}
    </div>
  );
}

export const showToast = (text: string) =>
  window.dispatchEvent(new CustomEvent('toast', { detail: text }));
