import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.bucket = process.env.STORAGE_BUCKET || 'snug-uploads';
  }

  /**
   * URL에서 스토리지 경로 추출
   * @example https://xxx.supabase.co/storage/v1/object/public/snug-uploads/accommodations/temp/...
   *          → accommodations/temp/...
   */
  private extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const match = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
      return match?.[1] ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  }

  /**
   * temp 폴더에서 영구 폴더로 파일 이동
   * @param tempUrl 임시 URL (accommodations/temp/...)
   * @param accommodationId 숙소 ID
   * @returns 새 URL 또는 null (이동 실패 시)
   */
  async moveFromTemp(tempUrl: string, accommodationId: string): Promise<string | null> {
    // temp URL이 아니면 그대로 반환
    if (!tempUrl.includes('/temp/')) {
      return tempUrl;
    }

    const oldPath = this.extractPathFromUrl(tempUrl);
    if (!oldPath) {
      this.logger.warn(`Invalid URL format: ${tempUrl}`);
      return null;
    }

    // 새 경로 생성: accommodations/temp/group_xxx/file.jpg → accommodations/{id}/file.jpg
    const fileName = oldPath.split('/').pop();
    if (!fileName) {
      return null;
    }

    // 카테고리 추출 (있으면 유지)
    const categoryMatch = oldPath.match(/\/temp\/[^/]+\/([^/]+)\//);
    const category = categoryMatch?.[1] || '';

    const newPath = category
      ? `accommodations/${accommodationId}/${category}/${fileName}`
      : `accommodations/${accommodationId}/${fileName}`;

    try {
      // Supabase Storage는 move를 지원하지 않으므로 copy + delete
      // 1. 파일 다운로드
      const { data: fileData, error: downloadError } = await this.supabase.storage
        .from(this.bucket)
        .download(oldPath);

      if (downloadError || !fileData) {
        this.logger.error(`Failed to download: ${oldPath}`, downloadError);
        return null;
      }

      // 2. 새 경로에 업로드
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucket)
        .upload(newPath, fileData, {
          cacheControl: '31536000', // 1년 캐시
          upsert: true,
        });

      if (uploadError) {
        this.logger.error(`Failed to upload to: ${newPath}`, uploadError);
        return null;
      }

      // 3. 원본 삭제
      const { error: deleteError } = await this.supabase.storage
        .from(this.bucket)
        .remove([oldPath]);

      if (deleteError) {
        this.logger.warn(`Failed to delete original: ${oldPath}`, deleteError);
        // 삭제 실패해도 새 URL 반환 (나중에 정리)
      }

      // 4. 새 공개 URL 반환
      const { data: publicUrlData } = this.supabase.storage.from(this.bucket).getPublicUrl(newPath);

      this.logger.log(`Moved: ${oldPath} → ${newPath}`);
      return publicUrlData.publicUrl;
    } catch (error) {
      this.logger.error(`Move failed for ${tempUrl}:`, error);
      return null;
    }
  }

  /**
   * 여러 temp URL을 영구 경로로 이동
   * @returns 이동된 URL 배열 (실패한 항목은 원본 URL 유지)
   */
  async moveMultipleFromTemp(tempUrls: string[], accommodationId: string): Promise<string[]> {
    const results = await Promise.all(
      tempUrls.map(async (url) => {
        const newUrl = await this.moveFromTemp(url, accommodationId);
        return newUrl || url; // 실패 시 원본 URL 유지
      }),
    );
    return results;
  }

  /**
   * temp 폴더 파일 삭제 (정리용)
   */
  async cleanupTempFiles(olderThanDays: number = 7): Promise<number> {
    try {
      const { data: files, error } = await this.supabase.storage
        .from(this.bucket)
        .list('accommodations/temp', {
          limit: 1000,
        });

      if (error || !files) {
        this.logger.error('Failed to list temp files', error);
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const oldFiles = files.filter((file) => {
        if (!file.created_at) return false;
        return new Date(file.created_at) < cutoffDate;
      });

      if (oldFiles.length === 0) {
        return 0;
      }

      const pathsToDelete = oldFiles.map((f) => `accommodations/temp/${f.name}`);
      const { error: deleteError } = await this.supabase.storage
        .from(this.bucket)
        .remove(pathsToDelete);

      if (deleteError) {
        this.logger.error('Failed to delete temp files', deleteError);
        return 0;
      }

      this.logger.log(`Cleaned up ${oldFiles.length} temp files`);
      return oldFiles.length;
    } catch (error) {
      this.logger.error('Temp cleanup failed', error);
      return 0;
    }
  }
}
