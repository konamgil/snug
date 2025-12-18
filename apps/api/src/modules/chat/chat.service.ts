import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatRepository } from './chat.repository';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async verifyRoomAccess(roomId: string, userId: string): Promise<boolean> {
    const chatRoom = await this.chatRepository.findRoomByIdAndUser(roomId, userId);
    return !!chatRoom;
  }

  async getRecentMessages(roomId: string, limit = 50) {
    return this.chatRepository.findMessages(roomId, limit);
  }

  async createMessage(roomId: string, senderId: string, content: string) {
    return this.chatRepository.createMessage({
      chatRoomId: roomId,
      senderId,
      content,
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.chatRepository.markMessageAsRead(messageId);
  }

  async getUserChatRooms(userId: string) {
    return this.chatRepository.findUserChatRooms(userId);
  }
}
