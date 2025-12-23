import { AccommodationEditPage } from '@/views/host';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HostPropertyEditPage({ params }: PageProps) {
  const { id } = await params;
  return <AccommodationEditPage accommodationId={id} />;
}
