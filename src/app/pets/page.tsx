'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/hooks/usePets';
import Link from 'next/link';

const petEmojis: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
};

const petColors: Record<string, string> = {
  dog: 'from-amber-100 to-yellow-100',
  cat: 'from-orange-100 to-amber-100',
  bird: 'from-sky-100 to-blue-100',
  rabbit: 'from-pink-100 to-rose-100',
  other: 'from-purple-100 to-violet-100',
};

export default function PetsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { pets, isLoading } = usePets();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🐾</div>
          <p className="text-muted-foreground">Loading pets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Pets 🐾</h1>
            <p className="text-sm text-muted-foreground">Manage your fur babies</p>
          </div>
          <Link href="/pets/new">
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Pet
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {!pets || pets.length === 0 ? (
          <Card className="border-2 border-dashed border-amber-200 bg-amber-50/50">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">No pets yet!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add your first pet to get started with bookings
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
          <div className="grid grid-cols-2 gap-4">
            {pets.map((pet) => (
              <Link key={pet.id} href={`/pets/${pet.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all border-2 border-transparent hover:border-amber-200 h-full">
                  <div
                    className={`h-32 bg-gradient-to-br ${petColors[pet.species] || petColors.other} flex items-center justify-center text-5xl`}
                  >
                    {pet.photo_url ? (
                      <img
                        src={pet.photo_url}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      petEmojis[pet.species] || '🐾'
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pet.breed || pet.species}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {pet.gender && (
                        <Badge variant="secondary" className="text-xs">
                          {pet.gender === 'male' ? '👦 Boy' : '👧 Girl'}
                        </Badge>
                      )}
                      {pet.weight && (
                        <span className="text-xs text-muted-foreground">{pet.weight} kg</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
