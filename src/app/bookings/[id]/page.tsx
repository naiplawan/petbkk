'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Calendar, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Booking not found</p>
        <Link href="/bookings">
          <Button variant="link">Go back</Button>
        </Link>
      </div>
    );
  }

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link href="/bookings" className="flex items-center text-muted-foreground">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="font-semibold text-sm">Booking Details</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="pb-8 max-w-lg mx-auto">
        <div className="p-4 space-y-4">
          {/* Status Banner */}
          <div className="flex items-center justify-center py-4">
            <Badge
              className={`${statusColors[booking.status]} text-white text-base px-4 py-2`}
            >
              {statusLabels[booking.status]}
            </Badge>
          </div>

          {/* Provider Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">
                    {booking.provider?.business_type === 'veterinary' && '🏥'}
                    {booking.provider?.business_type === 'grooming' && '✂️'}
                    {booking.provider?.business_type === 'boarding' && '🏨'}
                    {booking.provider?.business_type === 'pet_shop' && '🛒'}
                    {booking.provider?.business_type === 'training' && '🎓'}
                    {booking.provider?.business_type === 'pet_sitting' && '❤️'}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">
                    {booking.provider?.business_name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {booking.service?.name}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    {booking.provider?.district}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <a href={`tel:${booking.provider?.phone}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </a>
                <Link href={`/providers/${booking.provider?.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Provider
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(booking.booking_date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{booking.booking_time}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pet Info */}
          {booking.pet && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {booking.pet.photo_url ? (
                      <img
                        src={booking.pet.photo_url}
                        alt={booking.pet.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-xl">🐾</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{booking.pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.pet.breed || booking.pet.species}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{booking.service?.name}</p>
              {booking.service?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {booking.service.description}
                </p>
              )}
              {booking.service?.duration_minutes && (
                <p className="text-sm text-muted-foreground mt-1">
                  Duration: {booking.service.duration_minutes} minutes
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{booking.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Cancel Button */}
          {canCancel && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          )}
        </div>
      </main>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be
              undone.
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
              {cancelBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
