import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Listing, ListingDocument } from './schemas/listing.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { SearchListingsDto } from './dto/search-listings.dto'; // <-- Import new DTO
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ListingsService implements OnModuleInit {
  private readonly logger = new Logger(ListingsService.name);

  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
    private usersService: UsersService,
  ) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  private async seedDatabase() {
    const listingCount = await this.listingModel.countDocuments().exec();
    if (listingCount > 0) {
      this.logger.log(`Database already contains ${listingCount} listings. Skipping seed.`);
      return;
    }

    this.logger.log('Seeding database with sample listings...');
    
    const hostUser = await this.usersService.findAnyUser();

    if (!hostUser) {
        this.logger.error('No users found. Cannot seed listings without a host. Please register a user first.');
        return;
    }

    const sampleListings: CreateListingDto[] = [
      {
        title: 'Modern Downtown Loft',
        description: 'Chic loft in the heart of the city with skyline views.',
        city: 'Lagos',
        pricePerNight: 250,
        photoUrls: ['https://placehold.co/600x400/003b46/ffffff?text=NY+Loft+1'],
      },
      {
        title: 'Cozy Beach Bungalow',
        description: 'Steps away from the sand. Perfect for a quiet getaway.',
        city: 'Abuja',
        pricePerNight: 180,
        photoUrls: ['https://placehold.co/600x400/07575b/ffffff?text=Beach+Bungalow'],
      },
      {
        title: 'Mountain View Cabin Retreat',
        description: 'Rustic cabin with stunning views, great for hiking.',
        city: 'Ibadan',
        pricePerNight: 120,
        photoUrls: ['https://placehold.co/600x400/c4dfe6/000000?text=Mountain+Cabin'],
      },
      {
        title: 'Spacious Family Home',
        description: 'Four bedrooms, fenced yard, ideal for large families.',
        city: 'Kano',
        pricePerNight: 300,
        photoUrls: ['https://placehold.co/600x400/66a5ad/ffffff?text=Family+Home'],
      },
      {
        title: 'Urban Studio with Balcony',
        description: 'Small but functional studio apartment with a private balcony.',
        city: 'Benue',
        pricePerNight: 150,
        photoUrls: ['https://placehold.co/600x400/94b4c4/000000?text=Studio+Balcony'],
      },
      {
        title: 'Historic Victorian Manor',
        description: 'Elegantly preserved historic home near the waterfront.',
        city: 'Enugu',
        pricePerNight: 400,
        photoUrls: ['https://placehold.co/600x400/1d4044/ffffff?text=Hooliwood+Studio'],
      },
    ];

    const listingsToInsert = sampleListings.map(listing => ({
      ...listing,
      host: hostUser._id, 
    }));

    await this.listingModel.insertMany(listingsToInsert);
    this.logger.log(`Successfully seeded ${sampleListings.length} new listings.`);
  }

  async create(createListingDto: CreateListingDto, hostId: string): Promise<Listing> {
    const createdListing = new this.listingModel({
      ...createListingDto,
      host: hostId,
    });
    return createdListing.save();
  }

  /**
   * Retrieves all listings, supporting search filters for city and date.
   * @param searchListingsDto Optional search criteria.
   */
  async findAll(searchListingsDto: SearchListingsDto = {}): Promise<Listing[]> {
    const { city, checkInDate, checkOutDate } = searchListingsDto;
    const filters: any = {};

    // 1. Filter by City (Case-insensitive)
    if (city) {
      // Use $regex for case-insensitive partial matching (better for UX)
      filters.city = { $regex: city, $options: 'i' }; 
    }

    // 2. Filter by Dates (Placeholder until Booking Module is built)
    if (checkInDate || checkOutDate) {
      this.logger.warn('Date-based filtering is placeholder and requires the Booking Module to check availability.');
      // When Booking is implemented, this is where complex availability logic will go
      // E.g., filters._id = { $nin: bookedListingIds }
    }

    // Execute the Mongoose query with the dynamic filters
    return this.listingModel.find(filters).populate('host', 'firstName lastName').exec();
  }

  /**
   * Retrieves a single listing by ID.
   */
  async findOne(id: string): Promise<Listing | null> {
    return this.listingModel.findById(id).populate('host', 'firstName lastName').exec();
  }
}