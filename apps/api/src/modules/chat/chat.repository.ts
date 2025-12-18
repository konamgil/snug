import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatRoom, Message } from '@prisma/client';

const USER_SELECT = {
  id: true,
  name: true,
  avatar: true,
} as const;

@Injectable()
export class ChatRepository extends BaseRepository<ChatRoom> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findRoomByIdAndUser(roomId: string, userId: string) {
    return this.prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: userId },
        },
      },
    });
  }

  async findMessages(roomId: string, limit = 50) {
    return this.prisma.message.findMany({
      where: { chatRoomId: roomId },
      include: {
        sender: { select: USER_SELECT },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createMessage(data: { chatRoomId: string; senderId: string; content: string }) {
    return this.prisma.message.create({
      data,
      include: {
        sender: { select: USER_SELECT },
      },
    });
  }

  async markMessageAsRead(messageId: string): Promise<Message> {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });
  }

  async findUserChatRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      include: {
        participants: { select: USER_SELECT },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        booking: {
          include: {
            room: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        messages: {
          _count: 'desc',
        },
      },
    });
  }
}
