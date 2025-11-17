import { z } from 'zod';

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase();

// Phone validation (Tunisian format)
export const phoneSchema = z
  .string()
  .regex(/^\+216[0-9]{8}$/, 'Phone must be in format +216XXXXXXXX');

// Date validation
export const dateSchema = z.string().or(z.date()).transform((val) => {
  if (typeof val === 'string') {
    return new Date(val);
  }
  return val;
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1')),
  limit: z.string().optional().transform((val) => {
    const parsed = parseInt(val || '20');
    return Math.min(parsed, 100); // Max 100 items per page
  }),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// UUID validation
export const uuidSchema = z.string().uuid('Invalid ID format');

// Validate Tunisia-specific data
export const tunisianPostalCodeSchema = z
  .string()
  .regex(/^[0-9]{4}$/, 'Postal code must be 4 digits');

// Blood group validation
export const bloodGroupSchema = z.enum([
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
]);

// Time format validation (HH:MM)
export const timeSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format');

// Generic validation helper
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

// Async validation helper
export const validateAsync = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> => {
  return await schema.parseAsync(data);
};
