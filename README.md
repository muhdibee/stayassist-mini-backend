# Mini Listing & Booking Flow API

This project implements a backend API for a simplified short-stay rental
platform (similar to Airbnb) using **NestJS**. It includes user
authentication, property listing management, advanced searching, and a
transactional booking flow with conflict prevention.

## 🚀 Key Technologies

-   **Framework:** NestJS\
-   **Database:** MongoDB (Mongoose ODM)\
-   **Authentication:** JWT (Passport Local & JWT Strategies)\
-   **Data Validation:** Class-Validator & Class-Transformer

## ✨ Implemented Features (Assessment Requirements)

All core requirements for the Mini Listing & Booking Flow assessment
have been successfully implemented:

  ------------------------------------------------------------------------
  Req.         Feature Description                        Status
  ------------ ------------------------------------------ ----------------
  1            User Authentication: Sign up & login using **Complete**
               JWT tokens.                                

  2            Listing Display: Retrieve all rental       **Complete**
               properties.                                

  3            Search & Filter: Search by city and filter **Complete**
               by check-in/check-out (excluding booked    
               properties).                               

  4            Listing Details: Retrieve a single listing **Complete**
               by ID.                                     

  5            Booking Flow: Create bookings with price   **Complete**
               calculation & availability conflict        
               checking.                                  

  Bonus        Seed Data: Auto-creation of a sample host  **Complete**
               user + 6 listings on app startup.          
  ------------------------------------------------------------------------

## 🌐 API Endpoints

Base URL:

    http://localhost:3000/api

## 1. 🔐 Authentication Endpoints

  ------------------------------------------------------------------------------------------------------------------
  Method     Endpoint           Description       Auth Required         Body
  ---------- ------------------ ----------------- --------------------- --------------------------------------------
  POST       `/auth/register`   Create a new user ❌ No                 `{ email, password, firstName, lastName }`
                                account                                 

  POST       `/auth/login`      Authenticate and  ❌ No                 `{ email, password }`
                                return a JWT                            
                                token                                   

  GET        `/auth/profile`    Get authenticated ✅ Yes (JWT)          None
                                user profile                            
  ------------------------------------------------------------------------------------------------------------------

## 2. 📍 Listings Endpoints

  -------------------------------------------------------------------------------
  Method    Endpoint          Description     Auth Required      Query Params
  --------- ----------------- --------------- ------------------ ----------------
  GET       `/listings`       Retrieve all    ❌ No              `city`,
                              listings (with                     `checkInDate`,
                              optional                           `checkOutDate`
                              filters)                           

  GET       `/listings/:id`   Retrieve a      ❌ No              None
                              listing by ID                      
                              (includes host                     
                              info)                              

  POST      `/listings`       Create a new    ✅ Yes (JWT)       None
                              listing (Host                      
                              only)                              
  -------------------------------------------------------------------------------

### Example Search Request

    GET /api/listings?city=New York&checkInDate=2025-10-01T00:00:00.000Z&checkOutDate=2025-10-05T00:00:00.000Z

## 3. 📅 Booking Endpoints

All booking routes require authentication.

  ----------------------------------------------------------------------------------------------------------------------------
  Method     Endpoint      Description       Auth Required        Body
  ---------- ------------- ----------------- -------------------- ------------------------------------------------------------
  POST       `/bookings`   Create a booking  ✅ Yes (JWT)         `{ listingId, checkInDate, checkOutDate, numberOfGuests }`
                           (includes date                         
                           checks & total                         
                           price                                  
                           calculation)                           

  GET        `/bookings`   Retrieve booking  ✅ Yes (JWT)         None
                           history for the                        
                           logged-in user                         
  ----------------------------------------------------------------------------------------------------------------------------

## 🛠️ Setup & Running Locally

### 1. Environment Variables

Create a `.env` file in the project root:

    MONGODB_URI=<Your MongoDB Connection String>
    JWT_SECRET=YOUR_SECURE_SECRET_KEY

### 2. Install Dependencies

``` bash
npm install
```

### 3. Run the Application

``` bash
npm run start:dev
```

The app will start on:

    http://localhost:3000

On startup, the app will automatically seed:

-   one sample host user\
-   six sample listings\
    (if the database is empty)
