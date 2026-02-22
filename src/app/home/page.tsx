'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PawPrint,
  Calendar,
  Plus,
  Sparkles,
  Clock,
  MapPin,
  Stethoscope,
  Scissors,
  Home,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/hooks/usePets';
import { useBookings } from '@/hooks/useBookings';

const quickActions = [
  {
    icon: Stethoscope,
    label: 'Book Vet',
    href: '/providers?type=veterinary',
    color: 'bg-blue-100 text-blue-600',
    emoji: '🏥',
  },
  {
    icon: Scissors,
    label: 'Grooming',
    href: '/providers?type=grooming',
    color: 'bg-purple-100 text-purple-600',
    emoji: '✂️',
  },
  {
    icon: Home,
    label: 'Boarding',
    href: '/providers?type=boarding',
    color: 'bg-orange-100 text-orange-600',
    emoji: '🏨',
  },
  {
    icon: GraduationCap,
    label: 'Training',
    href: '/providers?type=training',
    color: 'bg-green-100 text-green-600',
    emoji: '🎓',
  },
];

const petEmojis: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
};

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { pets } = usePets();
  const { bookings } = useBookings();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🐾</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const upcomingBooking = bookings?.find(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );

  const displayedPets = pets?.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back! 👋</p>
              <h1 className="text-xl font-bold text-gray-900">
                {user?.user_metadata?.display_name || 'Pet Parent'}
              </h1>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
              🐾
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Quick Actions */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">What does your pet need?</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-amber-200">
                  <CardContent className="p-3 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-xl">{action.emoji}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">{action.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Booking */}
        {upcomingBooking && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-gray-900">Upcoming Visit</h2>
            </div>
            <Link href={`/bookings/${upcomingBooking.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-all border-2 border-blue-100 hover:border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                      📅
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {upcomingBooking.provider?.business_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {upcomingBooking.service?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-blue-500">
                          {new Date(upcomingBooking.booking_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          at {upcomingBooking.booking_time}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </section>
        )}

        {/* My Pets */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold text-gray-900">My Fur Babies</h2>
            </div>
            <Link href="/pets">
              <Button variant="ghost" size="sm" className="text-orange-600">
                See All
              </Button>
            </Link>
          </div>

          {!pets || pets.length === 0 ? (
            <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-3">🐾</div>
                <h3 className="font-semibold text-gray-900 mb-1">No pets yet!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first pet to get started
                </p>
                <Link href="/pets/new">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Pet
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayedPets.map((pet) => (
                <Link key={pet.id} href={`/pets/${pet.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-all border-2 border-orange-100 hover:border-orange-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-2xl">
                          {pet.photo_url ? (
                            <img
                              src={pet.photo_url}
                              alt={pet.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            petEmojis[pet.species] || '🐾'
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {pet.breed || pet.species}
                          </p>
                        </div>
                        {pet.gender && (
                          <Badge variant="secondary" className="text-xs">
                            {pet.gender === 'male' ? '👦 Boy' : '👧 Girl'}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {pets.length > 3 && (
                <Link href="/pets">
                  <Button variant="outline" className="w-full">
                    View All {pets.length} Pets
                  </Button>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Browse All Services */}
        <section>
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 border-0 text-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">Explore All Services</h3>
                  <p className="text-emerald-100 text-sm">
                    Find 500+ verified providers across Bangkok
                  </p>
                </div>
                <Link href="/providers">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-emerald-600 hover:bg-emerald-50"
                  >
                    Browse
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
