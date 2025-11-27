import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { ListingsModule } from 'src/listings/listings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ListingsModule, // Required to fetch listing details (price, capacity) for validation
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService], // Export so it can be used for date availability checks in ListingsModule
})
export class BookingModule {}