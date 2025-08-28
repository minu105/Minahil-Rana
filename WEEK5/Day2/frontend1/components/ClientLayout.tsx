'use client';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />  
      <div className="container" style={{ marginTop: '1rem' }}>{children}</div>
    </AuthProvider>
  );
}