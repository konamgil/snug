'use client';

import { Link } from '@/i18n/navigation';

interface MonthlyData {
  month: string;
  amount: number;
}

const MOCK_DATA: MonthlyData[] = [
  { month: '7월', amount: 90 },
  { month: '8월', amount: 68 },
  { month: '9월', amount: 85 },
];

const CURRENT_SETTLEMENT = {
  month: '9월',
  amount: 6123456,
  unit: '천원',
  comparison: '+823,456천원',
};

export function SettlementSection() {
  const maxValue = 100;

  return (
    <section className="bg-white rounded-xl p-4 md:p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">정산</h2>
        <Link
          href="/host/settlements"
          className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
        >
          모든 정산목록 보기
        </Link>
      </div>

      {/* Amount Display */}
      <div className="mb-6">
        <p className="text-sm text-[hsl(var(--snug-gray))] mb-1">
          {CURRENT_SETTLEMENT.month} 정산금액
        </p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl md:text-3xl font-bold text-[hsl(var(--snug-orange))]">
            {CURRENT_SETTLEMENT.amount.toLocaleString('ko-KR')}
            {CURRENT_SETTLEMENT.unit}
          </span>
          <span className="text-xs md:text-sm text-[hsl(var(--snug-gray))]">
            (전월 대비 {CURRENT_SETTLEMENT.comparison})
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-[hsl(var(--snug-gray))]">
          <span>100</span>
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className="ml-10 flex items-end justify-around gap-2 md:gap-4 h-[200px] md:h-[180px] border-b border-[hsl(var(--snug-border))]">
          {MOCK_DATA.map((data, index) => {
            const barHeight = Math.round((data.amount / maxValue) * 170);
            const isLastMonth = index === MOCK_DATA.length - 1;

            return (
              <div
                key={data.month}
                className="flex-1 max-w-[80px] flex flex-col items-center justify-end h-full relative"
              >
                {/* Value Label for last month */}
                {isLastMonth && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-white border border-[hsl(var(--snug-border))] rounded text-xs font-medium text-[hsl(var(--snug-text-primary))] whitespace-nowrap shadow-sm">
                    {CURRENT_SETTLEMENT.amount.toLocaleString('ko-KR')}
                    {CURRENT_SETTLEMENT.unit}
                  </div>
                )}

                {/* Bar */}
                <div
                  className="w-full rounded-t bg-[hsl(var(--snug-orange))]"
                  style={{ height: `${barHeight}px` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="ml-10 flex justify-around gap-2 md:gap-4 mt-2">
          {MOCK_DATA.map((data) => (
            <div
              key={data.month}
              className="flex-1 max-w-[80px] text-center text-xs text-[hsl(var(--snug-gray))]"
            >
              {data.month}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SettlementEmptySection() {
  return (
    <section className="bg-white rounded-xl p-4 md:p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">정산</h2>
        <Link
          href="/host/settlements"
          className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
        >
          모든 정산목록 보기
        </Link>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <p className="text-sm text-[hsl(var(--snug-gray))]">아직 정산 내역이 없습니다.</p>
        <p className="text-sm text-[hsl(var(--snug-gray))]">
          새로운 정산이 발생하면 이곳에서 확인할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
