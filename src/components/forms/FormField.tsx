import * as React from 'react';
import { useField } from 'formik';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  helperText?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, label, helperText, className, ...props }, ref) => {
    const [field, meta] = useField(name);
    const hasError = meta.touched && meta.error;

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={name}>{label}</Label>}
        <Input
          {...field}
          {...props}
          id={name}
          ref={ref}
          className={cn(
            hasError && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined
          }
        />
        {hasError && (
          <p
            id={`${name}-error`}
            className="text-sm font-medium text-destructive"
          >
            {meta.error}
          </p>
        )}
        {helperText && !hasError && (
          <p id={`${name}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
