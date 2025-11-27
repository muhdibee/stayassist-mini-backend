import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './schemas/booking.schema';

@Controller('bookings')
// All booking routes require a logged-in user
@UseGuards(AuthGuard('jwt'))
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Requirement 5: Logged-in users can create a booking.
   * Endpoint: POST /api/bookings
   */
  @Post()
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req: any): Promise<Booking> {
    // Traveler ID is extracted from the JWT payload attached to req.user
    const userId = req.user.userId; 
    return this.bookingsService.create(createBookingDto, userId);
  }

  /**
   * Retrieve all bookings for the authenticated user (traveler history).
   * Endpoint: GET /api/bookings
   */
  @Get()
  async findAllByUser(@Request() req: any): Promise<Booking[]> {
    const userId = req.user.userId;
    return this.bookingsService.findBookingsByUser(userId);
  }
}