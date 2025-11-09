"use client";

import { Skeleton } from '@/components/ui/skeleton';

export default function LandingSkeleton() {
  return (
    <div className="relative">
      <section className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="space-y-4">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-2/3" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-6">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="grid grid-cols-2 gap-4 rounded-xl border p-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="mx-auto h-8 w-20" />
              <Skeleton className="mx-auto mt-2 h-4 w-24" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

