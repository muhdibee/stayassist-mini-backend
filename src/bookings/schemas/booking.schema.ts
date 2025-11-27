import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Listing } from 'src/listings/schemas/listing.schema';

export type BookingDocument = HydratedDocument<Booking>;

/**
 * Booking Schema representing a single reservation for a listing.
 */
@Schema({ timestamps: true })
export class Booking {
  // Reference to the Listing being booked
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true })
  listing: Listing;

  // Reference to the User making the booking (the traveler)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;
  
  // Dates for the reservation (stored as standard JavaScript Date objects)
  @Prop({ type: Date, required: true })
  checkInDate: Date;

  @Prop({ type: Date, required: true })
  checkOutDate: Date;

  @Prop({ type: Number, required: true, min: 1 })
  numberOfGuests: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalPrice: number; // Final calculated price for the stay
}

export const BookingSchema = SchemaFactory.createForClass(Booking);