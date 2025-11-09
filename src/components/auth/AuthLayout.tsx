'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const features = [
  {
    title: 'Secure Platform',
    description: 'Enterprise-grade security for all your business operations',
    image: '/images/auth/secure.svg',
  },
  {
    title: 'Global Reach',
    description: 'Connect with clients worldwide through our platform',
    image: '/images/auth/global.svg',
  },
  {
    title: 'Easy Management',
    description: 'Streamline your vendor operations with powerful tools',
    image: '/images/auth/management.svg',
  },
];

export function AuthLayout({ children }: AuthLayoutProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Section - Branding & Info Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-primary/80 p-12 text-primary-foreground">
        <div>
          <h1 className="text-4xl font-bold mb-2">Menal Hub</h1>
          <p className="text-xl opacity-90">A globally trusted platform!</p>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          {/* Key Metric */}
          <div className="text-center mb-12">
            <div className="text-5xl font-bold mb-2">1,000,000+</div>
            <p className="text-xl opacity-90">Clients and counting</p>
          </div>

          {/* Carousel */}
          <div className="relative w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                {/* Placeholder for illustration - you can add SVG or image here */}
                <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                {features[currentSlide].title}
              </h3>
              <p className="text-lg opacity-90">
                {features[currentSlide].description}
              </p>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center mt-6 gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="text-primary-foreground hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Pagination Dots */}
              <div className="flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-white w-8'
                        : 'bg-white/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="text-primary-foreground hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Short Description */}
          <div className="mt-12 text-center max-w-lg">
            <p className="text-lg opacity-90">
              A well-secured online platform to manage your services, bookings, clients, and more.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center opacity-75">
          <p className="text-sm">© 2025 Menal Hub. All rights reserved.</p>
        </div>
      </div>

      {/* Right Section - Authentication Panel */}
      <div className="relative flex items-center justify-center p-8 bg-background overflow-hidden">
        {/* subtle animated blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-secondary/10 blur-3xl animate-pulse [animation-duration:4s]" />
        <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
