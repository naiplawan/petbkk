'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, PawPrint, CalendarDays, LogOut, Settings, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { mockProfile } from '@/data/mock-store';
import { useUserStats } from '@/hooks/useBookings';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut, isMockMode } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const { data: stats } = useUserStats();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      if (isMockMode) {
        mockProfile.update(user.id, { display_name: displayName });
      } else {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { error } = await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', user.id);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🐾</div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile 👤</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Profile Card */}
        <Card className="border-2 border-amber-200 overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardContent className="pt-0 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              <Avatar className="h-20 w-20 border-4 border-white bg-white">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 text-xl">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.display_name || 'Pet Parent'}
                </h2>
                <p className="text-sm text-muted-foreground">{profile?.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-2 border-orange-200">
            <CardContent className="pt-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2 text-2xl">
                🐾
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.petCount || 0}</p>
              <p className="text-sm text-muted-foreground">Pets</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-sky-100 rounded-xl flex items-center justify-center mx-auto mb-2 text-2xl">
                📅
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.bookingCount || 0}</p>
              <p className="text-sm text-muted-foreground">Bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-500" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="bg-amber-50/50 border-amber-200"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link
              href="/pets"
              className="flex items-center gap-3 p-3 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                🐾
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">My Pets</p>
                <p className="text-sm text-muted-foreground">Manage your fur babies</p>
              </div>
            </Link>
            <Link
              href="/bookings"
              className="flex items-center gap-3 p-3 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                📅
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">My Bookings</p>
                <p className="text-sm text-muted-foreground">View appointments</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              About PetBKK
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span>🐾</span>
              <span>Find and book trusted pet services in Bangkok</span>
            </p>
            <p className="flex items-center gap-2">
              <span>📱</span>
              <span>Version: 0.1.0 (POC)</span>
            </p>
            {isMockMode && (
              <p className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
                <span>⚠️</span>
                <span>Running in demo mode (localStorage)</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </main>
    </div>
  );
}
