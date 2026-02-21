'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Provider, Service } from '@/types';
import { mockProvidersApi, mockServicesApi } from '@/data/mock-store';

export function useProviders(typeFilter?: string) {
  const { user, isMockMode } = useAuth();

  return useQuery({
    queryKey: ['providers', typeFilter],
    queryFn: async () => {
      if (isMockMode) {
        const providers = mockProvidersApi.getAll(typeFilter);
        return providers.map((p) => ({
          ...p,
          services: p.services,
        }));
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      let query = supabase
        .from('providers')
        .select('*, services(*)')
        .order('rating', { ascending: false });

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('business_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Provider & { services: Service[] })[];
    },
    enabled: !!user,
  });
}

export function useProvider(providerId: string) {
  const { user, isMockMode } = useAuth();

  return useQuery({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      if (isMockMode) {
        return mockProvidersApi.getById(providerId);
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('providers')
        .select('*, services(*)')
        .eq('id', providerId)
        .single();

      if (error) throw error;
      return data as Provider & { services: Service[] };
    },
    enabled: !!user && !!providerId,
  });
}

export function useServices(providerId: string | null | undefined) {
  const { isMockMode } = useAuth();

  return useQuery({
    queryKey: ['services', providerId],
    queryFn: async () => {
      if (!providerId) return [];

      if (isMockMode) {
        return mockServicesApi.getByProvider(providerId);
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerId);

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!providerId,
  });
}

export function useAllProviders() {
  const { isMockMode } = useAuth();

  return useQuery({
    queryKey: ['all-providers'],
    queryFn: async () => {
      if (isMockMode) {
        return mockProvidersApi.getAll();
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('business_name');

      if (error) throw error;
      return data as Provider[];
    },
  });
}
