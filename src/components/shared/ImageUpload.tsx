'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadService } from '@/lib/upload.service';
import type { UploadDto, UploadContext } from '@/types/upload';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  context: UploadContext;
  value?: string; // Image URL
  uploadId?: string; // Upload ID for deletion
  onChange?: (imageUrl: string, uploadId: string) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in bytes
  aspectRatio?: string; // e.g., "16/9", "1/1"
  className?: string;
}

export default function ImageUpload({
  context,
  value,
  uploadId,
  onChange,
  onError,
  maxSize = 5 * 1024 * 1024, // 5MB default
  aspectRatio,
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        const message = 'Please select an image file';
        onError?.(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        const message = `Image exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
        onError?.(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        return;
      }

      try {
        setIsUploading(true);
        setProgress(0);

        const uploads = await uploadService.uploadFiles([file], context, (p) => {
          setProgress(p);
        });

        const upload = uploads[0];
        onChange?.(upload.fileUrl, upload.id);

        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        });
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error || error?.message || 'Upload failed';

        onError?.(errorMessage);
        toast({
          title: 'Upload Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [context, maxSize, onChange, onError, toast]
  );

  const handleRemove = useCallback(async () => {
    if (!uploadId) {
      onChange?.('', '');
      return;
    }

    try {
      await uploadService.deleteUpload(uploadId);
      onChange?.('', '');
      toast({
        title: 'Success',
        description: 'Image removed successfully',
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || error?.message || 'Delete failed';
      toast({
        title: 'Delete Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [uploadId, onChange, toast]);

  return (
    <div className={className}>
      {value ? (
        <div className="relative group">
          <div
            className="relative overflow-hidden rounded-lg border bg-muted"
            style={aspectRatio ? { aspectRatio } : undefined}
          >
            <img
              src={value}
              alt="Uploaded image"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`
            relative border-2 border-dashed rounded-lg text-center
            transition-colors duration-200
            ${isUploading ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            hover:border-primary hover:bg-primary/5
          `}
          style={aspectRatio ? { aspectRatio } : { minHeight: '200px' }}
        >
          <input
            type="file"
            id={`image-upload-${context}`}
            className="sr-only"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            disabled={isUploading}
          />

          <label
            htmlFor={`image-upload-${context}`}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-sm font-medium text-primary">
                  Uploading... {progress}%
                </p>
                <div className="mt-2 w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <span className="text-sm font-medium text-primary hover:text-primary/80">
                  Click to upload image
                </span>
                <p className="text-xs text-muted-foreground mt-2">
                  Up to {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
