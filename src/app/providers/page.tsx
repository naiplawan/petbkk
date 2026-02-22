'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Scissors,
  Home,
  ShoppingBag,
  GraduationCap,
  Heart,
  Star,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useProviders } from '@/hooks/useProviders';
import { ProviderType } from '@/types';
import Link from 'next/link';

const providerTypeInfo: Record<
  ProviderType,
  { icon: typeof Stethoscope; emoji: string; color: string; bgColor: string; label: string }
> = {
  veterinary: {
    icon: Stethoscope,
    emoji: '🏥',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Veterinary',
  },
  grooming: {
    icon: Scissors,
    emoji: '✂️',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Grooming',
  },
  boarding: {
    icon: Home,
    emoji: '🏨',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Boarding',
  },
  pet_shop: {
    icon: ShoppingBag,
    emoji: '🛒',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'Pet Shop',
  },
  training: {
    icon: GraduationCap,
    emoji: '🎓',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Training',
  },
  pet_sitting: {
    icon: Heart,
    emoji: '❤️',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Pet Sitting',
  },
};

export default function ProvidersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: providers, isLoading } = useProviders(typeFilter);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Get type filter from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type && type in providerTypeInfo) {
      setTypeFilter(type);
    }
  }, []);

  const filteredProviders = providers?.filter((provider) =>
    provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🐾</div>
          <p className="text-muted-foreground">Finding providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Services 🐾</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-amber-50 border-amber-200 focus:border-amber-400"
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
            className={`rounded-full whitespace-nowrap ${
              typeFilter === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                : 'border-amber-200'
            }`}
          >
            All Services
          </Button>
          {Object.entries(providerTypeInfo).map(([type, info]) => {
            const Icon = info.icon;
            return (
              <Button
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(type)}
                className={`rounded-full whitespace-nowrap ${
                  typeFilter === type
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    : 'border-amber-200'
                }`}
              >
                <span className="mr-1">{info.emoji}</span>
                {info.label}
              </Button>
            );
          })}
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          {filteredProviders?.length || 0} provider{filteredProviders?.length !== 1 ? 's' : ''} found
        </p>

        {/* Provider List */}
        <div className="space-y-3">
          {filteredProviders?.map((provider) => {
            const typeInfo = providerTypeInfo[provider.business_type];
            return (
              <Link key={provider.id} href={`/providers/${provider.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all border-2 border-transparent hover:border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 text-3xl">
                        {provider.logo_url ? (
                          <img
                            src={provider.logo_url}
                            alt={provider.business_name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          typeInfo.emoji
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {provider.business_name}
                          </h3>
                          {provider.is_verified && (
                            <Badge className="bg-emerald-500 text-white shrink-0">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${typeInfo.bgColor} ${typeInfo.color} mb-2`}
                        >
                          {typeInfo.emoji} {typeInfo.label}
                        </Badge>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-gray-700">
                              {provider.rating.toFixed(1)}
                            </span>
                            <span>({provider.review_count})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {provider.district}
                          </span>
                        </div>
                        {provider.services && provider.services.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {provider.services.length} service{provider.services.length > 1 ? 's' : ''} available
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

        {filteredProviders?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">No providers found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
