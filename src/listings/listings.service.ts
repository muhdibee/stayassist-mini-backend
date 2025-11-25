import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Listing, ListingDocument } from './schemas/listing.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ListingsService implements OnModuleInit {
  private readonly logger = new Logger(ListingsService.name);

  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
    private usersService: UsersService, // To find the host for seeding
  ) {}

  /**
   * Executed when the module initializes. Used here for mandatory data seeding.
   */
  async onModuleInit() {
    await this.seedDatabase();
  }

  /**
   * Seeds the database with 6-10 sample listings if none exist.
   * This fulfills the assessment requirement for seeding.
   */
  private async seedDatabase() {
    const listingCount = await this.listingModel.countDocuments().exec();
    if (listingCount > 0) {
      this.logger.log(`Database already contains ${listingCount} listings. Skipping seed.`);
      return;
    }

    this.logger.log('Seeding database with sample listings...');
    
    // 1. Find an existing user to act as the host
    const hostUser = await this.usersService.findAnyUser();

    if (!hostUser) {
        this.logger.error('No users found. Cannot seed listings without a host. Please register a user first.');
        return;
    }

    const sampleListings: CreateListingDto[] = [
      {
        title: 'Modern Downtown Loft',
        description: 'Chic loft in the heart of the city with skyline views.',
        city: 'New York',
        pricePerNight: 250,
        photoUrls: ['https://placehold.co/600x400/003b46/ffffff?text=NY+Loft+1'],
      },
      {
        title: 'Cozy Beach Bungalow',
        description: 'Steps away from the sand. Perfect for a quiet getaway.',
        city: 'Miami',
        pricePerNight: 180,
        photoUrls: ['https://placehold.co/600x400/07575b/ffffff?text=Beach+Bungalow'],
      },
      {
        title: 'Mountain View Cabin Retreat',
        description: 'Rustic cabin with stunning views, great for hiking.',
        city: 'Denver',
        pricePerNight: 120,
        photoUrls: ['https://placehold.co/600x400/c4dfe6/000000?text=Mountain+Cabin'],
      },
      {
        title: 'Spacious Family Home',
        description: 'Four bedrooms, fenced yard, ideal for large families.',
        city: 'Chicago',
        pricePerNight: 300,
        photoUrls: ['https://placehold.co/600x400/66a5ad/ffffff?text=Family+Home'],
      },
      {
        title: 'Urban Studio with Balcony',
        description: 'Small but functional studio apartment with a private balcony.',
        city: 'New York',
        pricePerNight: 150,
        photoUrls: ['https://placehold.co/600x400/94b4c4/000000?text=Studio+2'],
      },
      {
        title: 'Historic Victorian Manor',
        description: 'Elegantly preserved historic home near the waterfront.',
        city: 'San Francisco',
        pricePerNight: 400,
        photoUrls: ['https://placehold.co/600x400/1d4044/ffffff?text=Victorian+Manor'],
      },
    ];

    const listingsToInsert = sampleListings.map(listing => ({
      ...listing,
      host: hostUser._id, // Assign the user ID to the host field
    }));

    await this.listingModel.insertMany(listingsToInsert);
    this.logger.log(`Successfully seeded ${sampleListings.length} new listings.`);
  }

  /**
   * Creates a new listing. This will be used by the host to list their property.
   */
  async create(createListingDto: CreateListingDto, hostId: string): Promise<Listing> {
    const createdListing = new this.listingModel({
      ...createListingDto,
      host: hostId,
    });
    return createdListing.save();
  }

  /**
   * Retrieves all listings, populating the 'host' field to display hostName.
   */
  async findAll(): Promise<Listing[]> {
    // .populate('host', 'firstName lastName') fetches only the necessary host fields
    // This allows the virtual 'hostName' property to work on the schema.
    return this.listingModel.find().populate('host', 'firstName lastName').exec();
  }

  /**
   * Retrieves a single listing by ID.
   */
  async findOne(id: string): Promise<Listing | null> {
    return this.listingModel.findById(id).populate('host', 'firstName lastName').exec();
  }
}