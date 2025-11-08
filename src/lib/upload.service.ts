import { api } from './axios';
import type { UploadDto, UploadContext } from '@/types/upload';

export interface UploadFilesResponse {
  uploads: UploadDto[];
}

export interface GetUploadsParams {
  context?: UploadContext;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetUploadsResponse {
  items: UploadDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

class UploadService {
  /**
   * Upload one or more files
   */
  async uploadFiles(
    files: File[],
    context: UploadContext,
    onProgress?: (progress: number) => void
  ): Promise<UploadDto[]> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('context', context);

    const response = await api.post<UploadDto[]>('/vendor/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  }

  /**
   * Get uploads with optional filters
   */
  async getUploads(params?: GetUploadsParams): Promise<GetUploadsResponse> {
    const response = await api.get<GetUploadsResponse>('/vendor/uploads', {
      params,
    });
    return response.data;
  }

  /**
   * Delete an upload
   */
  async deleteUpload(uploadId: string): Promise<void> {
    await api.delete(`/vendor/uploads/${uploadId}`);
  }
}

export const uploadService = new UploadService();
