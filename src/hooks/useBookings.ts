'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, BookingStatus } from '@/types';
import { mockBookings, mockServicesApi } from '@/data/mock-store';

export function useBookings() {
  const { user, isMockMode } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      if (!user) return [];

      if (isMockMode) {
        return mockBookings.getAll(user.id);
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          *,
          pet:pets(*),
          provider:providers(*),
          service:services(*)
        `
        )
        .order('booking_date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });

  const createBooking = useMutation({
    mutationFn: async (bookingData: {
      pet_id: string;
      provider_id: string;
      service_id: string;
      booking_date: string;
      booking_time: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Get service price for total_price
      let totalPrice: number | null = null;
      if (isMockMode) {
        const service = mockServicesApi.getById(bookingData.service_id);
        totalPrice = service?.price_min || null;
      }

      if (isMockMode) {
        return mockBookings.create(user.id, {
          ...bookingData,
          status: 'pending' as BookingStatus,
          total_price: totalPrice,
          notes: bookingData.notes || null,
        });
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          ...bookingData,
          status: 'pending',
          total_price: totalPrice,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      if (isMockMode) {
        return mockBookings.update(bookingId, { status: 'cancelled' });
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return {
    bookings,
    isLoading,
    createBooking,
    cancelBooking,
  };
}

export function useBooking(bookingId: string) {
  const { user, isMockMode } = useAuth();

  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!user) return null;

      if (isMockMode) {
        return mockBookings.getById(bookingId);
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          *,
          pet:pets(*),
          provider:providers(*),
          service:services(*)
        `
        )
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data as Booking;
    },
    enabled: !!user && !!bookingId,
  });
}

export function useUserStats() {
  const { user, isMockMode } = useAuth();

  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      if (!user) return { petCount: 0, bookingCount: 0 };

      if (isMockMode) {
        const { mockPets } = await import('@/data/mock-store');
        const { mockBookings } = await import('@/data/mock-store');
        return {
          petCount: mockPets.getAll(user.id).length,
          bookingCount: mockBookings.getAll(user.id).length,
        };
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const [petsResult, bookingsResult] = await Promise.all([
        supabase.from('pets').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id', { count: 'exact' }),
      ]);

      return {
        petCount: petsResult.count || 0,
        bookingCount: bookingsResult.count || 0,
      };
    },
    enabled: !!user,
  });
}
