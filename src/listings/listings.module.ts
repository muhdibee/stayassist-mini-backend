import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { Listing, ListingSchema } from './schemas/listing.schema';
import { UsersModule } from 'src/users/users.module';
import { BookingsModule } from 'src/bookings/bookings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
    UsersModule, // Inject UsersModule so ListingsService can use UsersService for seeding/host lookup
    forwardRef(() => BookingsModule), // Handle circular dependency: ListingsService depends on BookingsService
  ],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService], // Export the service so other modules (like Booking) can use it
})
export class ListingsModule {}