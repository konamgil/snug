import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GeocodingService } from './geocoding.service';
import { Public } from '../../common/decorators';

/**
 * Geocoding Controller
 *
 * 좌표 조회 테스트용 API 엔드포인트
 * 개발/테스트 환경에서만 사용
 */
@ApiTags('geocoding')
@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  /**
   * 주소로 좌표 조회 테스트
   */
  @Get('test')
  @Public()
  @ApiOperation({ summary: 'Test geocoding - get coordinates from address' })
  @ApiQuery({ name: 'address', required: true, description: 'Address to geocode' })
  @ApiResponse({
    status: 200,
    description: 'Returns coordinates or null',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        address: { type: 'string' },
        result: {
          type: 'object',
          nullable: true,
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            addressName: { type: 'string' },
          },
        },
      },
    },
  })
  async testGeocode(@Query('address') address: string) {
    const result = await this.geocodingService.getCoordinates(address);

    return {
      success: result !== null,
      address,
      result,
    };
  }
}
