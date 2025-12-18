import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(req.user.userId, createBookingDto);
  }

  @Get()
  findAll(
    @Request() req: { user: { userId: string } },
    @Query('role') role: 'guest' | 'host' = 'guest',
  ) {
    return this.bookingsService.findAll(req.user.userId, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.bookingsService.findOne(id, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
    @Body() updateStatusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, req.user.userId, updateStatusDto);
  }

  @Post(':id/review')
  createReview(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
    @Body() reviewDto: { rating: number; comment: string },
  ) {
    return this.bookingsService.createReview(id, req.user.userId, reviewDto);
  }
}
