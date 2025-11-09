"use client";

import * as React from 'react';

export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target); // reveal once
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15, ...(options || {}) }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView } as const;
}

