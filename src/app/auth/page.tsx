'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signInWithPhone, verifyOtp } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate phone format (Thai phone number)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid Thai phone number (e.g., 0812345678)');
      setLoading(false);
      return;
    }

    const { error } = await signInWithPhone(`+66${phone.slice(1)}`);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    setStep('otp');
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      setLoading(false);
      return;
    }

    const { error } = await verifyOtp(`+66${phone.slice(1)}`, otp);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
            🐾
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            PetBKK
          </h1>
          <p className="text-muted-foreground mt-2">Bangkok&apos;s favorite pet services app 🐕🐈</p>
        </div>

        <Card className="border-2 border-amber-200 shadow-xl">
          <CardContent className="p-6">
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">👋</div>
                  <h2 className="text-xl font-semibold text-gray-900">Welcome!</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your phone number to get started
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 border-2 border-r-0 border-amber-200 rounded-l-lg bg-amber-50 text-amber-700 font-medium text-sm">
                      🇹🇭 +66
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="812345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="rounded-l-none border-2 border-amber-200 focus:border-amber-400 h-12"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>📱</span>
                    We&apos;ll send you a verification code
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Code <span>→</span>
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🔐</div>
                  <h2 className="text-xl font-semibold text-gray-900">Enter verification code</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sent to +66{phone.slice(1)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-700">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest h-14 border-2 border-amber-200 focus:border-amber-400"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify <span>✓</span>
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  onClick={() => setStep('phone')}
                >
                  ← Change phone number
                </Button>
              </form>
            )}

            {/* Demo Notice */}
            <div className="mt-6 pt-4 border-t border-amber-100">
              <p className="text-xs text-center text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                🔧 For POC testing: Use any 6-digit code
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
