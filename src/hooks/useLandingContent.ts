"use client";

import * as React from 'react';
import { contentService } from '@/services/content.service';
import type { LandingContent } from '@/types/landing';

export function useLandingContent() {
  const [data, setData] = React.useState<LandingContent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    contentService
      .getLandingContent(ctrl.signal)
      .then((d) => setData(d))
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  return { data, loading, error };
}

