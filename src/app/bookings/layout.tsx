'use client';

import { BottomNav } from '@/components/layout/BottomNav';

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
