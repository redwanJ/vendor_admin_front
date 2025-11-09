"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/useInView';

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  once?: boolean; // reserved for future use
  animation?: string; // tailwind classes for animation
}

export default function Reveal({
  className,
  children,
  animation = 'animate-in fade-in-0 slide-in-from-bottom-2 duration-700',
  ...rest
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        'transform transition will-change-auto',
        !inView && 'opacity-0 translate-y-4',
        inView && animation,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

