# Service Management System - Implementation Guide

## Overview

A complete service management system for vendor admin with reusable components, full CRUD operations, and advanced features.

## Features Implemented

### 1. Reusable DataTable Component ✅
**Location**: `src/components/shared/DataTable.tsx`

Features:
- **Pagination**: Page size selection (10, 20, 50, 100), page navigation
- **Search**: Real-time search with clear button
- **Filtering**: Multiple filter types (select, text)
- **Selection**: Row selection with select all, indeterminate state
- **Bulk Actions**: Multiple actions on selected items
- **Sorting**: Column-based sorting (ascending/descending)
- **Loading State**: Shows loading indicator
- **Empty State**: Customizable empty message
- **Row Actions**: Dropdown menu for each row (View, Edit, Delete)

### 2. Service List Page ✅
**Location**: `src/app/[locale]/dashboard/services/page.tsx`

Features:
- Service listing with pagination
- Search by service name
- Filter by:
  - Status (Draft, Active, Inactive, Archived)
  - Service Type
  - Category
- Sort by:
  - Name
  - Base Price
  - Status
  - Last Updated
- Bulk delete services
- Create new service button
- Status badges with color coding

### 3. Service Creation Page ✅
**Location**: `src/app/[locale]/dashboard/services/new/page.tsx`

Features organized in tabs:

#### Basic Info Tab
- Service Type selection (required)
- Category selection (optional)
- Service Name (required)
- Short Description (max 500 chars)
- Full Description (max 5000 chars)
- Featured toggle

#### Pricing Tab
- Base Price (required)
- Currency (ETB, USD, EUR)
- Pricing Model (FixedPrice, PerPerson, PerHour, PerDay, Custom)
- Min/Max Price (optional)

#### Capacity & Timing Tab
- Min/Max Capacity
- Service Duration (minutes)
- Setup/Teardown Time (minutes)
- Lead Time (days)
- Max Advance Booking (days)

#### SEO Tab
- Meta Title
- Meta Description

Form Validation:
- All required fields validated
- Min/Max price validation
- Capacity range validation
- Character limits enforced

### 4. Type System ✅
**Location**: `src/types/service.ts`

Comprehensive TypeScript types:
- `ServiceListDto` - For list views
- `ServiceDto` - Full service details
- `CreateServiceDto` - Service creation
- `UpdateServiceDto` - Service updates
- `ServiceFilters` - Filter parameters
- `PagedResult<T>` - Paginated responses
- Enums: `PricingModel`, `ServiceStatus`

### 5. API Client ✅
**Locations**:
- `src/services/serviceService.ts` - Service operations
- `src/services/lookupService.ts` - Lookup data

Service Methods:
- `getServices(filters)` - Paginated list
- `getServiceById(id)` - Single service
- `createService(data)` - Create new
- `updateService(id, data)` - Update existing
- `deleteService(id)` - Soft delete
- `bulkDeleteServices(ids)` - Bulk delete

Lookup Methods:
- `getServiceTypes(search)` - Service type options
- `getCategories(search)` - Category options

## Backend Changes

### Entity Constructor Fixes ✅
Fixed parameterless constructors for EF Core materialization:
- `Category.cs` - Line 21
- `ServiceType.cs` - Line 46
- `Service.cs` - Line 48
- `Package.cs` - Line 31

### Tenant Middleware Update ✅
**Location**: `src/MenalHub.Infrastructure/Middleware/TenantResolutionMiddleware.cs`

Added `/api/lookups` to exemption list (line 176) so lookups work without tenant context.

### Lookup Controller ✅
**Location**: `src/MenalHub.Api/Controllers/LookupsController.cs`

Endpoints:
- `GET /api/lookups/categories` - No permission required
- `GET /api/lookups/service-types` - No permission required
- `GET /api/lookups/tenants` - Requires `tenants.read` permission

### Vendor Services Controller ✅
**Location**: `src/MenalHub.Api/Controllers/VendorServicesController.cs`

