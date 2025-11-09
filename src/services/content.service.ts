import type { LandingContent } from '@/types/landing';

class ContentService {
  async getLandingContent(signal?: AbortSignal): Promise<LandingContent> {
    const res = await fetch('/content/landing.json', { cache: 'no-store', signal });
    if (!res.ok) throw new Error('Failed to load landing content');
    return (await res.json()) as LandingContent;
  }
}

export const contentService = new ContentService();

