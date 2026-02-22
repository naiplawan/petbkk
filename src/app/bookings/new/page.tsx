'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Calendar, Clock, MapPin, PawPrint } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
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

const petEmojis: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
};

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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/bookings" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">Book a Service 📅</h1>
          </div>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-sm text-gray-600">Let&apos;s book your appointment</span>
            </div>
          </div>

          {/* Select Pet */}
          <Card className="border-2 border-amber-200">
            <CardContent className="p-4">
              <Label className="text-gray-900 font-medium flex items-center gap-2 mb-3">
                <PawPrint className="h-4 w-4 text-amber-500" />
                Which pet?
              </Label>
              <Select
                onValueChange={(value) => setValue('pet_id', value)}
                defaultValue={watch('pet_id')}
              >
                <SelectTrigger className="bg-amber-50 border-amber-200">
                  <SelectValue placeholder="Choose your pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets?.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      <span className="flex items-center gap-2">
                        <span>{petEmojis[pet.species] || '🐾'}</span>
                        <span>{pet.name}</span>
                        <span className="text-muted-foreground">({pet.species})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pet_id && (
                <p className="text-sm text-red-500 mt-2">{errors.pet_id.message}</p>
              )}
              {(!pets || pets.length === 0) && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700">
                    No pets added yet.{' '}
                    <Link href="/pets/new" className="underline font-medium">
                      Add a pet first
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Select Provider */}
          <Card className="border-2 border-amber-200">
            <CardContent className="p-4">
              <Label className="text-gray-900 font-medium flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-amber-500" />
                Choose provider
              </Label>
              <Select
                onValueChange={(value) => setValue('provider_id', value)}
                defaultValue={watch('provider_id')}
                disabled={!!preselectedProviderId}
              >
                <SelectTrigger className="bg-amber-50 border-amber-200">
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
                <p className="text-sm text-red-500 mt-2">{errors.provider_id.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Select Service */}
          {selectedProviderId && (
            <Card className="border-2 border-amber-200">
              <CardContent className="p-4">
                <Label className="text-gray-900 font-medium flex items-center gap-2 mb-3">
                  <span className="text-lg">🛎️</span>
                  Select service
                </Label>
                <div className="space-y-2">
                  {services?.map((service) => (
                    <label
                      key={service.id}
                      className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        watch('service_id') === service.id
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-amber-100 hover:border-amber-200'
                      }`}
                    >
                      <input
                        type="radio"
                        value={service.id}
                        {...register('service_id')}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="font-semibold text-emerald-600">
                            ฿{service.price_min?.toLocaleString()}
                            {service.price_max &&
                              service.price_max !== service.price_min && (
                                <> - ฿{service.price_max.toLocaleString()}</>
                              )}
                          </span>
                          {service.duration_minutes && (
                            <span className="text-muted-foreground">
                              · {service.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.service_id && (
                  <p className="text-sm text-red-500 mt-2">{errors.service_id.message}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Date & Time */}
          <Card className="border-2 border-amber-200">
            <CardContent className="p-4">
              <Label className="text-gray-900 font-medium flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-amber-500" />
                When?
              </Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <Input
                    type="date"
                    min={today}
                    {...register('booking_date')}
                    className="bg-amber-50 border-amber-200"
                  />
                  {errors.booking_date && (
                    <p className="text-sm text-red-500">{errors.booking_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Time</Label>
                  <Select onValueChange={(value) => setValue('booking_time', value)}>
                    <SelectTrigger className="bg-amber-50 border-amber-200">
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
                    <p className="text-sm text-red-500">{errors.booking_time.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-2 border-amber-200">
            <CardContent className="p-4">
              <Label className="text-gray-900 font-medium flex items-center gap-2 mb-3">
                <span>📝</span>
                Additional Notes
              </Label>
              <Textarea
                {...register('notes')}
                placeholder="Any special requests or notes..."
                rows={3}
                className="bg-amber-50 border-amber-200"
              />
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-base"
            disabled={createBooking.isPending}
          >
            {createBooking.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Booking...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Confirm Booking <span>✓</span>
              </span>
            )}
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
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl animate-bounce">🐾</div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <NewBookingContent />
    </Suspense>
  );
}
