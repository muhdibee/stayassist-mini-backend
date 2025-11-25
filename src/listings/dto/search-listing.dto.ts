import { IsString, IsOptional, IsISO8601, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for handling search and filter queries on listings.
 */
export class SearchListingsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly city?: string;

  // Use IsISO8601 to ensure the dates are provided in a standardized format (YYYY-MM-DD)
  @IsOptional()
  @IsISO8601({ strict: true })
  readonly checkInDate?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  readonly checkOutDate?: string;

  // NOTE: Other filters (e.g., price range, number of guests) can be added here later.
}