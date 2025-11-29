import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config'; // <-- Import ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the ConfigService instance after the application context is created
  const configService = app.get(ConfigService);
  // Read the FRONTEND_ORIGIN from the environment variables
  const frontendOrigin = configService.get<string>('FRONTEND_ORIGIN');

  // ----------------------------------------------------
  // FIX: Explicit CORS configuration using environment variable
  app.enableCors({
    origin: frontendOrigin, // <-- Dynamically set the origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true, 
  });
  // ----------------------------------------------------
  
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
  
  // Swagger is set up BEFORE the global prefix.
  SwaggerModule.setup('api/docs', app, document);
  // ----------------------------------------

  // Set up global route prefix for all controllers (e.g., /api/listings, /api/auth)
  app.setGlobalPrefix('api'); 

  // Listening on port 4000
  await app.listen(4000);
}
bootstrap();