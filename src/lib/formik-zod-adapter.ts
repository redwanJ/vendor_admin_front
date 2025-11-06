import { z } from 'zod';
import type { FormikErrors } from 'formik';

/**
 * Converts Zod validation errors to Formik error format
 */
export function toFormikValidationSchema<T>(
  schema: z.ZodSchema<T>
): (values: T) => FormikErrors<T> {
  return (values: T) => {
    try {
      schema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: FormikErrors<T> = {};

        error.issues.forEach((err: z.ZodIssue) => {
          const path = err.path.join('.');
          if (path) {
            // Type assertion needed here due to Formik's error structure
            (errors as Record<string, string>)[path] = err.message;
          }
        });

        return errors;
      }
      return {};
    }
  };
}

/**
 * Async version for async Zod schemas
 */
export async function toFormikValidationSchemaAsync<T>(
  schema: z.ZodSchema<T>,
  values: T
): Promise<FormikErrors<T>> {
  try {
    await schema.parseAsync(values);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: FormikErrors<T> = {};

      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join('.');
        if (path) {
          (errors as Record<string, string>)[path] = err.message;
        }
      });

      return errors;
    }
    return {};
  }
}
