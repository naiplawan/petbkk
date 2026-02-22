'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  PawPrint,
  Sparkles,
  Shield,
  Clock,
  Heart,
  ArrowRight,
  Star,
} from 'lucide-react';

const services = [
  { emoji: '🏥', name: 'Veterinary', desc: 'Health checkups & care' },
  { emoji: '✂️', name: 'Grooming', desc: 'Bath, cut & style' },
  { emoji: '🏨', name: 'Boarding', desc: 'Day & night stay' },
  { emoji: '🎓', name: 'Training', desc: 'Behavior & skills' },
];

const whyChoose = [
  {
    icon: Shield,
    title: 'Verified Providers',
    desc: 'All providers are vetted and reviewed',
  },
  {
    icon: Clock,
    title: 'Book 24/7',
    desc: 'Schedule appointments anytime, anywhere',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    desc: 'Created by pet parents, for pet parents',
  },
];

const testimonials = [
  {
    name: 'Somchai',
    pet: 'Golden Retriever 🐕',
    text: 'Found an amazing vet near my condo. So convenient!',
  },
  {
    name: 'Nittaya',
    pet: 'Persian Cat 🐈',
    text: 'My cat looks beautiful after grooming!',
  },
  {
    name: 'Michael',
    pet: 'French Bulldog 🐶',
    text: 'Best app for pet owners in Bangkok!',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-lg">
              🐾
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              PetBKK
            </span>
          </div>
          <Link href="/auth">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full px-6">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Bangkok&apos;s Favorite Pet App
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Trusted Care for
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Your Furry Friends
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book vet visits, grooming, boarding & training for your pets.
            <br className="hidden md:block" />
            All in one place, all across Bangkok 🇹🇭
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button
                size="lg"
                className="text-lg px-8 h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full"
              >
                Find Services Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>4.8/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>500+ Verified Providers</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>10,000+ Happy Pets</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pet Banner */}
      <section className="py-8 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 overflow-hidden">
        <div className="flex justify-center gap-8 animate-scroll">
          {['🐕', '🐈', '🐕‍🦺', '🐩', '🐈‍⬛', '🐰', '🦜', '🐕', '🐈', '🐕‍🦺', '🐩', '🐈‍⬛'].map((emoji, i) => (
            <span key={i} className="text-5xl">
              {emoji}
            </span>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4 bg-amber-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Pet Needs 🐾
            </h2>
            <p className="text-gray-600 text-lg">
              From routine checkups to special treatments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {services.map((service, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-amber-200"
              >
                <div className="text-5xl mb-3">{service.emoji}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-500">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Super Easy to Use ✨
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                emoji: '🔍',
                title: 'Search Providers',
                desc: 'Find verified pet services near you',
              },
              {
                step: '2',
                emoji: '📋',
                title: 'Compare & Choose',
                desc: 'Check prices, reviews & availability',
              },
              {
                step: '3',
                emoji: '📅',
                title: 'Book Instantly',
                desc: 'Confirm appointment in just a few taps',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-4xl mx-auto">
                    {item.emoji}
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-semibold text-xl mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Pet Parents Love Us 💕
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {whyChoose.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Happy Pet Parents 🎉
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-100">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">&quot;{t.text}&quot;</p>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.pet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-12 text-center text-white">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Give Your Pet the Best?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of Bangkok pet parents who trust PetBKK
            </p>
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-8 h-14 rounded-full"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <p className="mt-4 text-sm opacity-75">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                🐾
              </div>
              <span className="text-xl font-bold">PetBKK</span>
            </div>

            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                About
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 PetBKK. Made with ❤️ for Bangkok pets</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
