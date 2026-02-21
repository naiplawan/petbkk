import { Pet, Booking, Profile } from '@/types';
import { mockProviders, mockServices } from './mock-data';

const STORAGE_KEYS = {
  PETS: 'petbkk_pets',
  BOOKINGS: 'petbkk_bookings',
  PROFILE: 'petbkk_profile',
  AUTH_USER: 'petbkk_auth_user',
};

// Helper to generate UUID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// LocalStorage helpers
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Auth mock
export const mockAuth = {
  getUser: () => {
    return getStorageItem<{ id: string; phone: string } | null>(
      STORAGE_KEYS.AUTH_USER,
      null
    );
  },
  signIn: (phone: string) => {
    const user = {
      id: generateId(),
      phone,
    };
    setStorageItem(STORAGE_KEYS.AUTH_USER, user);

    // Create profile if not exists
    const profile = getStorageItem<Profile | null>(STORAGE_KEYS.PROFILE, null);
    if (!profile) {
      const newProfile: Profile = {
        id: user.id,
        phone,
        display_name: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setStorageItem(STORAGE_KEYS.PROFILE, newProfile);
    }

    return user;
  },
  signOut: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },
};

// Profile mock
export const mockProfile = {
  get: (userId: string): Profile | null => {
    const profile = getStorageItem<Profile | null>(STORAGE_KEYS.PROFILE, null);
    return profile?.id === userId ? profile : null;
  },
  update: (userId: string, updates: Partial<Profile>): Profile | null => {
    const profile = getStorageItem<Profile | null>(STORAGE_KEYS.PROFILE, null);
    if (!profile || profile.id !== userId) return null;
    const updated = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStorageItem(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },
};

// Pets mock
export const mockPets = {
  getAll: (userId: string): Pet[] => {
    const pets = getStorageItem<Pet[]>(STORAGE_KEYS.PETS, []);
    return pets.filter((p) => p.owner_id === userId);
  },
  getById: (petId: string): Pet | null => {
    const pets = getStorageItem<Pet[]>(STORAGE_KEYS.PETS, []);
    return pets.find((p) => p.id === petId) || null;
  },
  create: (userId: string, pet: Omit<Pet, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Pet => {
    const pets = getStorageItem<Pet[]>(STORAGE_KEYS.PETS, []);
    const newPet: Pet = {
      ...pet,
      id: generateId(),
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    pets.push(newPet);
    setStorageItem(STORAGE_KEYS.PETS, pets);
    return newPet;
  },
  update: (petId: string, updates: Partial<Pet>): Pet | null => {
    const pets = getStorageItem<Pet[]>(STORAGE_KEYS.PETS, []);
    const index = pets.findIndex((p) => p.id === petId);
    if (index === -1) return null;
    pets[index] = {
      ...pets[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStorageItem(STORAGE_KEYS.PETS, pets);
    return pets[index];
  },
  delete: (petId: string): boolean => {
    const pets = getStorageItem<Pet[]>(STORAGE_KEYS.PETS, []);
    const filtered = pets.filter((p) => p.id !== petId);
    if (filtered.length === pets.length) return false;
    setStorageItem(STORAGE_KEYS.PETS, filtered);
    return true;
  },
};

// Bookings mock
export const mockBookings = {
  getAll: (userId: string): Booking[] => {
    const bookings = getStorageItem<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    return bookings
      .filter((b) => b.user_id === userId)
      .map((b) => ({
        ...b,
        pet: mockPets.getById(b.pet_id) || undefined,
        provider: mockProviders.find((p) => p.id === b.provider_id),
        service: mockServices.find((s) => s.id === b.service_id),
      }));
  },
  getById: (bookingId: string): (Booking & { pet?: Pet; provider?: any; service?: any }) | null => {
    const bookings = getStorageItem<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return null;
    return {
      ...booking,
      pet: mockPets.getById(booking.pet_id) || undefined,
      provider: mockProviders.find((p) => p.id === booking.provider_id),
      service: mockServices.find((s) => s.id === booking.service_id),
    };
  },
  create: (userId: string, booking: Omit<Booking, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Booking => {
    const bookings = getStorageItem<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const newBooking: Booking = {
      ...booking,
      id: generateId(),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    bookings.push(newBooking);
    setStorageItem(STORAGE_KEYS.BOOKINGS, bookings);
    return newBooking;
  },
  update: (bookingId: string, updates: Partial<Booking>): Booking | null => {
    const bookings = getStorageItem<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) return null;
    bookings[index] = {
      ...bookings[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStorageItem(STORAGE_KEYS.BOOKINGS, bookings);
    return bookings[index];
  },
  delete: (bookingId: string): boolean => {
    const bookings = getStorageItem<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const filtered = bookings.filter((b) => b.id !== bookingId);
    if (filtered.length === bookings.length) return false;
    setStorageItem(STORAGE_KEYS.BOOKINGS, filtered);
    return true;
  },
};

// Providers mock (static data)
export const mockProvidersApi = {
  getAll: (typeFilter?: string) => {
    if (typeFilter && typeFilter !== 'all') {
      return mockProviders.filter((p) => p.business_type === typeFilter);
    }
    return mockProviders;
  },
  getById: (id: string) => {
    return mockProviders.find((p) => p.id === id) || null;
  },
};

// Services mock
export const mockServicesApi = {
  getByProvider: (providerId: string) => {
    return mockServices.filter((s) => s.provider_id === providerId);
  },
  getById: (serviceId: string) => {
    return mockServices.find((s) => s.id === serviceId) || null;
  },
};
