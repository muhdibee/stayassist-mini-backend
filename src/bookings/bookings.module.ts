import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { ListingsModule } from 'src/listings/listings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    forwardRef(() => ListingsModule), // Handle circular dependency: BookingsService depends on ListingsService
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService], // Export so it can be used for date availability checks in ListingsModule
})
export class BookingsModule {}