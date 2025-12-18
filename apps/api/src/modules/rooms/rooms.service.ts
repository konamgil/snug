import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { CreateRoomDto, UpdateRoomDto, SearchRoomsDto } from './dto';

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async create(hostId: string, dto: CreateRoomDto) {
    return this.roomsRepository.create(hostId, dto);
  }

  async findAll(query: SearchRoomsDto) {
    return this.roomsRepository.findMany(query);
  }

  async findOne(id: string) {
    const room = await this.roomsRepository.findById(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async findByHost(hostId: string) {
    return this.roomsRepository.findByHostId(hostId);
  }

  async update(id: string, userId: string, dto: UpdateRoomDto) {
    await this.verifyOwnership(id, userId);
    return this.roomsRepository.update(id, dto);
  }

  async remove(id: string, userId: string) {
    await this.verifyOwnership(id, userId);
    await this.roomsRepository.delete(id);
    return { deleted: true };
  }

  async toggleFavorite(roomId: string, userId: string) {
    // Verify room exists
    await this.findOne(roomId);

    const existing = await this.roomsRepository.findFavorite(userId, roomId);

    if (existing) {
      await this.roomsRepository.removeFavorite(existing.id);
      return { favorited: false };
    }

    await this.roomsRepository.addFavorite(userId, roomId);
    return { favorited: true };
  }

  async getFavorites(userId: string) {
    return this.roomsRepository.findUserFavorites(userId);
  }

  private async verifyOwnership(roomId: string, userId: string): Promise<void> {
    const isOwner = await this.roomsRepository.isOwnedBy(roomId, userId);
    if (!isOwner) {
      throw new ForbiddenException('You can only modify your own rooms');
    }
  }
}
