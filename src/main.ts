import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up global route prefix for all controllers (e.g., /api/listings, /api/auth)
  // Note: Your controllers already use this prefix, but setting it globally is cleaner.
  app.setGlobalPrefix('api'); 
  
  // Re-enable CORS for local development and simplified testing
  app.enableCors(); // <-- FIX: Re-enabling CORS

  // Apply global validation pipe using class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip properties that do not have any decorators
      transform: true, // Automatically transform payloads to be objects of the DTO classes
    }),
  );

  // --- Swagger API Documentation Setup ---
  const config = new DocumentBuilder()
    .setTitle('Mini Listing & Booking API')
    .setDescription('API documentation for the short-stay rental platform backend.')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Serve documentation at http://localhost:3000/api/docs
  SwaggerModule.setup('api/docs', app, document);
  // ----------------------------------------

  await app.listen(4000);
}
bootstrap();