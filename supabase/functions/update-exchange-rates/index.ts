// Supabase Edge Function: 환율 업데이트
// 매일 자정(KST) Cron으로 호출

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SNUG_API_URL = Deno.env.get('SNUG_API_URL') || 'https://api.findsnug.com';
const CRON_SECRET = Deno.env.get('CRON_SECRET');

serve(async (req: Request) => {
  try {
    // 보안: Cron Secret 검증 (선택적)
    const authHeader = req.headers.get('Authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      console.warn('Unauthorized request attempted');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting exchange rate update...');

    // NestJS API 호출하여 환율 업데이트
    const response = await fetch(`${SNUG_API_URL}/exchange-rates/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.log('Exchange rates updated successfully:', {
      base: data.base,
      currencies: data.rates?.map((r: { currency: string }) => r.currency),
      updatedAt: data.updatedAt,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Exchange rates updated successfully',
        data: {
          base: data.base,
          currencies: data.rates?.length || 0,
          updatedAt: data.updatedAt,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Failed to update exchange rates:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
