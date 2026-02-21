'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/hooks/usePets';
import { useAllProviders, useServices } from '@/hooks/useProviders';
import { useBookings } from '@/hooks/useBookings';
import Link from 'next/link';

const bookingSchema = z.object({
  pet_id: z.string().min(1, 'Please select a pet'),
  provider_id: z.string().min(1, 'Please select a provider'),
  service_id: z.string().min(1, 'Please select a service'),
  booking_date: z.string().min(1, 'Please select a date'),
  booking_time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function NewBookingContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { pets } = usePets();
  const { data: providers } = useAllProviders();
  const { createBooking } = useBookings();

  const preselectedProviderId = searchParams.get('providerId');
  const preselectedServiceId = searchParams.get('serviceId');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      provider_id: preselectedProviderId || '',
      service_id: preselectedServiceId || '',
    },
  });

  const selectedProviderId = watch('provider_id');
  const { data: services } = useServices(selectedProviderId);

  useEffect(() => {
    if (preselectedProviderId) {
      setValue('provider_id', preselectedProviderId);
    }
    if (preselectedServiceId) {
      setValue('service_id', preselectedServiceId);
    }
  }, [preselectedProviderId, preselectedServiceId, setValue]);

  useEffect(() => {
    if (selectedProviderId && !preselectedServiceId) {
      setValue('service_id', '');
    }
  }, [selectedProviderId, preselectedServiceId, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    if (!user) return;

    setError(null);

    try {
      await createBooking.mutateAsync({
        pet_id: data.pet_id,
        provider_id: data.provider_id,
        service_id: data.service_id,
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        notes: data.notes,
      });

      router.push('/bookings');
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link href="/bookings" className="flex items-center text-muted-foreground">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="font-semibold">Book Service</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Select Pet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Pet</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                onValueChange={(value) => setValue('pet_id', value)}
                defaultValue={watch('pet_id')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets?.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pet_id && (
                <p className="text-sm text-destructive mt-1">{errors.pet_id.message}</p>
              )}
              {(!pets || pets.length === 0) && (
                <p className="text-sm text-muted-foreground mt-2">
                  No pets added yet.{' '}
                  <Link href="/pets/new" className="text-primary underline">
                    Add a pet
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Select Provider */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                onValueChange={(value) => setValue('provider_id', value)}
                defaultValue={watch('provider_id')}
                disabled={!!preselectedProviderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers?.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.provider_id && (
                <p className="text-sm text-destructive mt-1">
                  {errors.provider_id.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Select Service */}
          {selectedProviderId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {services?.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                  >
                    <input
                      type="radio"
                      value={service.id}
                      {...register('service_id')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-emerald-600 mt-1">
                        ฿{service.price_min?.toLocaleString()}
                        {service.price_max &&
                          service.price_max !== service.price_min && (
                            <> - ฿{service.price_max.toLocaleString()}</>
                          )}
                      </p>
                    </div>
                  </label>
                ))}
                {errors.service_id && (
                  <p className="text-sm text-destructive">{errors.service_id.message}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  min={today}
                  {...register('booking_date')}
                />
                {errors.booking_date && (
                  <p className="text-sm text-destructive">
                    {errors.booking_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Select onValueChange={(value) => setValue('booking_time', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.booking_time && (
                  <p className="text-sm text-destructive">
                    {errors.booking_time.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register('notes')}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={createBooking.isPending}>
            {createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </form>
      </main>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <NewBookingContent />
    </Suspense>
  );
}
