import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type ListingDocument = HydratedDocument<Listing>;

/**
 * Listing Schema representing a short-stay rental property.
 * Fulfills assessment requirements: title, description, price, city, photos, and host.
 */
@Schema({ timestamps: true })
export class Listing {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  @Prop({ type: Number, min: 0 })
  pricePerNight: number; // Price per night, in a currency unit (e.g., NGN)

  // Array of photo URLs
  @Prop({ type: [String], default: [] })
  photoUrls: string[];

  // Reference the User schema as the host
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  host: User;
  
  // Virtual property to display host's name based on the User reference
  hostName: string; 
}

export const ListingSchema = SchemaFactory.createForClass(Listing);

// Configure the schema to include the hostName virtual property when populated
ListingSchema.virtual('hostName').get(function() {
  // If the host field is populated, we can access the firstName
  if (this.host && typeof this.host !== 'string' && this.host.firstName) {
    return this.host.firstName;
  }
  return 'Unknown Host';
});