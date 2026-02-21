-- PetBKK POC Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'other')),
  breed VARCHAR(100),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  weight DECIMAL(5,2),
  color VARCHAR(50),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Providers table (mock data for POC)
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(200) NOT NULL,
  business_type VARCHAR(50) NOT NULL CHECK (business_type IN ('veterinary', 'grooming', 'boarding', 'pet_shop', 'training', 'pet_sitting')),
  description TEXT,
  address TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL DEFAULT 'Bangkok',
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  opening_hours JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  pet_types TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON bookings(pet_id);
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(business_type);
CREATE INDEX IF NOT EXISTS idx_providers_district ON providers(district);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Pets policies
CREATE POLICY "Users can view own pets" ON pets
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own pets" ON pets
  FOR DELETE USING (auth.uid() = owner_id);

-- Providers policies (public read for POC)
CREATE POLICY "Anyone can view providers" ON providers
  FOR SELECT USING (true);

-- Services policies (public read for POC)
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert mock providers data for POC
INSERT INTO providers (id, business_name, business_type, description, address, district, phone, email, rating, review_count, is_verified, opening_hours) VALUES
  ('11111111-1111-1111-1111-111111111111', 'PetCare Veterinary Clinic', 'veterinary', 'Full-service veterinary clinic with 24/7 emergency care. Experienced team of veterinarians specializing in dogs and cats.', '123 Sukhumvit Road', 'Watthana', '02-123-4567', 'info@petcarevet.co.th', 4.8, 156, true, '{"monday": {"open": "09:00", "close": "21:00"}, "tuesday": {"open": "09:00", "close": "21:00"}, "wednesday": {"open": "09:00", "close": "21:00"}, "thursday": {"open": "09:00", "close": "21:00"}, "friday": {"open": "09:00", "close": "21:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "10:00", "close": "18:00"}}'),
  ('22222222-2222-2222-2222-222222222222', 'Happy Paws Grooming', 'grooming', 'Professional pet grooming salon offering full grooming services, baths, nail trimming, and spa treatments.', '456 Silom Road', 'Bang Rak', '02-234-5678', 'hello@happypaws.co.th', 4.6, 89, true, '{"monday": {"open": "10:00", "close": "19:00"}, "tuesday": {"open": "10:00", "close": "19:00"}, "wednesday": {"open": "10:00", "close": "19:00"}, "thursday": {"open": "10:00", "close": "19:00"}, "friday": {"open": "10:00", "close": "19:00"}, "saturday": {"open": "09:00", "close": "20:00"}, "sunday": {"open": "09:00", "close": "18:00"}}'),
  ('33333333-3333-3333-3333-333333333333', 'Pet Paradise Hotel', 'boarding', 'Luxury pet boarding facility with spacious rooms, daily exercise, and 24/7 supervision. Your pets will love their vacation!', '789 Rama III Road', 'Yan Nawa', '02-345-6789', 'booking@petparadise.co.th', 4.9, 234, true, '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "20:00"}}'),
  ('44444444-4444-4444-4444-444444444444', 'Pawsitive Training Center', 'training', 'Positive reinforcement dog training. We offer puppy classes, obedience training, and behavioral modification.', '321 Phahonyothin Road', 'Chatuchak', '02-456-7890', 'train@pawsitive.co.th', 4.7, 67, true, '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "17:00"}, "sunday": {"open": "08:00", "close": "17:00"}}'),
  ('55555555-5555-5555-5555-555555555555', 'Dr. Kittisak Pet Hospital', 'veterinary', 'Modern veterinary hospital with advanced diagnostic equipment. Specializing in exotic pets and small animals.', '555 Srinakarin Road', 'Huai Khwang', '02-567-8901', 'info@drkittisak.co.th', 4.5, 112, true, '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "22:00"}, "saturday": {"open": "09:00", "close": "21:00"}, "sunday": {"open": "09:00", "close": "21:00"}}');

-- Insert services for each provider
INSERT INTO services (provider_id, name, description, duration_minutes, price_min, price_max, pet_types) VALUES
  -- PetCare Veterinary Clinic services
  ('11111111-1111-1111-1111-111111111111', 'General Checkup', 'Comprehensive health examination for your pet', 30, 500, 800, '{"dog", "cat"}'),
  ('11111111-1111-1111-1111-111111111111', 'Vaccination', 'Annual vaccination and health check', 20, 600, 1000, '{"dog", "cat"}'),
  ('11111111-1111-1111-1111-111111111111', 'Dental Cleaning', 'Professional teeth cleaning and polishing', 60, 2000, 3500, '{"dog", "cat"}'),
  ('11111111-1111-1111-1111-111111111111', 'Emergency Care', '24/7 emergency veterinary services', 60, 2000, 10000, '{"dog", "cat", "bird", "rabbit"}'),

  -- Happy Paws Grooming services
  ('22222222-2222-2222-2222-222222222222', 'Full Grooming', 'Complete grooming including bath, haircut, nail trim', 120, 800, 1500, '{"dog", "cat"}'),
  ('22222222-2222-2222-2222-222222222222', 'Bath & Brush', 'Bath, blow dry, and brush out', 60, 400, 700, '{"dog", "cat"}'),
  ('22222222-2222-2222-2222-222222222222', 'Nail Trim', 'Nail trimming and filing', 15, 150, 250, '{"dog", "cat", "rabbit", "bird"}'),
  ('22222222-2222-2222-2222-222222222222', 'Spa Package', 'Full grooming plus aromatherapy and paw massage', 150, 1500, 2500, '{"dog", "cat"}'),

  -- Pet Paradise Hotel services
  ('33333333-3333-3333-3333-333333333333', 'Day Care', 'Full day of supervised play and care', 480, 500, 800, '{"dog", "cat"}'),
  ('33333333-3333-3333-3333-333333333333', 'Overnight Stay', '24-hour boarding in private room', 1440, 800, 1500, '{"dog", "cat"}'),
  ('33333333-3333-3333-3333-333333333333', 'Extended Stay (Week)', '7-day boarding package', 10080, 5000, 9000, '{"dog", "cat"}'),

  -- Pawsitive Training Center services
  ('44444444-4444-4444-4444-444444444444', 'Puppy Class', 'Basic obedience for puppies (8 weeks course)', 60, 500, 500, '{"dog"}'),
  ('44444444-4444-4444-4444-444444444444', 'Private Training', 'One-on-one training session', 60, 1500, 2000, '{"dog"}'),
  ('44444444-4444-4444-4444-444444444444', 'Behavioral Consultation', 'Assessment and training plan for behavioral issues', 90, 2000, 2500, '{"dog", "cat"}'),

  -- Dr. Kittisak Pet Hospital services
  ('55555555-5555-5555-5555-555555555555', 'General Checkup', 'Comprehensive health examination', 30, 600, 900, '{"dog", "cat", "bird", "rabbit"}'),
  ('55555555-5555-5555-5555-555555555555', 'Surgery Consultation', 'Pre-surgical examination and consultation', 45, 1000, 1500, '{"dog", "cat", "bird", "rabbit"}'),
  ('55555555-5555-5555-5555-555555555555', 'X-Ray & Imaging', 'Diagnostic imaging services', 30, 1500, 3000, '{"dog", "cat", "bird", "rabbit"}');
