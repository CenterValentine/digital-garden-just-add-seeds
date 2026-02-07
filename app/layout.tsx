import './globals.css';
import type { Metadata } from 'next';
import { AuthSessionProvider } from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'Garden Map',
  description: 'Plan and manage gardens directly on a map.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen gradient-backdrop">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
