'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { Booking, BookingStatus } from '@/types';
import Link from 'next/link';

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-gray-500',
};

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const BookingCard = ({ booking }: { booking: Booking & { pet?: any; provider?: any; service?: any } }) => (
    <Link href={`/bookings/${booking.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold">{booking.provider?.business_name}</h3>
              <p className="text-sm text-muted-foreground">
                {booking.service?.name}
              </p>
            </div>
            <Badge className={`${statusColors[booking.status]} text-white`}>
              {statusLabels[booking.status]}
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
            <div className="mt-3 pt-3 border-t text-sm">
              <span className="text-muted-foreground">Pet:</span>{' '}
              <span className="font-medium">{booking.pet.name}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Bookings</h2>
        <Link href="/providers">
          <Button size="sm">Book Service</Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming ({upcomingBookings?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past ({pastBookings?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {!upcomingBookings || upcomingBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No upcoming bookings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Find a service provider and book your first appointment
              </p>
              <Link href="/providers">
                <Button>Find Services</Button>
              </Link>
            </Card>
          ) : (
            upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {!pastBookings || pastBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No past bookings</p>
            </Card>
          ) : (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
