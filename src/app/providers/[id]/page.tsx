'use client';

import { use } from 'react';
import { ArrowLeft, Star, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProvider } from '@/hooks/useProviders';
import Link from 'next/link';

const dayNames: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export default function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: provider, isLoading } = useProvider(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Provider not found</p>
        <Link href="/providers">
          <Button variant="link">Go back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link href="/providers" className="flex items-center text-muted-foreground">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="font-semibold text-sm truncate max-w-[200px]">
            {provider.business_name}
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="pb-8 max-w-lg mx-auto">
        {/* Provider Info */}
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">
                {provider.business_type === 'veterinary' && '🏥'}
                {provider.business_type === 'grooming' && '✂️'}
                {provider.business_type === 'boarding' && '🏨'}
                {provider.business_type === 'pet_shop' && '🛒'}
                {provider.business_type === 'training' && '🎓'}
                {provider.business_type === 'pet_sitting' && '❤️'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{provider.business_name}</h2>
                {provider.is_verified && (
                  <Badge className="bg-emerald-500">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{provider.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({provider.review_count} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                {provider.district}, {provider.province}
              </div>
            </div>
          </div>

          {provider.description && (
            <p className="text-sm text-muted-foreground mt-4">
              {provider.description}
            </p>
          )}

          {/* Contact */}
          <div className="flex gap-2 mt-4">
            <a href={`tel:${provider.phone}`}>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            </a>
            {provider.website && (
              <a href={provider.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-1" />
                  Website
                </Button>
              </a>
            )}
          </div>
        </div>

        <Separator />

        {/* Opening Hours */}
        <Card className="mx-4 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Opening Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {provider.opening_hours &&
                Object.entries(provider.opening_hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize">{dayNames[day] || day}</span>
                    <span className="text-muted-foreground">
                      {hours ? `${hours.open} - ${hours.close}` : 'Closed'}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <div className="p-4">
          <h3 className="font-semibold mb-3">Services</h3>
          <div className="space-y-3">
            {provider.services?.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        {service.duration_minutes && (
                          <span>{service.duration_minutes} min</span>
                        )}
                        {service.pet_types && service.pet_types.length > 0 && (
                          <span>{service.pet_types.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        ฿{service.price_min?.toLocaleString()}
                        {service.price_max && service.price_max !== service.price_min && (
                          <span> - ฿{service.price_max.toLocaleString()}</span>
                        )}
                      </p>
                      <Link href={`/bookings/new?providerId=${provider.id}&serviceId=${service.id}`}>
                        <Button size="sm" className="mt-2">
                          Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
