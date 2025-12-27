import { Injectable, Logger } from '@nestjs/common';

/**
 * Kakao Local API 응답 타입
 */
interface KakaoAddressResponse {
  documents: Array<{
    address_name: string;
    address_type: string;
    x: string; // longitude
    y: string; // latitude
    address?: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
    };
    road_address?: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      road_name: string;
      building_name: string;
    };
  }>;
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  addressName: string;
  /** 법정동 이름 (예: 망원동) - 도로명주소에서도 지번주소의 동 이름 추출 */
  bname?: string;
  /** 시/군/구 이름 (예: 마포구) */
  sigungu?: string;
  /** 시/도 이름 (예: 서울) */
  sido?: string;
}

/**
 * Geocoding Service
 *
 * 카카오 Local API를 사용하여 주소를 좌표로 변환합니다.
 * https://developers.kakao.com/docs/latest/ko/local/dev-guide#address-coord
 */
@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://dapi.kakao.com/v2/local/search/address.json';

  constructor() {
    this.apiKey = process.env.KAKAO_REST_API_KEY;
    if (!this.apiKey) {
      this.logger.warn('KAKAO_REST_API_KEY is not set. Geocoding will be disabled.');
    }
  }

  /**
   * 주소를 좌표로 변환
   *
   * @param address 검색할 주소 (도로명 또는 지번)
   * @returns 좌표 정보 또는 null (찾지 못한 경우)
   */
  async getCoordinates(address: string): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      this.logger.warn('Geocoding skipped: KAKAO_REST_API_KEY not configured');
      return null;
    }

    if (!address || address.trim().length === 0) {
      return null;
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('query', address);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `KakaoAK ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        this.logger.error(`Kakao API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = (await response.json()) as KakaoAddressResponse;

      if (data.documents.length === 0) {
        this.logger.debug(`No coordinates found for address: ${address}`);
        return null;
      }

      const firstResult = data.documents[0];
      const latitude = parseFloat(firstResult.y);
      const longitude = parseFloat(firstResult.x);

      if (isNaN(latitude) || isNaN(longitude)) {
        this.logger.error(`Invalid coordinates from Kakao API: ${firstResult.y}, ${firstResult.x}`);
        return null;
      }

      // 지번 주소에서 동 이름 추출 (도로명 주소로 검색해도 지번 정보 포함됨)
      const addressInfo = firstResult.address;
      const bname = addressInfo?.region_3depth_name || undefined;
      const sigungu =
        addressInfo?.region_2depth_name ||
        firstResult.road_address?.region_2depth_name ||
        undefined;
      const sido =
        addressInfo?.region_1depth_name ||
        firstResult.road_address?.region_1depth_name ||
        undefined;

      return {
        latitude,
        longitude,
        addressName: firstResult.address_name,
        bname,
        sigungu,
        sido,
      };
    } catch (error) {
      this.logger.error(`Geocoding failed for address "${address}":`, error);
      return null;
    }
  }

  /**
   * 도로명 주소로 좌표 조회 (우선), 실패 시 지번 주소로 재시도
   *
   * @param roadAddress 도로명 주소
   * @param jibunAddress 지번 주소 (fallback)
   * @returns 좌표 정보 또는 null
   */
  async getCoordinatesWithFallback(
    roadAddress?: string | null,
    jibunAddress?: string | null,
  ): Promise<GeocodingResult | null> {
    // 도로명 주소 우선 시도
    if (roadAddress) {
      const result = await this.getCoordinates(roadAddress);
      if (result) {
        return result;
      }
    }

    // 지번 주소로 재시도
    if (jibunAddress) {
      return this.getCoordinates(jibunAddress);
    }

    return null;
  }
}
