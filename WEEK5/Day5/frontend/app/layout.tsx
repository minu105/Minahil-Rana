import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { Josefin_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const josefinSans = Josefin_Sans({ subsets: ['latin'], weight: ['300','400','500','600','700'] });

export const metadata = { title: 'Car Auction' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={josefinSans.className}>
        <AuthProvider>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              success: {
                style: {
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                },
                iconTheme: {
                  primary: '#16a34a',
                  secondary: '#f0fdf4',
                },
              },
              error: {
                style: {
                  background: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                },
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#fef2f2',
                },
              },
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
