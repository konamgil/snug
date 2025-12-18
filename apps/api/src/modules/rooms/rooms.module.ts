import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from './rooms.repository';
import { RoomsController } from './rooms.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomsController],
  providers: [RoomsRepository, RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
