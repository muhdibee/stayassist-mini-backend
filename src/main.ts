import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser'; // <-- Import cookieParser

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the ConfigService instance after the application context is created
  const configService = app.get(ConfigService);
  // Read the FRONTEND_ORIGIN from the environment variables
  const frontendOrigin = configService.get<string>('FRONTEND_ORIGIN');
  console.log(`CORS Origin set to: ${frontendOrigin}`);

  // ----------------------------------------------------
  // Middleware for parsing cookies (required for jwt cookie extraction)
  app.use(cookieParser()); // <-- Add cookie-parser middleware
  // ----------------------------------------------------

  // FIX: Explicit CORS configuration using environment variable
  app.enableCors({
    origin: frontendOrigin,
    secure: true,
    SameSite: "None",
    HttpOnly: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true, 
  });
  
  // Apply global validation pipe using class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      transform: true, 
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
  // app.setGlobalPrefix('api'); 

  // Listening on port 4000
  await app.listen(4000);
}
bootstrap();