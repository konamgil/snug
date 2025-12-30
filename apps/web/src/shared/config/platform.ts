/**
 * 플랫폼 설정 상수
 *
 * 가격 계산, 수수료, 할인 정책 등 플랫폼 전역 설정
 */

/**
 * 서비스 수수료 (%)
 * 예약 금액의 일정 비율을 플랫폼 수수료로 부과
 */
export const SERVICE_FEE_PERCENT = 10;

/**
 * 장기 숙박 할인 정책
 * 주 단위로 할인율 적용
 */
export const LONG_STAY_DISCOUNTS = {
  /** 2주 이상 (14일+): 5% 할인 */
  WEEKS_2: { weeks: 2, percent: 5 },
  /** 4주 이상 (28일+): 10% 할인 */
  WEEKS_4: { weeks: 4, percent: 10 },
  /** 12주 이상 (84일+): 20% 할인 */
  WEEKS_12: { weeks: 12, percent: 20 },
} as const;

/**
 * 주 수에 따른 장기 숙박 할인율 계산
 * @param nights 숙박 일수
 * @returns 할인율 (%)
 */
export function getLongStayDiscountPercent(nights: number): number {
  const weeks = Math.floor(nights / 7);

  if (weeks >= LONG_STAY_DISCOUNTS.WEEKS_12.weeks) {
    return LONG_STAY_DISCOUNTS.WEEKS_12.percent;
  }
  if (weeks >= LONG_STAY_DISCOUNTS.WEEKS_4.weeks) {
    return LONG_STAY_DISCOUNTS.WEEKS_4.percent;
  }
  if (weeks >= LONG_STAY_DISCOUNTS.WEEKS_2.weeks) {
    return LONG_STAY_DISCOUNTS.WEEKS_2.percent;
  }

  return 0;
}

/**
 * 장기 숙박 할인 금액 계산
 * @param subtotal 숙박 소계 (1박 가격 * 숙박일)
 * @param nights 숙박 일수
 * @returns 할인 금액
 */
export function calculateLongStayDiscount(subtotal: number, nights: number): number {
  const discountPercent = getLongStayDiscountPercent(nights);
  return Math.round(subtotal * (discountPercent / 100));
}

/**
 * 서비스 수수료 계산
 * @param subtotal 숙박 소계
 * @returns 서비스 수수료
 */
export function calculateServiceFee(subtotal: number): number {
  return Math.round(subtotal * (SERVICE_FEE_PERCENT / 100));
}

/**
 * 총 금액 계산
 * @param pricePerNight 1박 가격
 * @param nights 숙박 일수
 * @param cleaningFee 청소비
 * @returns 가격 상세 내역
 */
export function calculateTotalPrice(
  pricePerNight: number,
  nights: number,
  cleaningFee: number = 0,
): {
  subtotal: number;
  serviceFee: number;
  longStayDiscount: number;
  discountPercent: number;
  cleaningFee: number;
  total: number;
} {
  const subtotal = pricePerNight * nights;
  const serviceFee = calculateServiceFee(subtotal);
  const discountPercent = getLongStayDiscountPercent(nights);
  const longStayDiscount = calculateLongStayDiscount(subtotal, nights);
  const total = subtotal + cleaningFee + serviceFee - longStayDiscount;

  return {
    subtotal,
    serviceFee,
    longStayDiscount,
    discountPercent,
    cleaningFee,
    total,
  };
}
