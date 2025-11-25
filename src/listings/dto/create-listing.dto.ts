import { IsString, IsNotEmpty, IsNumber, Min, IsArray, IsUrl, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for creating a new Listing.
 * Note: The 'host' ID will be derived from the JWT payload in the controller.
 */
export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number) // Ensure the incoming value is treated as a number
  readonly pricePerNight: number;

  @IsArray()
  @IsUrl({}, { each: true }) // Validate that each item in the array is a valid URL
  @IsOptional()
  readonly photoUrls: string[];
}