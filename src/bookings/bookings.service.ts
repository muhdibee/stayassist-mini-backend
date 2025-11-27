import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListingsService } from 'src/listings/listings.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private listingsService: ListingsService, // Inject ListingsService to get price data
  ) {}

  /**
   * Calculates the number of nights between two dates.
   */
  private calculateNights(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    // Convert time difference from milliseconds to days
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Checks if there are any existing bookings for a listing that conflict with the requested dates.
   * @param listingId The ID of the listing.
   * @param checkInDate The requested check-in date.
   * @param checkOutDate The requested check-out date.
   * @returns true if conflict exists, false otherwise.
   */
  async checkConflict(listingId: string, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
    // Check for any existing bookings that overlap with the new requested dates.
    const conflict = await this.bookingModel.findOne({
      listing: listingId,
      $or: [
        // Case 1: Existing booking starts during the new requested stay
        { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } },
        // Case 2: New requested stay is entirely within an existing booking
        { checkInDate: { $gte: checkInDate, $lte: checkOutDate } },
      ],
    }).exec();

    return !!conflict;
  }

  /**
   * Creates a new booking for a logged-in user.
   * @param createBookingDto Booking details (listingId, dates, guests).
   * @param userId The ID of the user creating the booking (from JWT).
   * @returns The created booking document.
   */
  async create(createBookingDto: CreateBookingDto, userId: string): Promise<Booking> {
    const { listingId, checkInDate, checkOutDate, numberOfGuests } = createBookingDto;

    // 1. Validate Dates and Existence
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn.getTime() >= checkOut.getTime()) {
      throw new BadRequestException('Check-out date must be after check-in date.');
    }
    if (checkIn.getTime() < new Date().getTime()) {
      throw new BadRequestException('Check-in date cannot be in the past.');
    }

    // 2. Get Listing Price and Capacity
    const listing = await this.listingsService.findOne(listingId);
    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found.`);
    }

    // Optional: Add a check for guest capacity if needed (not explicitly required)

    // 3. Check for Date Conflicts
    const hasConflict = await this.checkConflict(listingId, checkIn, checkOut);
    if (hasConflict) {
      throw new BadRequestException('This listing is already booked for the requested dates.');
    }

    // 4. Calculate Total Price
    const nights = this.calculateNights(checkIn, checkOut);
    const totalPrice = nights * listing.pricePerNight;

    // 5. Create Booking
    const createdBooking = new this.bookingModel({
      listing: listingId,
      user: userId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests,
      totalPrice,
    });

    return createdBooking.save();
  }

  /**
   * Retrieves all bookings made by a specific user.
   */
  async findBookingsByUser(userId: string): Promise<Booking[]> {
    // Populate the listing details for the traveler's history view
    return this.bookingModel.find({ user: userId })
      .populate('listing', 'title city pricePerNight photoUrls') 
      .exec();
  }
}