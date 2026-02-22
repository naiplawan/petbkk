'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePet, usePets } from '@/hooks/usePets';
import Link from 'next/link';

const petEmojis: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
};

const petColors: Record<string, string> = {
  dog: 'from-amber-400 to-yellow-400',
  cat: 'from-orange-400 to-amber-400',
  bird: 'from-sky-400 to-blue-400',
  rabbit: 'from-pink-400 to-rose-400',
  other: 'from-purple-400 to-violet-400',
};

export default function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: pet, isLoading } = usePet(id);
  const { deletePet } = usePets();

  const handleDelete = async () => {
    try {
      await deletePet.mutateAsync(id);
      router.push('/pets');
    } catch (err) {
      console.error('Failed to delete pet:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🐾</div>
          <p className="text-muted-foreground">Loading pet details...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">😿</div>
        <p className="text-muted-foreground mb-4">Pet not found</p>
        <Link href="/pets">
          <Button variant="outline">Go back</Button>
        </Link>
      </div>
    );
  }

  const emoji = petEmojis[pet.species] || '🐾';
  const gradient = petColors[pet.species] || petColors.other;

  // Calculate age
  let ageText = '';
  if (pet.birth_date) {
    const birthDate = new Date(pet.birth_date);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      ageText = `${years - 1} years old`;
    } else {
      ageText = `${years} years old`;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/pets" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">Pet Details</h1>
          </div>
          <Link href={`/pets/${pet.id}/edit`}>
            <Button variant="ghost" size="icon" className="text-amber-600">
              <Edit className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Photo Card */}
        <Card className="border-2 border-amber-200 overflow-hidden">
          <div className={`h-48 bg-gradient-to-br ${gradient} flex items-center justify-center text-8xl`}>
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              emoji
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
                <p className="text-muted-foreground">{pet.breed || pet.species}</p>
              </div>
              {pet.gender && (
                <Badge className="bg-amber-100 text-amber-700 text-sm">
                  {pet.gender === 'male' ? '👦 Boy' : '👧 Girl'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {pet.birth_date && (
            <Card className="border-2 border-orange-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">🎂</div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-semibold text-gray-900">{ageText}</p>
              </CardContent>
            </Card>
          )}
          {pet.weight && (
            <Card className="border-2 border-blue-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">⚖️</div>
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-semibold text-gray-900">{pet.weight} kg</p>
              </CardContent>
            </Card>
          )}
          {pet.color && (
            <Card className="border-2 border-pink-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">🎨</div>
                <p className="text-xs text-muted-foreground">Color</p>
                <p className="font-semibold text-gray-900">{pet.color}</p>
              </CardContent>
            </Card>
          )}
          <Card className="border-2 border-green-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">{emoji}</div>
              <p className="text-xs text-muted-foreground">Species</p>
              <p className="font-semibold text-gray-900 capitalize">{pet.species}</p>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {pet.notes && (
          <Card className="border-2 border-amber-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>📝</span> Notes
              </h3>
              <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg">{pet.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link href={`/bookings/new?petId=${pet.id}`} className="block">
            <Button className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-base">
              📅 Book a Service for {pet.name}
            </Button>
          </Link>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Pet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {pet.name}? 🥺</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete {pet.name}
                  &apos;s profile and remove it from your account.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deletePet.isPending}
                >
                  {deletePet.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
