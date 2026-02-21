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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useProviders } from '@/hooks/useProviders';
import { ProviderType } from '@/types';
import Link from 'next/link';

const providerTypeIcons: Record<ProviderType, React.ElementType> = {
  veterinary: Stethoscope,
  grooming: Scissors,
  boarding: Home,
  pet_shop: ShoppingBag,
  training: GraduationCap,
  pet_sitting: Heart,
};

const providerTypeLabels: Record<ProviderType, string> = {
  veterinary: 'Veterinary',
  grooming: 'Grooming',
  boarding: 'Boarding',
  pet_shop: 'Pet Shop',
  training: 'Training',
  pet_sitting: 'Pet Sitting',
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

  const filteredProviders = providers?.filter((provider) =>
    provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <Input
        placeholder="Search by name or area..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={typeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTypeFilter('all')}
        >
          All
        </Button>
        {Object.entries(providerTypeLabels).map(([type, label]) => {
          const Icon = providerTypeIcons[type as ProviderType];
          return (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className="whitespace-nowrap"
            >
              <Icon className="h-4 w-4 mr-1" />
              {label}
            </Button>
          );
        })}
      </div>

      {/* Provider List */}
      <div className="space-y-3">
        {filteredProviders?.map((provider) => {
          const TypeIcon = providerTypeIcons[provider.business_type];
          return (
            <Link key={provider.id} href={`/providers/${provider.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {provider.logo_url ? (
                        <img
                          src={provider.logo_url}
                          alt={provider.business_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <TypeIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold truncate">
                            {provider.business_name}
                          </h3>
                          <Badge variant="secondary" className="mt-1">
                            {providerTypeLabels[provider.business_type]}
                          </Badge>
                        </div>
                        {provider.is_verified && (
                          <Badge className="bg-emerald-500">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {provider.rating.toFixed(1)} ({provider.review_count})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {provider.district}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {provider.services?.length || 0} services available
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredProviders?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No providers found
        </div>
      )}
    </div>
  );
}
