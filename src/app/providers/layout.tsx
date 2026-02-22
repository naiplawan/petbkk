'use client';

import { BottomNav } from '@/components/layout/BottomNav';

export default function ProvidersLayout({
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
