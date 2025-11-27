import { Controller, Post, Body, Get, UseGuards, Request, Param, NotFoundException, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { SearchListingsDto } from './dto/search-listings.dto'; // <-- Import new DTO
import { Listing } from './schemas/listing.schema';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  /**
   * Requirement 2 & 3: Display a list of rental properties, supporting search/filter by city and date.
   */
  @Get()
  async findAll(@Query() searchListingsDto: SearchListingsDto): Promise<Listing[]> {
    // Pass query parameters to the service for dynamic filtering
    return this.listingsService.findAll(searchListingsDto);
  }

  /**
   * Requirement 4: Listing Details Page.
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Listing> {
    const listing = await this.listingsService.findOne(id);
    if (!listing) {
      throw new NotFoundException(`Listing with ID "${id}" not found.`);
    }
    return listing;
  }

  /**
   * Protected route to create a new listing.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createListingDto: CreateListingDto, @Request() req: any): Promise<Listing> {
    const hostId = req.user.userId; 
    return this.listingsService.create(createListingDto, hostId);
  }
}