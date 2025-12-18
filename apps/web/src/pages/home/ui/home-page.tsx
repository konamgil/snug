'use client';

import { Header } from '@/widgets/header';
import { MobileNav } from '@/widgets/mobile-nav';

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Room in Korea</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Snug connects foreigners with trusted hosts offering comfortable, affordable rooms
            across Korea.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Browse Rooms
            </button>
            <button
              type="button"
              className="px-6 py-3 border border-input rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Become a Host
            </button>
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-2xl font-semibold mb-6">Popular Areas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Gangnam', 'Hongdae', 'Itaewon', 'Sinchon'].map((area) => (
              <div
                key={area}
                className="aspect-square rounded-xl bg-muted flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
              >
                <span className="font-medium">{area}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
