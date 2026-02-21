'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, PawPrint, Dog, Cat, Bird, Fish } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/hooks/usePets';
import Link from 'next/link';

const petIcons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Fish,
  other: PawPrint,
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Pets</h2>
        <Link href="/pets/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Pet
          </Button>
        </Link>
      </div>

      {!pets || pets.length === 0 ? (
        <Card className="p-8 text-center">
          <PawPrint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No pets yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first pet to get started
          </p>
          <Link href="/pets/new">
            <Button>Add Your First Pet</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {pets.map((pet) => {
            const PetIcon = petIcons[pet.species] || PawPrint;
            return (
              <Link key={pet.id} href={`/pets/${pet.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-24 h-24 bg-muted flex items-center justify-center">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PetIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{pet.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {pet.breed || pet.species}
                            </p>
                          </div>
                          {pet.gender && (
                            <Badge variant="secondary">
                              {pet.gender === 'male' ? 'Male' : 'Female'}
                            </Badge>
                          )}
                        </div>
                        {pet.weight && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {pet.weight} kg
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
