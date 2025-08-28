import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const metadata = { title: 'Realtime Comments – Test Client' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
