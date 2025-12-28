'use client';

import { getSupabaseClient } from '@/shared/lib/supabase/client';

/**
 * Supabase Storage 업로드 유틸리티
 *
 * 숙소 사진을 Supabase Storage에 업로드합니다.
 * 브라우저에서 직접 Storage로 업로드하여 NestJS 서버 부하를 줄입니다.
 */

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'snug-uploads';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * 파일 경로 생성
 * 형식: accommodations/{accommodationId}/{category}/{timestamp}_{filename}
 */
function generateFilePath(
  accommodationId: string | null,
  category: string,
  fileName: string,
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueId = Math.random().toString(36).substring(2, 8);

  // accommodationId가 없으면 임시 폴더 사용 (신규 등록 시)
  const folder = accommodationId || 'temp';

  return `accommodations/${folder}/${category}/${timestamp}_${uniqueId}_${sanitizedFileName}`;
}

/**
 * 단일 파일 업로드
 */
export async function uploadFile(
  file: File,
  accommodationId: string | null,
  category: string,
  onProgress?: (progress: number) => void,
): Promise<UploadResult> {
  try {
    const supabase = getSupabaseClient();
    const filePath = generateFilePath(accommodationId, category, file.name);

    // 파일 업로드
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Storage] Upload error:', uploadError);
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // 공개 URL 가져오기
    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error('[Storage] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * 여러 파일 업로드 (배치)
 */
export async function uploadFiles(
  files: File[],
  accommodationId: string | null,
  category: string,
  onProgress?: (progress: UploadProgress[]) => void,
): Promise<UploadResult[]> {
  const progressState: UploadProgress[] = files.map((file) => ({
    fileName: file.name,
    progress: 0,
    status: 'pending',
  }));

  const updateProgress = (index: number, update: Partial<UploadProgress>) => {
    const current = progressState[index];
    if (!current) return;
    progressState[index] = {
      fileName: current.fileName,
      progress: update.progress ?? current.progress,
      status: update.status ?? current.status,
      error: update.error ?? current.error,
    };
    onProgress?.([...progressState]);
  };

  const results = await Promise.all(
    files.map(async (file, index) => {
      updateProgress(index, { status: 'uploading', progress: 10 });

      const result = await uploadFile(file, accommodationId, category, (progress) =>
        updateProgress(index, { progress }),
      );

      updateProgress(index, {
        status: result.success ? 'completed' : 'error',
        progress: result.success ? 100 : 0,
        error: result.error,
      });

      return result;
    }),
  );

  return results;
}

/**
 * 파일 삭제
 */
export async function deleteFile(url: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // URL에서 파일 경로 추출
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);

    if (!pathMatch || !pathMatch[1]) {
      console.error('[Storage] Invalid storage URL:', url);
      return false;
    }

    const filePath = decodeURIComponent(pathMatch[1]);

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

    if (error) {
      console.error('[Storage] Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Storage] Delete unexpected error:', error);
    return false;
  }
}

/**
 * 이미지 검증
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'JPG, PNG, WebP, HEIC 파일만 업로드 가능합니다.',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: '파일 크기는 10MB 이하여야 합니다.',
    };
  }

  return { valid: true };
}

/**
 * 프로필 아바타 업로드
 * 형식: avatars/{userId}/{timestamp}_{filename}
 */
export async function uploadAvatar(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void,
): Promise<UploadResult> {
  try {
    const supabase = getSupabaseClient();
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const filePath = `avatars/${userId}/${timestamp}_${uniqueId}_${sanitizedFileName}`;

    // 파일 업로드
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Storage] Avatar upload error:', uploadError);
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // 공개 URL 가져오기
    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error('[Storage] Avatar upload unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * 이미지 압축 (필요 시)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');

        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            // 압축된 파일이 원본보다 작을 때만 사용
            resolve(compressedFile.size < file.size ? compressedFile : file);
          },
          'image/jpeg',
          quality,
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
