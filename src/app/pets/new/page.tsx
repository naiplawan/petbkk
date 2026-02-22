'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Camera, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/hooks/usePets';
import Link from 'next/link';

const petSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  breed: z.string().optional(),
  gender: z.enum(['male', 'female']).optional().nullable(),
  birth_date: z.string().optional().nullable(),
  weight: z.number().optional().nullable(),
  color: z.string().optional(),
  notes: z.string().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

const petOptions: Array<{ value: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'; label: string; emoji: string }> = [
  { value: 'dog', label: 'Dog', emoji: '🐕' },
  { value: 'cat', label: 'Cat', emoji: '🐈' },
  { value: 'bird', label: 'Bird', emoji: '🐦' },
  { value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
  { value: 'other', label: 'Other', emoji: '🐾' },
];

export default function NewPetPage() {
  const { user, isMockMode } = useAuth();
  const router = useRouter();
  const { createPet } = usePets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      species: 'dog',
    },
  });

  const species = watch('species');

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // In mock mode, use a placeholder or base64
    if (isMockMode) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      return;
    }

    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('pet-photos').getPublicUrl(fileName);

      setPhotoUrl(publicUrl);
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PetFormData) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await createPet.mutateAsync({
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        gender: data.gender || null,
        birth_date: data.birth_date || null,
        weight: data.weight || null,
        color: data.color || null,
        notes: data.notes || null,
        photo_url: photoUrl,
      });

      router.push('/pets');
    } catch (err) {
      setError('Failed to add pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/pets" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">Add New Pet 🐾</h1>
          </div>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Photo Upload */}
          <Card className="border-2 border-amber-200">
            <CardContent className="p-6">
              <div className="flex justify-center">
                <label className="relative cursor-pointer group">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden border-4 border-dashed border-amber-300 group-hover:border-amber-400 transition-all">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Pet"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-10 w-10 text-amber-500" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white">
                    +
                  </div>
                </label>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Tap to add a photo
              </p>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="border-2 border-amber-200">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📋</span>
                <h3 className="font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Pet Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Buddy"
                  className="bg-amber-50 border-amber-200"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Species *</Label>
                <div className="grid grid-cols-5 gap-2">
                  {petOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('species', option.value)}
                      className={`p-2 rounded-xl border-2 transition-all ${
                        species === option.value
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-amber-100 hover:border-amber-200'
                      }`}
                    >
                      <div className="text-2xl">{option.emoji}</div>
                      <div className="text-xs mt-1">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed" className="text-gray-700">Breed</Label>
                <Input
                  id="breed"
                  {...register('breed')}
                  placeholder="e.g., Golden Retriever"
                  className="bg-amber-50 border-amber-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-gray-700">Gender</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue('gender', value as 'male' | 'female')
                    }
                  >
                    <SelectTrigger className="bg-amber-50 border-amber-200">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">👦 Male</SelectItem>
                      <SelectItem value="female">👧 Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-gray-700">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    {...register('weight', { valueAsNumber: true })}
                    placeholder="e.g., 5.5"
                    className="bg-amber-50 border-amber-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color" className="text-gray-700">Color</Label>
                <Input
                  id="color"
                  {...register('color')}
                  placeholder="e.g., Golden"
                  className="bg-amber-50 border-amber-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date" className="text-gray-700">Birth Date</Label>
                <Input
                  id="birth_date"
                  type="date"
                  {...register('birth_date')}
                  className="bg-amber-50 border-amber-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-2 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span>📝</span>
                <Label className="text-gray-900 font-medium">Additional Notes</Label>
              </div>
              <Textarea
                {...register('notes')}
                placeholder="Any special notes about your pet..."
                rows={3}
                className="bg-amber-50 border-amber-200"
              />
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-base"
            disabled={loading || createPet.isPending}
          >
            {loading || createPet.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Add Pet <span>🐾</span>
              </span>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
