import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, SearchRoomsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(req.user.userId, createRoomDto);
  }

  @Public()
  @Get()
  findAll(@Query() query: SearchRoomsDto) {
    return this.roomsService.findAll(query);
  }

  @Get('my-rooms')
  findMyRooms(@Request() req: { user: { userId: string } }) {
    return this.roomsService.findByHost(req.user.userId);
  }

  @Get('favorites')
  getFavorites(@Request() req: { user: { userId: string } }) {
    return this.roomsService.getFavorites(req.user.userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, req.user.userId, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.roomsService.remove(id, req.user.userId);
  }

  @Post(':id/favorite')
  toggleFavorite(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.roomsService.toggleFavorite(id, req.user.userId);
  }
}
