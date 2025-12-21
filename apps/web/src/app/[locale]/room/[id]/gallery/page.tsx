'use client';

import { useParams } from 'next/navigation';
import { ImageGalleryPage } from '@/views/room-detail';

export default function GalleryRoute() {
  const params = useParams();
  const roomId = params.id as string;

  return <ImageGalleryPage roomId={roomId} />;
}
