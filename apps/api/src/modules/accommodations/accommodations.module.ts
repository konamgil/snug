import { Module } from '@nestjs/common';
import { AccommodationsController } from './accommodations.controller';
import { AccommodationsService } from './accommodations.service';
import { GeocodingService } from './geocoding.service';
import { GeocodingController } from './geocoding.controller';

/**
 * Accommodations Module
 *
 * 숙소 관리 기능을 제공하는 모듈입니다.
 *
 * ## 제공 기능
 * - 숙소 CRUD (생성, 조회, 수정, 삭제)
 * - 숙소 그룹 CRUD
 * - GUEST → HOST 역할 자동 업그레이드
 * - 공개 API (SEO용)
 * - Geocoding (주소 → 좌표 변환)
 *
 * ## 엔드포인트
 * - GET /accommodations - 내 숙소 목록
 * - GET /accommodations/:id - 숙소 상세
 * - GET /accommodations/public/:id - 공개 정보 (인증 불필요)
 * - POST /accommodations - 숙소 생성
 * - PATCH /accommodations/:id - 숙소 수정
 * - DELETE /accommodations/:id - 숙소 삭제
 * - GET /accommodations/groups/list - 그룹 목록
 * - POST /accommodations/groups - 그룹 생성
 * - PATCH /accommodations/groups/:id - 그룹 수정
 * - DELETE /accommodations/groups/:id - 그룹 삭제
 * - GET /geocoding/test - 좌표 조회 테스트 (개발용)
 */
@Module({
  controllers: [AccommodationsController, GeocodingController],
  providers: [AccommodationsService, GeocodingService],
  exports: [AccommodationsService, GeocodingService],
})
export class AccommodationsModule {}
