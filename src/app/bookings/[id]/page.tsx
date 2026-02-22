'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Calendar, Clock, XCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBooking, useBookings } from '@/hooks/useBookings';
import { BookingStatus } from '@/types';
import Link from 'next/link';

const statusConfig: Record<BookingStatus, { emoji: string; color: string; label: string; bg: string }> = {
  pending: { emoji: '⏳', color: 'text-yellow-700', label: 'Pending', bg: 'bg-yellow-100' },
  confirmed: { emoji: '✅', color: 'text-blue-700', label: 'Confirmed', bg: 'bg-blue-100' },
  in_progress: { emoji: '🔄', color: 'text-purple-700', label: 'In Progress', bg: 'bg-purple-100' },
  completed: { emoji: '✓', color: 'text-emerald-700', label: 'Completed', bg: 'bg-emerald-100' },
  cancelled: { emoji: '✕', color: 'text-gray-700', label: 'Cancelled', bg: 'bg-gray-100' },
};

const serviceEmojis: Record<string, string> = {
  veterinary: '🏥',
  grooming: '✂️',
  boarding: '🏨',
  pet_shop: '🛒',
  training: '🎓',
  pet_sitting: '❤️',
};

const petEmojis: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
};

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { data: booking, isLoading } = useBooking(id);
  const { cancelBooking } = useBookings();

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync(id);
      setCancelDialogOpen(false);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🐾</div>
          <p className="text-muted-foreground">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-muted-foreground mb-4">Booking not found</p>
        <Link href="/bookings">
          <Button variant="outline">Go back</Button>
        </Link>
      </div>
    );
  }

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const status = statusConfig[booking.status];
  const serviceEmoji = booking.provider?.business_type
    ? serviceEmojis[booking.provider.business_type] || '🐾'
    : '🐾';
  const petEmoji = booking.pet?.species ? petEmojis[booking.pet.species] || '🐾' : '🐾';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/bookings" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">Booking Details</h1>
          </div>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Status Banner */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{status.emoji}</span>
              <span className={`text-lg font-semibold ${status.color}`}>{status.label}</span>
            </div>
          </CardContent>
        </Card>

        {/* Provider Info */}
        <Card className="border-2 border-amber-200">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 text-4xl">
                {serviceEmoji}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-gray-900">
                  {booking.provider?.business_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {booking.service?.name}
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {booking.provider?.district}, {booking.provider?.province}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <a href={`tel:${booking.provider?.phone}`} className="flex-1">
                <Button variant="outline" className="w-full border-amber-200 hover:bg-amber-50">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </a>
              <Link href={`/providers/${booking.provider?.id}`} className="flex-1">
                <Button variant="outline" className="w-full border-amber-200 hover:bg-amber-50">
                  <Navigation className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-2 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(booking.booking_date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">⏰</div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-semibold text-gray-900">{booking.booking_time}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pet Info */}
        {booking.pet && (
          <Card className="border-2 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-3xl">
                  {booking.pet.photo_url ? (
                    <img
                      src={booking.pet.photo_url}
                      alt={booking.pet.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    petEmoji
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{booking.pet.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.pet.breed || booking.pet.species}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Details */}
        <Card className="border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>🛎️</span>
              <h3 className="font-semibold text-gray-900">Service</h3>
            </div>
            <p className="font-medium">{booking.service?.name}</p>
            {booking.service?.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {booking.service.description}
              </p>
            )}
            {booking.service?.duration_minutes && (
              <p className="text-sm text-muted-foreground mt-2">
                ⏱️ Duration: {booking.service.duration_minutes} minutes
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {booking.notes && (
          <Card className="border-2 border-amber-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>📝</span>
                <h3 className="font-semibold text-gray-900">Notes</h3>
              </div>
              <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg">{booking.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Booking? 🥺</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                  Keep Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelBooking.isPending}
                >
                  {cancelBooking.isPending ? 'Cancelling...' : 'Yes, Cancel'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Book Another */}
        <Link href="/providers">
          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            Book Another Service
          </Button>
        </Link>
      </main>
    </div>
  );
}
