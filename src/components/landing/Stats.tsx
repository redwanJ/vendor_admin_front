"use client";

import type { LandingStat } from '@/types/landing';
import Reveal from './Reveal';

export default function Stats({ items }: { items: LandingStat[] }) {
  if (!items?.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pb-4">
      <div className="grid grid-cols-2 gap-4 rounded-xl border bg-card/50 p-6 backdrop-blur sm:grid-cols-4">
        {items.map((s, i) => (
          <Reveal key={s.label + i}>
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
