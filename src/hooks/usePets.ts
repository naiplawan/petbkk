'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Pet } from '@/types';
import { mockPets } from '@/data/mock-store';

export function usePets() {
  const { user, isMockMode } = useAuth();
  const queryClient = useQueryClient();

  const { data: pets, isLoading, refetch } = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      if (!user) return [];

      if (isMockMode) {
        return mockPets.getAll(user.id);
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Pet[];
    },
    enabled: !!user,
  });

  const createPet = useMutation({
    mutationFn: async (petData: Omit<Pet, 'id' | 'owner_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');

      if (isMockMode) {
        return mockPets.create(user.id, petData);
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('pets')
        .insert({
          owner_id: user.id,
          ...petData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });

  const updatePet = useMutation({
    mutationFn: async ({ petId, updates }: { petId: string; updates: Partial<Pet> }) => {
      if (isMockMode) {
        return mockPets.update(petId, updates);
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', petId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });

  const deletePet = useMutation({
    mutationFn: async (petId: string) => {
      if (isMockMode) {
        return mockPets.delete(petId);
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase.from('pets').delete().eq('id', petId);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });

  return {
    pets,
    isLoading,
    refetch,
    createPet,
    updatePet,
    deletePet,
  };
}

export function usePet(petId: string) {
  const { user, isMockMode } = useAuth();

  return useQuery({
    queryKey: ['pet', petId],
    queryFn: async () => {
      if (!user) return null;

      if (isMockMode) {
        return mockPets.getById(petId);
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (error) throw error;
      return data as Pet;
    },
    enabled: !!user && !!petId,
  });
}
