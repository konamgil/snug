import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/shared/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // Get the actual origin from headers (handles reverse proxy like Render)
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const origin = `${protocol}://${host}`;

  // OAuth 에러가 쿼리 파라미터로 전달된 경우
  if (errorParam) {
    let errorCode = 'auth_callback_error';

    // 이미 다른 방식으로 가입된 이메일인 경우
    if (
      errorDescription?.includes('identity_already_exists') ||
      errorDescription?.includes('already registered') ||
      errorDescription?.includes('email already')
    ) {
      errorCode = 'email_already_registered';
    }

    return NextResponse.redirect(`${origin}/login?error=${errorCode}`);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    // 에러 메시지 분석
    let errorCode = 'auth_callback_error';
    const errorMessage = error.message?.toLowerCase() || '';

    if (
      errorMessage.includes('identity_already_exists') ||
      errorMessage.includes('already registered') ||
      errorMessage.includes('email already') ||
      errorMessage.includes('user already registered')
    ) {
      errorCode = 'email_already_registered';
    }

    return NextResponse.redirect(`${origin}/login?error=${errorCode}`);
  }

  // 에러 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
