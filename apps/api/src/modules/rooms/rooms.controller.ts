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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, SearchRoomsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('rooms')
@ApiBearerAuth('JWT-auth')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room listing' })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req: { user: { userId: string } }, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(req.user.userId, createRoomDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search and list rooms' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Search keyword' })
  @ApiQuery({ name: 'type', required: false, description: 'Room type filter' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of rooms with pagination' })
  findAll(@Query() query: SearchRoomsDto) {
    return this.roomsService.findAll(query);
  }

  @Get('my-rooms')
  @ApiOperation({ summary: 'Get rooms owned by current user' })
  @ApiResponse({ status: 200, description: 'List of user rooms' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyRooms(@Request() req: { user: { userId: string } }) {
    return this.roomsService.findByHost(req.user.userId);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get user favorite rooms' })
  @ApiResponse({ status: 200, description: 'List of favorite rooms' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getFavorites(@Request() req: { user: { userId: string } }) {
    return this.roomsService.getFavorites(req.user.userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get room details by ID' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Room details retrieved' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update room details' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not room owner' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  update(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, req.user.userId, updateRoomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not room owner' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  remove(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.roomsService.remove(id, req.user.userId);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Toggle room favorite status' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Favorite status toggled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  toggleFavorite(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.roomsService.toggleFavorite(id, req.user.userId);
  }
}
