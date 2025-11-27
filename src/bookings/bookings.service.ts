import { Injectable, BadRequestException, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListingsService } from 'src/listings/listings.service'; // <-- Required for circular dependency

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    // Use @Inject(forwardRef) to handle the circular dependency between ListingsModule and BookingsModule
    @Inject(forwardRef(() => ListingsService))
    private listingsService: ListingsService, 
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
   * Finds any existing bookings for a listing that conflict with the requested dates.
   * @param listingId The ID of the listing.
   * @param checkInDate The requested check-in date.
   * @param checkOutDate The requested check-out date.
   * @returns true if conflict exists, false otherwise.
   */
  async checkConflict(listingId: string, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
    const conflict = await this.bookingModel.findOne({
      listing: listingId,
      $or: [
        // Case 1: Existing booking starts during the new requested stay
        { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } },
        // Case 2: New requested stay is entirely within an existing booking
        { checkInDate: { $gte: checkInDate, $lt: checkOutDate } }, // Corrected condition for precise range
        // Case 3: New requested stay contains the entire existing booking
        { checkInDate: { $lte: checkInDate }, checkOutDate: { $gte: checkOutDate } },
      ],
    }).exec();

    return !!conflict;
  }

  /**
   * Helper function used by the ListingsService to find all bookings that conflict
   * with a given date range, returning the IDs of the booked listings.
   * @param checkInDate The requested check-in date (Date object).
   * @param checkOutDate The requested check-out date (Date object).
   * @returns An array of conflicting Booking documents.
   */
  async findConflictingBookings(checkInDate: Date, checkOutDate: Date): Promise<BookingDocument[]> {
    // MongoDB query to find any booking where the date range overlaps with the requested range
    return this.bookingModel.find({
        $or: [
          // Existing booking starts before checkOut and ends after checkIn
          { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } },
        ],
    }).select('listing').exec(); // Only fetch the listing ID for efficiency
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
    // Check if check-out date is today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (checkOut.getTime() <= today.getTime()) {
      throw new BadRequestException('The booking period must be in the future.');
    }


    // 2. Get Listing Price and Capacity
    const listing = await this.listingsService.findOne(listingId);
    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found.`);
    }

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