import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/client';

interface ExternalRatesResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}

export interface ExchangeRateDto {
  currency: string;
  rate: number;
  inverseRate: number;
  displayRate: number;
  marginPercent: number;
  fetchedAt: Date;
}

export interface ExchangeRatesResponseDto {
  base: string;
  rates: ExchangeRateDto[];
  updatedAt: Date;
}

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private readonly SUPPORTED_CURRENCIES = ['USD', 'JPY', 'CNY', 'EUR'];
  private readonly DEFAULT_MARGIN = 2.5; // 2.5% 마진
  private readonly API_URL = 'https://open.er-api.com/v6/latest/KRW';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * DB에서 환율 조회
   */
  async getExchangeRates(): Promise<ExchangeRatesResponseDto> {
    const rates = await this.prisma.exchangeRate.findMany({
      orderBy: { currency: 'asc' },
    });

    // DB에 데이터가 없으면 외부 API에서 가져와서 저장
    if (rates.length === 0) {
      await this.updateExchangeRates();
      return this.getExchangeRates();
    }

    const latestUpdate = rates.reduce(
      (latest, rate) => (rate.fetchedAt > latest ? rate.fetchedAt : latest),
      rates[0].fetchedAt,
    );

    return {
      base: 'KRW',
      rates: rates.map((rate) => ({
        currency: rate.currency,
        rate: Number(rate.rate),
        inverseRate: Number(rate.inverseRate),
        displayRate: Number(rate.displayRate),
        marginPercent: Number(rate.marginPercent),
        fetchedAt: rate.fetchedAt,
      })),
      updatedAt: latestUpdate,
    };
  }

  /**
   * 특정 통화 환율 조회
   */
  async getExchangeRate(currency: string): Promise<ExchangeRateDto | null> {
    const rate = await this.prisma.exchangeRate.findUnique({
      where: { currency: currency.toUpperCase() },
    });

    if (!rate) return null;

    return {
      currency: rate.currency,
      rate: Number(rate.rate),
      inverseRate: Number(rate.inverseRate),
      displayRate: Number(rate.displayRate),
      marginPercent: Number(rate.marginPercent),
      fetchedAt: rate.fetchedAt,
    };
  }

  /**
   * 외부 API에서 환율 가져와서 DB 업데이트
   * Supabase Edge Function 또는 Cron에서 호출
   */
  async updateExchangeRates(): Promise<ExchangeRatesResponseDto> {
    this.logger.log('Fetching exchange rates from external API...');

    try {
      const response = await fetch(this.API_URL);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = (await response.json()) as ExternalRatesResponse;

      if (data.result !== 'success') {
        throw new Error('API returned unsuccessful result');
      }

      const now = new Date();
      const updatedRates: ExchangeRateDto[] = [];

      for (const currency of this.SUPPORTED_CURRENCIES) {
        const rawRate = data.rates[currency];

        if (!rawRate) {
          this.logger.warn(`No rate found for ${currency}`);
          continue;
        }

        // 마진 적용 (사용자에게 불리하게 = 외화 가치 낮게)
        const marginMultiplier = 1 - this.DEFAULT_MARGIN / 100;
        const displayRate = rawRate * marginMultiplier;

        // 역환율 계산 (1 USD = ? KRW)
        const inverseRate = rawRate > 0 ? 1 / rawRate : 0;

        const rate = await this.prisma.exchangeRate.upsert({
          where: { currency },
          update: {
            rate: new Decimal(rawRate.toFixed(10)),
            inverseRate: new Decimal(inverseRate.toFixed(4)),
            displayRate: new Decimal(displayRate.toFixed(10)),
            marginPercent: new Decimal(this.DEFAULT_MARGIN),
            fetchedAt: now,
          },
          create: {
            currency,
            rate: new Decimal(rawRate.toFixed(10)),
            inverseRate: new Decimal(inverseRate.toFixed(4)),
            displayRate: new Decimal(displayRate.toFixed(10)),
            marginPercent: new Decimal(this.DEFAULT_MARGIN),
            source: 'open.er-api.com',
            fetchedAt: now,
          },
        });

        updatedRates.push({
          currency: rate.currency,
          rate: Number(rate.rate),
          inverseRate: Number(rate.inverseRate),
          displayRate: Number(rate.displayRate),
          marginPercent: Number(rate.marginPercent),
          fetchedAt: rate.fetchedAt,
        });
      }

      this.logger.log(
        `Exchange rates updated successfully: ${updatedRates.map((r) => r.currency).join(', ')}`,
      );

      return {
        base: 'KRW',
        rates: updatedRates,
        updatedAt: now,
      };
    } catch (error) {
      this.logger.error('Failed to update exchange rates:', error);
      throw error;
    }
  }

  /**
   * 마지막 업데이트 시간 조회
   */
  async getLastUpdateTime(): Promise<Date | null> {
    const latest = await this.prisma.exchangeRate.findFirst({
      orderBy: { fetchedAt: 'desc' },
      select: { fetchedAt: true },
    });

    return latest?.fetchedAt ?? null;
  }
}
