'use client';

import { useState, useCallback } from 'react';
import { Upload, X, FileIcon, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadService } from '@/lib/upload.service';
import type { UploadDto, UploadContext } from '@/types/upload';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  context: UploadContext;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  value?: UploadDto[];
  onChange?: (uploads: UploadDto[]) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  upload?: UploadDto;
  error?: string;
}

export default function FileUpload({
  context,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  multiple = true,
  value = [],
  onChange,
  onError,
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFiles = useCallback(
    async (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      const fileArray = Array.from(newFiles);

      // Validate file count
      const totalFiles = files.length + value.length + fileArray.length;
      if (totalFiles > maxFiles) {
        const message = `Maximum ${maxFiles} files allowed`;
        onError?.(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        return;
      }

      // Validate and prepare files
      const validFiles: FileWithPreview[] = [];
      for (const file of fileArray) {
        // Check file size
        if (file.size > maxSize) {
          const message = `File ${file.name} exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
          toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
          });
          continue;
        }

        // Create preview for images
        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        }

        validFiles.push({
          file,
          preview,
          progress: 0,
          status: 'pending',
        });
      }

      if (validFiles.length === 0) return;

      setFiles((prev) => [...prev, ...validFiles]);

      // Upload files
      for (let i = 0; i < validFiles.length; i++) {
        const fileWithPreview = validFiles[i];
        const fileIndex = files.length + i;

        try {
          // Update status to uploading
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === fileIndex ? { ...f, status: 'uploading' as const } : f
            )
          );

          // Upload the file
          const uploads = await uploadService.uploadFiles(
            [fileWithPreview.file],
            context,
            (progress) => {
              setFiles((prev) =>
                prev.map((f, idx) =>
                  idx === fileIndex ? { ...f, progress } : f
                )
              );
            }
          );

          const upload = uploads[0];

          // Update status to success
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === fileIndex
                ? { ...f, status: 'success' as const, upload, progress: 100 }
                : f
            )
          );

          // Notify parent
          onChange?.([...value, upload]);

          toast({
            title: 'Success',
            description: `${fileWithPreview.file.name} uploaded successfully`,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.error || error?.message || 'Upload failed';

          // Update status to error
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === fileIndex
                ? { ...f, status: 'error' as const, error: errorMessage }
                : f
            )
          );

          onError?.(errorMessage);
          toast({
            title: 'Upload Failed',
            description: `${fileWithPreview.file.name}: ${errorMessage}`,
            variant: 'destructive',
          });
        }
      }
    },
    [files, value, maxFiles, maxSize, context, onChange, onError, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => {
        const newFiles = [...prev];
        const removed = newFiles.splice(index, 1)[0];

        // Revoke preview URL to avoid memory leaks
        if (removed.preview) {
          URL.revokeObjectURL(removed.preview);
        }

        return newFiles;
      });
    },
    []
  );

  const removeUpload = useCallback(
    async (upload: UploadDto) => {
      try {
        await uploadService.deleteUpload(upload.id);
        onChange?.(value.filter((u) => u.id !== upload.id));
        toast({
          title: 'Success',
          description: 'File deleted successfully',
        });
      } catch (error: any) {
        const errorMessage = error?.response?.data?.error || error?.message || 'Delete failed';
        toast({
          title: 'Delete Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    [value, onChange, toast]
  );

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-colors duration-200
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          hover:border-primary hover:bg-primary/5
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="text-sm font-medium text-primary hover:text-primary/80">
            Click to upload
          </span>
          <span className="text-sm text-muted-foreground"> or drag and drop</span>
        </label>

        <p className="text-xs text-muted-foreground mt-2">
          {accept === 'image/*' ? 'Images' : 'Files'} up to {Math.round(maxSize / 1024 / 1024)}MB
          {multiple && ` (max ${maxFiles} files)`}
        </p>
      </div>

      {/* File List */}
      {(files.length > 0 || value.length > 0) && (
        <div className="mt-4 space-y-2">
          {/* Existing Uploads */}
          {value.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-background"
            >
              {upload.contentType.startsWith('image/') ? (
                <img
                  src={upload.fileUrl}
                  alt={upload.originalFileName}
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  <FileIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.originalFileName}</p>
                <p className="text-xs text-muted-foreground">{upload.fileSizeFormatted}</p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeUpload(upload)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Files Being Uploaded */}
          {files.map((fileWithPreview, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg bg-background"
            >
              {fileWithPreview.preview ? (
                <img
                  src={fileWithPreview.preview}
                  alt={fileWithPreview.file.name}
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  <FileIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileWithPreview.file.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {fileWithPreview.status === 'uploading' && (
                    <p className="text-xs text-primary">{fileWithPreview.progress}%</p>
                  )}
                  {fileWithPreview.status === 'error' && (
                    <p className="text-xs text-destructive">{fileWithPreview.error}</p>
                  )}
                </div>
                {fileWithPreview.status === 'uploading' && (
                  <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${fileWithPreview.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {fileWithPreview.status === 'uploading' ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
