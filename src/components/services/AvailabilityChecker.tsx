'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { serviceService } from '@/services/serviceService';
import type { AvailabilityResult } from '@/types/rental';

const availabilityCheckSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

type AvailabilityCheckValues = z.infer<typeof availabilityCheckSchema>;

interface AvailabilityCheckerProps {
  serviceId: string;
  serviceName: string;
  inventoryQuantity: number;
}

export default function AvailabilityChecker({
  serviceId,
  serviceName,
  inventoryQuantity,
}: AvailabilityCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const form = useForm<AvailabilityCheckValues>({
    resolver: zodResolver(availabilityCheckSchema),
    mode: 'onChange',
    defaultValues: {
      startDate: '',
      endDate: '',
      quantity: 1,
    },
  });

  const onSubmit = async (values: AvailabilityCheckValues) => {
    setChecking(true);
    setResult(null);

    try {
      const availabilityResult = await serviceService.checkAvailability(serviceId, {
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        requestedQuantity: values.quantity,
      });

      setResult(availabilityResult);
    } catch (error: any) {
      console.error('Error checking availability:', error);
      // Set an error result
      setResult({
        isAvailable: false,
        availableQuantity: 0,
        requestedQuantity: values.quantity,
        checkedStartDate: new Date(values.startDate).toISOString(),
        checkedEndDate: new Date(values.endDate).toISOString(),
        message: error.response?.data?.error || 'Failed to check availability',
        conflicts: [],
      });
    } finally {
      setChecking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Check Availability
        </CardTitle>
        <CardDescription>
          Verify if {serviceName} is available for your desired dates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={checking}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={checking}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Needed</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={inventoryQuantity}
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      disabled={checking}
                    />
                  </FormControl>
                  <FormDescription>
                    Total inventory: {inventoryQuantity} items
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={checking} className="w-full">
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Check Availability
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Results */}
        {result && (
          <div className="space-y-4 mt-6">
            {result.isAvailable ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Available!</AlertTitle>
                <AlertDescription className="text-green-700">
                  {result.message}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Not Available</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            {/* Availability Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Availability Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-medium">
                    {formatDate(result.checkedStartDate)} - {formatDate(result.checkedEndDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requested:</span>
                  <span className="font-medium">{result.requestedQuantity} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available:</span>
                  <span className={`font-medium ${result.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {result.availableQuantity} items
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Conflicts */}
            {result.conflicts && result.conflicts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Conflicting Reservations ({result.conflicts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.conflicts.map((conflict, index) => (
                      <div
                        key={conflict.reservationId}
                        className="p-3 bg-muted rounded-lg space-y-1 text-sm"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium">Reservation #{index + 1}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            conflict.status === 'Confirmed'
                              ? 'bg-green-100 text-green-700'
                              : conflict.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {conflict.status}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {formatDate(conflict.startDate)} - {formatDate(conflict.endDate)}
                        </div>
                        <div className="text-muted-foreground">
                          Quantity: {conflict.quantityReserved} items
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
