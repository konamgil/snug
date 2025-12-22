import { ChatDetailView } from '@/views/chat-detail';

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id } = await params;
  return <ChatDetailView chatId={id} />;
}
