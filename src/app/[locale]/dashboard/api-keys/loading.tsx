import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-48 bg-muted animate-pulse rounded-md mb-2"></div>
          <div className="h-5 w-96 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="h-10 w-36 bg-muted animate-pulse rounded-md"></div>
      </div>

      <ApiKeyListSkeleton count={10} />
    </div>
  );
}
