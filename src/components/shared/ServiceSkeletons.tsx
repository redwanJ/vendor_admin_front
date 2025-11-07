import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton loader for service list table rows
 * Matches the DataTable structure
 */
export function ServiceListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Search and filters skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-[300px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table header */}
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-4" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[100px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[80px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[80px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[70px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[80px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[60px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[100px]" />
                </th>
                <th className="h-12 px-4 w-12"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {Array.from({ length: count }).map((_, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-4" />
                  </td>
                  <td className="p-4 align-middle">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-[180px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-[80px]" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-[70px]" />
                  </td>
                  <td className="p-4 align-middle">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-[90px]" />
                      <Skeleton className="h-3 w-[70px]" />
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-6 w-[80px] rounded-full" />
                  </td>
                  <td className="p-4 align-middle text-center">
                    <Skeleton className="h-4 w-6 mx-auto" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-[80px]" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-8 w-8 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[200px]" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-10 w-[120px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for service detail page
 */
export function ServiceDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <Skeleton className="w-full h-48 rounded-t-lg" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for service edit/create form
 */
export function ServiceFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for dashboard cards
 */
export function DashboardCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for API keys list table
 * Includes checkbox column for bulk actions
 */
export function ApiKeyListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table header */}
            <thead>
              <tr className="border-b bg-muted/50">
                {/* Checkbox column */}
                <th className="h-12 px-4 w-12 text-left align-middle">
                  <Skeleton className="h-4 w-4" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[80px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[90px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[50px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[60px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[100px]" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-[70px]" />
                </th>
                <th className="h-12 px-4 w-12"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {Array.from({ length: count }).map((_, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                  {/* Checkbox column */}
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-4" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-[140px]" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-[100px]" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-6 w-[70px] rounded-full" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-6 w-[60px] rounded-full" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-[80px]" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-[80px]" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-8 w-8 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
