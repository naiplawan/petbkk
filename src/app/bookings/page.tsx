'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { Booking, BookingStatus } from '@/types';
import Link from 'next/link';

const statusConfig: Record<BookingStatus, { emoji: string; color: string; label: string }> = {
  pending: { emoji: '⏳', color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
  confirmed: { emoji: '✅', color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
  in_progress: { emoji: '🔄', color: 'bg-purple-100 text-purple-700', label: 'In Progress' },
  completed: { emoji: '✓', color: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
  cancelled: { emoji: '✕', color: 'bg-gray-100 text-gray-700', label: 'Cancelled' },
};

const serviceEmojis: Record<string, string> = {
  veterinary: '🏥',
  grooming: '✂️',
  boarding: '🏨',
  pet_shop: '🛒',
  training: '🎓',
  pet_sitting: '❤️',
};

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { bookings, isLoading } = useBookings();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const upcomingBookings = bookings?.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );

  const pastBookings = bookings?.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🐾</div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  const BookingCard = ({ booking }: { booking: Booking & { pet?: any; provider?: any; service?: any } }) => {
    const status = statusConfig[booking.status];
    const serviceEmoji = booking.provider?.business_type
      ? serviceEmojis[booking.provider.business_type] || '🐾'
      : '🐾';

    return (
      <Link href={`/bookings/${booking.id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-all border-2 border-transparent hover:border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {serviceEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {booking.provider?.business_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.service?.name}
                    </p>
                  </div>
                  <Badge className={status.color}>
                    <span className="mr-1">{status.emoji}</span>
                    {status.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(booking.booking_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {booking.booking_time}
                  </span>
                </div>

                {booking.pet && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-sm">
                      <span className="text-muted-foreground">For:</span>{' '}
                      <span className="font-medium text-gray-700">
                        🐾 {booking.pet.name}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings 📅</h1>
            <p className="text-sm text-muted-foreground">View your appointments</p>
          </div>
          <Link href="/providers">
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full"
            >
              + Book New
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <Tabs defaultValue="upcoming">
          <TabsList className="w-full bg-amber-100/50">
            <TabsTrigger value="upcoming" className="flex-1 data-[state=active]:bg-white">
              Upcoming ({upcomingBookings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 data-[state=active]:bg-white">
              Past ({pastBookings?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {!upcomingBookings || upcomingBookings.length === 0 ? (
              <Card className="border-2 border-dashed border-amber-200 bg-amber-50/50">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Find a service provider and book your first appointment
                  </p>
                  <Link href="/providers">
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      Find Services
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-3">
            {!pastBookings || pastBookings.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-muted-foreground">No past bookings yet</p>
                </CardContent>
              </Card>
            ) : (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
