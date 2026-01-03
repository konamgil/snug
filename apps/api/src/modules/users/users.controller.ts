import {
  Controller,
  Get,
  Body,
  Patch,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve a list of all users' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user profile with GuestProfile data',
  })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getProfile(@Request() req: { user: { userId: string } }) {
    // userId is the Supabase ID from JWT
    return this.usersService.getProfileBySupabaseId(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve a specific user by their ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Update the authenticated user profile including GuestProfile data',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @Request() req: { user: { userId: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // userId is the Supabase ID from JWT, need to get DB user first
    const profile = await this.usersService.getProfileBySupabaseId(req.user.userId);
    return this.usersService.updateProfile(profile.id, updateUserDto);
  }

  @Post('upsert-from-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Upsert user from OAuth',
    description: 'Create or update user from OAuth authentication',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        supabaseId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        avatarUrl: { type: 'string' },
      },
      required: ['email', 'supabaseId'],
    },
  })
  @ApiResponse({ status: 200, description: 'User upserted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  upsertFromAuth(
    @Body()
    data: {
      email: string;
      supabaseId: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    },
  ) {
    return this.usersService.upsertFromAuth(data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user', description: 'Delete a user by their ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