All endpoints use **string values** for enums (as requested):
- Status filter accepts: "Draft", "Active", "Inactive", "Archived"
- Pricing model accepts: "FixedPrice", "PerPerson", "PerHour", "PerDay", "Custom"

## Navigation Updated ✅

**Location**: `src/components/layout/Sidebar.tsx`

Services link updated to point to `/dashboard/services` (line 51)

## Usage

### 1. Start the API Server
```bash
cd src/MenalHub.Api
dotnet run
```

### 2. Start the Frontend
```bash
cd vendor_admin_front
npm run dev
```

### 3. Access Services
Navigate to: `http://localhost:3002/en/dashboard/services`

## Component Reusability

The `DataTable` component can be reused for any entity:

```typescript
<DataTable
  data={items}
  columns={columns}
  keyExtractor={(item) => item.id}
  currentPage={page}
  totalPages={totalPages}
  pageSize={pageSize}
  totalCount={totalCount}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  searchable
  onSearch={handleSearch}
  filters={filters}
  onFilterChange={handleFilterChange}
  selectable
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  bulkActions={bulkActions}
  sortBy={sortBy}
  sortDescending={sortDescending}
  onSort={handleSort}
  loading={loading}
/>
```

## API Integration

### Enum String Values

The backend accepts string values for enums:

**Pricing Models**:
- `"FixedPrice"` - One-time fixed price
- `"PerPerson"` - Price per person
- `"PerHour"` - Hourly rate
- `"PerDay"` - Daily rate
- `"Custom"` - Custom pricing

**Service Status**:
- `"Draft"` - Not published
- `"Active"` - Live and bookable
- `"Inactive"` - Hidden but not deleted
- `"Archived"` - Soft deleted

### Example API Request

```typescript
const service: CreateServiceDto = {
  serviceTypeId: "abc-123",
  name: "Wedding Photography",
  basePrice: 50000,
  currency: "ETB",
  pricingModel: "FixedPrice",  // String, not enum
  shortDescription: "Professional wedding photography",
  leadTimeDays: 7,
  isFeatured: false
};

await serviceService.createService(service);
```

## Next Steps

1. **Service Edit Page** - Create update functionality
2. **Service Detail Page** - View full service details
3. **Image Upload** - Add image upload for service photos
4. **Availability Calendar** - Manage service availability
5. **Duplicate Service** - Clone existing services
6. **Export Services** - Export to CSV/Excel

## File Structure

```
vendor_admin_front/
├── src/
│   ├── app/[locale]/dashboard/services/
│   │   ├── page.tsx              # Service list
│   │   └── new/
│   │       └── page.tsx          # Create service
│   ├── components/
│   │   ├── shared/
│   │   │   └── DataTable.tsx     # Reusable table
│   │   ├── ui/
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── switch.tsx
│   │   └── layout/
│   │       └── Sidebar.tsx       # Navigation
│   ├── services/
│   │   ├── serviceService.ts     # Service API
│   │   └── lookupService.ts      # Lookup API
│   └── types/
│       └── service.ts            # TypeScript types
```

## Testing Checklist

- [ ] List services with pagination
- [ ] Search services by name
- [ ] Filter by status
- [ ] Filter by service type
- [ ] Filter by category
- [ ] Sort by different columns
- [ ] Select individual services
- [ ] Select all services
- [ ] Bulk delete services
- [ ] Create new service
- [ ] Form validation works
- [ ] Required fields enforced
- [ ] Tab navigation works
- [ ] Cancel button returns to list
- [ ] Success toast shows on create
- [ ] Error toast shows on failure
- [ ] Navigation link works

## Notes

- All enum values are passed as **strings** to the API
- Lookups (categories, service types) don't require tenant context
- Services are automatically scoped to the authenticated user's tenant
- Bulk actions can be extended easily (publish, archive, etc.)
- DataTable is fully generic and can be used for any entity type
