import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Villa Booking',
  description: 'Admin dashboard for villa management',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning={true}>
      {children}
    </div>
  );
}
