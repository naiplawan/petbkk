'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Dog, Cat, Bird, Fish, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const petIcons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Fish,
  other: PawPrint,
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Pet not found</p>
        <Link href="/pets">
          <Button variant="link">Go back</Button>
        </Link>
      </div>
    );
  }

  const PetIcon = petIcons[pet.species] || PawPrint;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link href="/pets" className="flex items-center text-muted-foreground">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="font-semibold">{pet.name}</h1>
          <Link href={`/pets/${pet.id}/edit`}>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="pb-8 max-w-lg mx-auto">
        {/* Photo */}
        <div className="w-full h-64 bg-muted flex items-center justify-center">
          {pet.photo_url ? (
            <img
              src={pet.photo_url}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <PetIcon className="h-20 w-20 text-muted-foreground" />
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">{pet.name}</h2>
              <p className="text-muted-foreground">{pet.breed || pet.species}</p>
            </div>
            {pet.gender && (
              <Badge variant="secondary" className="ml-auto">
                {pet.gender === 'male' ? 'Male' : 'Female'}
              </Badge>
            )}
          </div>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pet.birth_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Birth Date</span>
                  <span>
                    {new Date(pet.birth_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {pet.weight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span>{pet.weight} kg</span>
                </div>
              )}
              {pet.color && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color</span>
                  <span>{pet.color}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Species</span>
                <span className="capitalize">{pet.species}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {pet.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{pet.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Book Service Button */}
          <Link href={`/bookings/new?petId=${pet.id}`} className="block">
            <Button className="w-full">Book a Service for {pet.name}</Button>
          </Link>

          {/* Delete */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Pet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {pet.name}?</DialogTitle>
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
