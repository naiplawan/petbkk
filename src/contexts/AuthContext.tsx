'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types';
import { mockAuth, mockProfile } from '@/data/mock-store';

// Check if we're using mock mode (no valid Supabase config)
// For POC, we always use mock mode
const USE_MOCK = true;

interface User {
  id: string;
  phone?: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isMockMode: boolean;
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (USE_MOCK) {
      // Mock mode - use localStorage
      const mockUser = mockAuth.getUser();
      if (mockUser) {
        setUser(mockUser);
        setSession({ user: mockUser });
        const userProfile = mockProfile.get(mockUser.id);
        setProfile(userProfile);
      }
      setLoading(false);
    } else {
      // Real Supabase mode
      initSupabase();
    }
  }, []);

  const initSupabase = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setSession(session);
      setUser(session.user);
      await fetchProfile(session.user.id, supabase);
    }

    setLoading(false);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id, supabase);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  };

  const fetchProfile = async (userId: string, supabase: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const signInWithPhone = async (phone: string) => {
    if (USE_MOCK) {
      // Mock mode - just store the phone and go to OTP
      return { error: null };
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch {
      return { error: 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    if (USE_MOCK) {
      // Mock mode - accept any 6-digit OTP
      if (otp.length !== 6) {
        return { error: 'Please enter a 6-digit code' };
      }

      const mockUser = mockAuth.signIn(phone);
      setUser(mockUser);
      setSession({ user: mockUser });
      const userProfile = mockProfile.get(mockUser.id);
      setProfile(userProfile);

      return { error: null };
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch {
      return { error: 'Failed to verify OTP' };
    }
  };

  const signOut = async () => {
    if (USE_MOCK) {
      mockAuth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      router.push('/auth');
      return;
    }

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isMockMode: USE_MOCK,
        signInWithPhone,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
