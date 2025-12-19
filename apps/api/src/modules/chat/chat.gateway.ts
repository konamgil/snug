import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    email: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    // TODO: Validate JWT token from handshake
    const token = client.handshake.auth.token as string | undefined;

    if (!token) {
      this.logger.warn(`Client ${client.id} disconnected: No token provided`);
      client.disconnect();
      return;
    }

    try {
      const payload = await this.chatService.validateToken(token);
      client.data.userId = payload.sub;
      client.data.email = payload.email;

      // Join user's personal room for direct notifications
      await client.join(`user:${payload.sub}`);

      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch {
      this.logger.warn(`Client ${client.id} disconnected: Invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    const userId = client.data.userId;

    // Verify user has access to this chat room
    const hasAccess = await this.chatService.verifyRoomAccess(roomId, userId);

    if (!hasAccess) {
      client.emit('error', { message: 'Access denied to this chat room' });
      return;
    }

    await client.join(`room:${roomId}`);
    this.logger.log(`User ${userId} joined room ${roomId}`);

    // Load recent messages
    const messages = await this.chatService.getRecentMessages(roomId);
    client.emit('roomHistory', { roomId, messages });
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    await client.leave(`room:${data.roomId}`);
    this.logger.log(`User ${client.data.userId} left room ${data.roomId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const { roomId, content } = data;
    const userId = client.data.userId;

    // Verify access
    const hasAccess = await this.chatService.verifyRoomAccess(roomId, userId);

    if (!hasAccess) {
      client.emit('error', { message: 'Access denied' });
      return;
    }

    // Save message to database
    const message = await this.chatService.createMessage(roomId, userId, content);

    // Broadcast to room
    this.server.to(`room:${roomId}`).emit('newMessage', {
      id: message.id,
      roomId,
      senderId: userId,
      content,
      createdAt: message.createdAt,
      sender: message.sender,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const { roomId, isTyping } = data;

    client.to(`room:${roomId}`).emit('userTyping', {
      roomId,
      userId: client.data.userId,
      isTyping,
    });
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; messageId: string },
  ) {
    await this.chatService.markMessageAsRead(data.messageId);

    client.to(`room:${data.roomId}`).emit('messageRead', {
      roomId: data.roomId,
      messageId: data.messageId,
      readBy: client.data.userId,
    });
  }

  // Utility method to send notification to specific user
  sendNotificationToUser(userId: string, notification: unknown) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
