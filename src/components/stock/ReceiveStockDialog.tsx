'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { stockService } from '@/services/stockService';
import { lookupService } from '@/services/lookupService';
import type { BulkReceiveStockDto, ReceiveStockItemDto } from '@/types/stock';
import type { LocationLookup, WarehouseLookup, VariantLookup } from '@/types/lookups';

const receiveItemSchema = z.object({
  variantId: z.string().min(1, 'Variant is required'),
  variantSku: z.string().optional(), // For display purposes
  toLocationId: z.string().min(1, 'Location is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  reason: z.string().optional(),
});

const receiveStockSchema = z.object({
  items: z.array(receiveItemSchema).min(1, 'At least one item is required'),
  commonReason: z.string().optional(),
});

type ReceiveStockFormData = z.infer<typeof receiveStockSchema>;

interface ReceiveStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultVariantId?: string;
  defaultLocationId?: string;
}

export default function ReceiveStockDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultVariantId,
  defaultLocationId,
}: ReceiveStockDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [warehouses, setWarehouses] = useState<WarehouseLookup[]>([]);
  const [locations, setLocations] = useState<LocationLookup[]>([]);
  const [variants, setVariants] = useState<VariantLookup[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ReceiveStockFormData>({
    resolver: zodResolver(receiveStockSchema),
    defaultValues: {
      items: [
        {
          variantId: defaultVariantId || '',
          variantSku: '',
          toLocationId: defaultLocationId || '',
          quantity: 1,
          reason: '',
        },
      ],
      commonReason: '',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Load warehouses, locations, and variants on mount
  useEffect(() => {
    if (open) {
      loadWarehouses();
      loadLocations();
      loadVariants();
    }
  }, [open]);

  const loadWarehouses = async () => {
    try {
      const data = await lookupService.getWarehouses();
      setWarehouses(data);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const loadLocations = async (warehouseId?: string) => {
    setLoadingLocations(true);
    try {
      const data = await lookupService.getLocations(warehouseId);
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadVariants = async (search?: string) => {
    setLoadingVariants(true);
    try {
      const data = await lookupService.getVariants(search);
      setVariants(data);
    } catch (err) {
      console.error('Failed to load variants:', err);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleAddRow = () => {
    append({
      variantId: '',
      variantSku: '',
      toLocationId: '',
      quantity: 1,
      reason: '',
    });
  };

  const handleRemoveRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(row => row.trim()).filter(row => row);

        // Skip header row if present
        const dataRows = rows[0].toLowerCase().includes('variant') || rows[0].toLowerCase().includes('sku')
          ? rows.slice(1)
          : rows;

        const parsedItems = dataRows.map((row, index) => {
          const columns = row.split(',').map(col => col.trim());

          // Expected format: variantId,locationId,quantity,reason(optional)
          // or: sku,locationId,quantity,reason(optional)
          if (columns.length < 3) {
            throw new Error(`Row ${index + 2}: Must have at least 3 columns (variantId, locationId, quantity)`);
          }

          const quantity = parseInt(columns[2], 10);
          if (isNaN(quantity) || quantity < 1) {
            throw new Error(`Row ${index + 2}: Invalid quantity "${columns[2]}"`);
          }

          return {
            variantId: columns[0],
            variantSku: '',
            toLocationId: columns[1],
            quantity,
            reason: columns[3] || '',
          };
        });

        if (parsedItems.length === 0) {
          throw new Error('No valid data rows found in CSV');
        }

        // Replace all items with parsed CSV data
        replace(parsedItems);
        setCsvError(null);
      } catch (err: any) {
        setCsvError(err.message || 'Failed to parse CSV file');
        console.error('CSV parse error:', err);
      }
    };

    reader.onerror = () => {
      setCsvError('Failed to read file');
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ReceiveStockFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: BulkReceiveStockDto = {
        items: data.items.map((item) => ({
          variantId: item.variantId,
          toLocationId: item.toLocationId,
          quantity: item.quantity,
          reason: item.reason,
        })),
        commonReason: data.commonReason,
      };

      await stockService.bulkReceiveStock(payload);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        form.reset();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to receive stock');
    } finally {
      setLoading(false);
    }
  };

  // Group locations by warehouse for better UX
  const locationsByWarehouse = locations.reduce(
    (acc, location) => {
      const warehouseName =
        warehouses.find((w) => w.id === location.warehouseId)?.name || 'Unknown Warehouse';
      if (!acc[warehouseName]) {
        acc[warehouseName] = [];
      }
      acc[warehouseName].push(location);
      return acc;
    },
    {} as Record<string, LocationLookup[]>
  );

  // Convert variants to combobox options
  const variantOptions = variants.map((v) => ({
    value: v.id,
    label: `${v.sku}${v.barcode ? ` (${v.barcode})` : ''}`,
    description: v.productName,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive Stock</DialogTitle>
          <DialogDescription>
            Add variants manually or import from CSV. Format: variantId, locationId, quantity, reason (optional)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">Items to Receive ({fields.length})</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Import CSV
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRow}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />

            {/* CSV Error */}
            {csvError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{csvError}</AlertDescription>
              </Alert>
            )}

            {/* Dynamic Items */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-3 p-4 border rounded-lg bg-muted/30"
                >
                  {/* Variant Autocomplete */}
                  <div className="col-span-12 sm:col-span-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.variantId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variant</FormLabel>
                          <FormControl>
                            <Combobox
                              options={variantOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Search variant..."
                              searchPlaceholder="Search by SKU, barcode..."
                              emptyText="No variants found"
                              disabled={loading}
                              onSearch={loadVariants}
                              loading={loadingVariants}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Location Selector */}
                  <div className="col-span-12 sm:col-span-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.toLocationId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={loading || loadingLocations}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(locationsByWarehouse).map(([warehouseName, locs]) => (
                                <div key={warehouseName}>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    {warehouseName}
                                  </div>
                                  {locs.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id}>
                                      {loc.code} - {loc.name}
                                      {loc.type && ` (${loc.type})`}
                                    </SelectItem>
                                  ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-12 sm:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                          <Input
                            type="number"
                            min="1"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                field.onChange('');
                                return;
                              }
                              const parsed = parseInt(val, 10);
                              field.onChange(Number.isNaN(parsed) ? '' : parsed);
                            }}
                            disabled={loading}
                          />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Reason */}
                  <div className="col-span-12 sm:col-span-1">
                    <FormField
                      control={form.control}
                      name={`items.${index}.reason`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note</FormLabel>
                          <FormControl>
                            <Input
                              placeholder=""
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-12 sm:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRow(index)}
                      disabled={loading || fields.length === 1}
                      className="h-10 w-10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Common Reason */}
            <FormField
              control={form.control}
              name="commonReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a common reason for all items (e.g., 'New shipment from supplier')"
                      {...field}
                      disabled={loading}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>Stock received successfully!</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Receive Stock
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
