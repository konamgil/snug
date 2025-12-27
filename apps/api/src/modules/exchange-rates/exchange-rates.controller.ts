import { Controller, Get, Post, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  ExchangeRatesService,
  ExchangeRatesResponseDto,
  ExchangeRateDto,
} from './exchange-rates.service';

@ApiTags('Exchange Rates')
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  @ApiOperation({ summary: '모든 환율 조회' })
  @ApiResponse({
    status: 200,
    description: '환율 목록 반환',
  })
  async getExchangeRates(): Promise<ExchangeRatesResponseDto> {
    return this.exchangeRatesService.getExchangeRates();
  }

  @Get(':currency')
  @ApiOperation({ summary: '특정 통화 환율 조회' })
  @ApiParam({ name: 'currency', description: '통화 코드 (USD, JPY, CNY, EUR)' })
  @ApiResponse({
    status: 200,
    description: '환율 정보 반환',
  })
  async getExchangeRate(@Param('currency') currency: string): Promise<ExchangeRateDto | null> {
    return this.exchangeRatesService.getExchangeRate(currency);
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '환율 업데이트 (Cron/Edge Function 호출용)' })
  @ApiResponse({
    status: 200,
    description: '환율 업데이트 완료',
  })
  async updateExchangeRates(): Promise<ExchangeRatesResponseDto> {
    return this.exchangeRatesService.updateExchangeRates();
  }

  @Get('status/last-update')
  @ApiOperation({ summary: '마지막 업데이트 시간 조회' })
  @ApiResponse({
    status: 200,
    description: '마지막 업데이트 시간',
  })
  async getLastUpdateTime(): Promise<{ lastUpdate: Date | null }> {
    const lastUpdate = await this.exchangeRatesService.getLastUpdateTime();
    return { lastUpdate };
  }
}
