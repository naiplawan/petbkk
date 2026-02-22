'use client';

import { use } from 'react';
import { ArrowLeft, Star, MapPin, Phone, Globe, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProvider } from '@/hooks/useProviders';
import Link from 'next/link';

const serviceEmojis: Record<string, string> = {
  veterinary: '🏥',
  grooming: '✂️',
  boarding: '🏨',
  pet_shop: '🛒',
  training: '🎓',
  pet_sitting: '❤️',
};

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
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🐾</div>
          <p className="text-muted-foreground">Loading provider...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-muted-foreground mb-4">Provider not found</p>
        <Link href="/providers">
          <Button variant="outline">Go back</Button>
        </Link>
      </div>
    );
  }

  const emoji = serviceEmojis[provider.business_type] || '🐾';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/providers" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 truncate">Provider Details</h1>
          </div>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Provider Info Card */}
        <Card className="border-2 border-amber-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-500 relative">
            <div className="absolute -bottom-10 left-4">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center text-5xl border-4 border-white">
                {provider.logo_url ? (
                  <img
                    src={provider.logo_url}
                    alt={provider.business_name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  emoji
                )}
              </div>
            </div>
          </div>
          <CardContent className="pt-12 pb-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{provider.business_name}</h2>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{provider.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({provider.review_count} reviews)</span>
                </div>
              </div>
              {provider.is_verified && (
                <Badge className="bg-emerald-500 text-white shrink-0">✓ Verified</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{provider.district}, {provider.province}</span>
            </div>

            {provider.description && (
              <p className="text-sm text-gray-600 mt-3 bg-amber-50 p-3 rounded-lg">
                {provider.description}
              </p>
            )}

            {/* Contact Buttons */}
            <div className="flex gap-2 mt-4">
              <a href={`tel:${provider.phone}`} className="flex-1">
                <Button variant="outline" className="w-full border-amber-200 hover:bg-amber-50">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </a>
              {provider.website && (
                <a href={provider.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full border-amber-200 hover:bg-amber-50">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Opening Hours</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {provider.opening_hours &&
                Object.entries(provider.opening_hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{dayNames[day] || day}</span>
                    <span className="text-muted-foreground">
                      {hours ? `${hours.open} - ${hours.close}` : 'Closed'}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🛎️</span>
            <h3 className="font-semibold text-gray-900">Services</h3>
          </div>
          <div className="space-y-3">
            {provider.services?.map((service) => (
              <Card key={service.id} className="border-2 border-transparent hover:border-amber-200 transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      )}
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        {service.duration_minutes && (
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                            ⏱️ {service.duration_minutes} min
                          </span>
                        )}
                        {service.pet_types && service.pet_types.length > 0 && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            🐾 {service.pet_types.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg text-emerald-600">
                        ฿{service.price_min?.toLocaleString()}
                        {service.price_max && service.price_max !== service.price_min && (
                          <span className="text-sm font-normal"> - ฿{service.price_max.toLocaleString()}</span>
                        )}
                      </p>
                      <Link href={`/bookings/new?providerId=${provider.id}&serviceId=${service.id}`}>
                        <Button
                          size="sm"
                          className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Book Button Sticky */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 safe-area-bottom md:static md:bg-transparent md:border-0 md:p-0">
          <div className="max-w-lg mx-auto">
            <Link href="/providers">
              <Button
                variant="outline"
                className="w-full border-amber-200 hover:bg-amber-50"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Back to All Providers
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
