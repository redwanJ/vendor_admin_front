"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { LandingHero } from '@/types/landing';
import { LucideIcon, Zap, Shield, Globe, LayoutDashboard, Activity, Cog, BarChart3, Calendar, Users } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = { Zap, Shield, Globe, LayoutDashboard, Activity, Cog, BarChart3, Calendar, Users };

export default function Hero({ data, locale }: { data: LandingHero; locale: string }) {
  return (
    <section className="relative isolate pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4">
        {data.eyebrow && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {data.eyebrow}
          </div>
        )}

        <h1 className="text-balance bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl animate-in fade-in-0 slide-in-from-bottom-1 duration-700">
          {data.title}
        </h1>
        {data.subtitle && (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-700">
            {data.subtitle}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-700">
          {data.primaryCta && (
            <Button asChild size="lg" className="shadow-md">
              <Link href={`/${locale}${data.primaryCta.href}`}>{data.primaryCta.label}</Link>
            </Button>
          )}
          {data.secondaryCta && (
            <Button asChild size="lg" variant="outline" className="backdrop-blur">
              <Link href={`/${locale}${data.secondaryCta.href}`}>{data.secondaryCta.label}</Link>
            </Button>
          )}
        </div>

        {data.badges?.length ? (
          <div className="mt-10 grid w-full grid-cols-2 gap-3 sm:w-auto sm:auto-cols-max sm:grid-flow-col sm:grid-cols-none">
            {data.badges.map((b) => {
              const Icon = (b.icon && ICONS[b.icon]) || Zap;
              return (
                <div key={b.label} className="group inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
                  <Icon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                  {b.label}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Scroll cue */}
        <div className="mt-16 flex justify-center">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border p-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
