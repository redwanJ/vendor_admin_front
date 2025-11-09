"use client";

import type { LandingFeature } from '@/types/landing';
import { Card, CardContent } from '@/components/ui/card';
import Reveal from './Reveal';
import { LucideIcon, LayoutDashboard, Activity, Cog, BarChart3, Shield, Zap, Calendar, Users } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = { LayoutDashboard, Activity, Cog, BarChart3, Shield, Zap, Calendar, Users };

function FeatureCard({ title, description, icon }: LandingFeature) {
  const Icon = (icon && ICONS[icon]) || Zap;
  return (
    <Card className="group relative h-full overflow-hidden border transition hover:shadow-xl hover:-translate-y-1 animate-in fade-in-0 zoom-in-50 duration-500">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
      <CardContent className="relative p-6">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Features({ items }: { items: LandingFeature[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Reveal className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything vendors need</h2>
          <p className="mt-2 text-muted-foreground">Powerful capabilities to run your business.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => (
          <Reveal key={f.title + i}>
            <FeatureCard {...f} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
