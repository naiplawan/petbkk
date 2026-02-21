// PetBKK Types

export interface Profile {
  id: string;
  phone: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string | null;
  gender: 'male' | 'female' | null;
  birth_date: string | null;
  weight: number | null;
  color: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  business_name: string;
  business_type: ProviderType;
  description: string | null;
  address: string;
  district: string;
  province: string;
  phone: string;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  photos: string[];
  rating: number;
  review_count: number;
  services: Service[];
  opening_hours: OpeningHours;
  is_verified: boolean;
  created_at: string;
}

export type ProviderType =
  | 'veterinary'
  | 'grooming'
  | 'boarding'
  | 'pet_shop'
  | 'training'
  | 'pet_sitting';

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_min: number;
  price_max: number;
  pet_types: string[];
  is_available: boolean;
  created_at: string;
}

export interface OpeningHours {
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
}

export interface DayHours {
  open: string;
  close: string;
}

export interface Booking {
  id: string;
  user_id: string;
  pet_id: string;
  provider_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  notes: string | null;
  total_price: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  pet?: Pet;
  provider?: Provider;
  service?: Service;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Form types
export interface PetFormData {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  gender: 'male' | 'female';
  birth_date: string;
  weight: number;
  color: string;
  notes: string;
}

export interface BookingFormData {
  pet_id: string;
  provider_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  notes: string;
}
