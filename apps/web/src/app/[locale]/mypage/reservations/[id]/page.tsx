import { ReservationDetailPage } from '@/views/mypage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ReservationDetailPage id={id} />;
}
