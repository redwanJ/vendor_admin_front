export interface UploadDto {
  id: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  storagePath: string;
  context: string;
  status: string;
  fileUrl: string;
  createdAt: string;
}

export enum UploadContext {
  ServiceImage = 'ServiceImage',
  ServicePrimaryImage = 'ServicePrimaryImage',
  UserAvatar = 'UserAvatar',
  TenantLogo = 'TenantLogo',
  Document = 'Document',
}

export enum UploadStatus {
  Pending = 'Pending',
  Uploaded = 'Uploaded',
  Failed = 'Failed',
  MarkedForDeletion = 'MarkedForDeletion',
  Deleted = 'Deleted',
}

export interface UploadOptions {
  context: UploadContext;
  maxSizeBytes?: number;
  acceptedFileTypes?: string[];
  multiple?: boolean;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  success: boolean;
  uploads?: UploadDto[];
  error?: string;
}
