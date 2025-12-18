// Chat Types

import type { UserProfile } from './user';

export type MessageType = 'text' | 'image' | 'system';

export interface ChatRoom {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
  bookingId: string | null;
  participants?: UserProfile[];
  messages?: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ChatRoomListItem extends Pick<ChatRoom, 'id' | 'lastMessageAt' | 'bookingId'> {
  participants: UserProfile[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  readAt: Date | null;
  createdAt: Date;
  chatRoomId: string;
  senderId: string;
  sender?: UserProfile;
}

export interface SendMessageInput {
  chatRoomId: string;
  content: string;
  type?: MessageType;
}

export interface CreateChatRoomInput {
  participantIds: string[];
  bookingId?: string;
}

// Socket.io Event Types
export interface ChatEvents {
  // Client -> Server
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (payload: SendMessageInput) => void;
  markAsRead: (messageIds: string[]) => void;
  typing: (roomId: string) => void;
  stopTyping: (roomId: string) => void;

  // Server -> Client
  message: (message: Message) => void;
  messageRead: (payload: { messageIds: string[]; readAt: Date }) => void;
  userTyping: (payload: { roomId: string; userId: string }) => void;
  userStopTyping: (payload: { roomId: string; userId: string }) => void;
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  error: (error: { code: string; message: string }) => void;
}
