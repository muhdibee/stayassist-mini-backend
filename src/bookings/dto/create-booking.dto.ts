import { IsString, IsNotEmpty, IsNumber, IsISO8601, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for creating a new Booking.
 */
export class CreateBookingDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly listingId: string;

  @IsISO8601({ strict: true })
  @IsNotEmpty()
  readonly checkInDate: string;

  @IsISO8601({ strict: true })
  @IsNotEmpty()
  readonly checkOutDate: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number) // Ensure the incoming value is treated as a number
  readonly numberOfGuests: number;
}