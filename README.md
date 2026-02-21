# PetBKK POC

A proof of concept for a pet services booking app in Bangkok.

## Features

- User registration with phone + OTP (mocked for POC)
- Add and manage pets with photos
- Browse service providers
- Book services (veterinary, grooming, boarding, etc.)
- View and manage bookings

## Tech Stack

- **Frontend**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Language**: TypeScript
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Setup

1. Clone the repository:
   ```bash
   cd petbkk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project at https://supabase.com

4. Copy the environment file:
   ```bash
   cp .env.local.example .env.local
   ```

5. Add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

6. Run the database schema in Supabase SQL Editor:
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy and paste the contents into Supabase SQL Editor
   - Execute the script

7. Create a storage bucket for pet photos:
   - Go to Storage in Supabase Dashboard
   - Create a new bucket named `pet-photos`
   - Set it to public

8. Start the development server:
   ```bash
   npm run dev
   ```

9. Open http://localhost:3000 in your browser

## POC Testing

For the POC, OTP verification is mocked. You can enter any 6-digit code to verify.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── pets/           # Pet management
│   ├── providers/      # Service providers
│   ├── bookings/       # Booking management
│   └── profile/        # User profile
├── components/
│   ├── layout/         # Layout components (Header, BottomNav)
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and clients
└── types/              # TypeScript type definitions
```

## License

MIT
