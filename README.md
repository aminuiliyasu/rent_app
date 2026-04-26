# Rentify Backend API

Rentify is a two-sided online marketplace that connects individuals and businesses who need to rent items or hire workers on a short-term basis.

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Security**: Spring Security with JWT
- **Build Tool**: Maven

## Features

- User Authentication (Email/Password, OAuth2, OTP)
- KYC Verification
- Listing Management (Items & Workers)
- Search & Discovery
- Booking System
- Payment Integration (Stripe & Paystack)
- Messaging System
- Reviews & Ratings
- Admin Panel

## Setup Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Redis 6+

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE rentify_db;
```

2. Update `application.yml` with your database credentials:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/rentify_db
    username: your_username
    password: your_password
```

### Redis Setup

1. Start Redis server:
```bash
redis-server
```

2. Update `application.yml` if Redis is not on localhost:
```yaml
spring:
  redis:
    host: localhost
    port: 6379
```

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Database
DB_USERNAME=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-256-bit-secret-key-change-this-in-production-minimum-32-characters

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# AWS S3
AWS_S3_BUCKET=rentify-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...

# Google Maps
GOOGLE_MAPS_API_KEY=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# OAuth2
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Running the Application

1. Build the project:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Listings
- `GET /api/v1/listings` - Search/browse listings
- `GET /api/v1/listings/:id` - Get listing detail
- `POST /api/v1/listings` - Create new listing (Auth required)
- `PUT /api/v1/listings/:id` - Update listing (Auth required)
- `DELETE /api/v1/listings/:id` - Delete listing (Auth required)

### Bookings
- `POST /api/v1/bookings` - Create a booking (Auth required)
- `GET /api/v1/bookings/:id` - Get booking details (Auth required)
- `POST /api/v1/bookings/:id/confirm` - Owner confirms booking (Auth required)
- `POST /api/v1/bookings/:id/complete` - Mark booking complete (Auth required)

### Payments
- `POST /api/v1/payments/checkout` - Initiate payment session (Auth required)
- `POST /api/v1/payments/webhook` - Stripe/Paystack webhook

### Messages
- `GET /api/v1/messages/:bookingId` - Get message thread (Auth required)
- `POST /api/v1/messages` - Send a message (Auth required)

### Reviews
- `POST /api/v1/reviews` - Submit a review (Auth required)

### Admin
- `GET /api/v1/admin/users` - List all users (Admin only)
- `PUT /api/v1/admin/users/:id/ban` - Ban a user (Admin only)

## Project Structure

```
src/main/java/com/rentify/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/             # Data Transfer Objects
├── exception/       # Exception handlers
├── model/           # Entity models
├── repository/      # JPA repositories
├── security/        # Security configuration
├── service/         # Business logic
└── util/            # Utility classes
```

## Development

### Code Style
- Follow Java naming conventions
- Use Lombok for reducing boilerplate
- Use MapStruct for DTO mapping

### Testing
```bash
mvn test
```

## License

Confidential - Rentify Platform v1.0
