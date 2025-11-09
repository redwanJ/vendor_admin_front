"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { LandingCta } from '@/types/landing';
import { useLocale } from 'next-intl';
import Reveal from './Reveal';

export default function CallToAction({ data }: { data?: LandingCta }) {
  const locale = useLocale();
  if (!data) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Reveal className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 p-8 sm:p-12">
        <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-secondary/20 blur-2xl" />
        <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{data.title}</h3>
        {data.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{data.description}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {data.primary && (
            <Button asChild size="lg">
              <Link href={`/${locale}${data.primary.href}`}>{data.primary.label}</Link>
            </Button>
          )}
          {data.secondary && (
            <Button asChild size="lg" variant="outline">
              <Link href={`/${locale}${data.secondary.href}`}>{data.secondary.label}</Link>
            </Button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
