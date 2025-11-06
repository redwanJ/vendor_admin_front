import { z } from 'zod';

// Common validation patterns
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const urlSchema = z.string().url('Invalid URL format');

export const imageSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 5000000, {
    message: 'Image must be less than 5MB',
  }),
  url: z.string().url().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Date range schema
export const dateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type DateRange = z.infer<typeof dateRangeSchema>;
