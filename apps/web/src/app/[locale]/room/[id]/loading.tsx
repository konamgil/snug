import { LoadingLogo } from '@/shared/ui/loading-logo';

export default function RoomDetailLoading() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
      aria-busy="true"
    >
      <LoadingLogo size="lg" variant="pulse" />
    </div>
  );
}
