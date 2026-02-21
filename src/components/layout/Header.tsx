'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'PetBKK' }: HeaderProps) {
  const { signOut, profile } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-4 mt-8">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="font-medium">{profile?.display_name || profile?.phone || 'User'}</p>
              </div>
              <Link href="/pets" className="px-4 py-2 hover:bg-accent rounded-lg">
                My Pets
              </Link>
              <Link href="/providers" className="px-4 py-2 hover:bg-accent rounded-lg">
                Find Services
              </Link>
              <Link href="/bookings" className="px-4 py-2 hover:bg-accent rounded-lg">
                My Bookings
              </Link>
              <Link href="/profile" className="px-4 py-2 hover:bg-accent rounded-lg">
                Profile
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="font-semibold text-lg">{title}</h1>
        <div className="w-10" /> {/* Spacer for centering title */}
      </div>
    </header>
  );
}
