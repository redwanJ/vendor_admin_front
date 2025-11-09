"use client";

import type { LandingTestimonial } from '@/types/landing';
import { Card, CardContent } from '@/components/ui/card';
import Reveal from './Reveal';

export default function Testimonials({ items }: { items?: LandingTestimonial[] }) {
  if (!items?.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Reveal className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Loved by vendors</h2>
        <p className="mt-2 text-muted-foreground">What our community says about Menal Hub.</p>
      </Reveal>
      <div className="relative">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={i}>
              <Card className="border transition hover:shadow-md">
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed">“{t.quote}”</p>
                  <div className="mt-4 text-sm font-medium">{t.author}</div>
                  {t.role && <div className="text-xs text-muted-foreground">{t.role}</div>}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
