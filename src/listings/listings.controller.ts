import { Controller, Post, Body, Get, UseGuards, Request, Param, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { Listing } from './schemas/listing.schema';

@Controller('api/listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  /**
   * Requirement 2: Display a list of rental properties. (Public access)
   */
  @Get()
  async findAll(): Promise<Listing[]> {
    return this.listingsService.findAll();
  }

  /**
   * Requirement 4: Listing Details Page. (Public access)
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
   * Protected route to create a new listing. Only available to logged-in users (hosts).
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createListingDto: CreateListingDto, @Request() req: any): Promise<Listing> {
    // Host ID is extracted from the JWT payload attached to req.user by JwtStrategy
    const hostId = req.user.userId; 
    return this.listingsService.create(createListingDto, hostId);
  }
}