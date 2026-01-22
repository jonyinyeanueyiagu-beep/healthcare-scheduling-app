# Healthcare Scheduling Application - Backend API

A Spring Boot-based REST API for managing healthcare scheduling, including user authentication, client management, appointment scheduling, and automated voice call notifications via Azure Communication Services.

## Features

- **JWT-based Authentication & Authorization**
  - Secure login and registration
  - Role-based access control (Schedulers and Healthcare Workers)
  
- **User Management**
  - Create and manage users with different roles
  - Schedulers can create and manage schedules
  - Healthcare workers can view their assigned schedules

- **Client Management**
  - Full CRUD operations for client records
  - Store client information, location, and care requirements
  - Track active/inactive clients

- **Appointment Scheduling**
  - Create and manage appointments
  - Assign healthcare workers to clients
  - Track appointment status (scheduled, confirmed, in progress, completed, etc.)
  - Record check-in/check-out times
  
- **Automated Voice Notifications**
  - Send voice call notifications to clients via Azure Communication Services
  - Bulk notification support
  - Track notification status

- **API Documentation**
  - Interactive Swagger UI
  - OpenAPI 3.0 specification

## Technology Stack

- **Language**: Java 17
- **Framework**: Spring Boot 3.2.1
- **Database**: MySQL (production) / H2 (development)
- **Authentication**: JWT (JSON Web Tokens)
- **Build Tool**: Maven
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Voice Notifications**: Azure Communication Services
- **ORM**: Spring Data JPA with Hibernate

## Prerequisites

Before running this application, ensure you have the following installed:

- Java 17 or higher
- Maven 3.8+
- MySQL 8.0+ (for production) or use H2 for development
- Azure account with Communication Services (for voice notifications)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jonyinyeanueyiagu-beep/healthcare-scheduling-app.git
cd healthcare-scheduling-app/backend
```

### 2. Database Setup

#### Option A: Using MySQL (Production)

1. Install MySQL if not already installed
2. Create a database:

```sql
CREATE DATABASE healthcare_scheduler;
```

3. Update `src/main/resources/application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/healthcare_scheduler
spring.datasource.username=your_username
spring.datasource.password=your_password
```

#### Option B: Using H2 (Development)

For development and testing, you can use the H2 in-memory database by activating the dev profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Configure JWT Secret

Update the JWT secret in `application.properties` for production:

```properties
jwt.secret=your-very-long-and-secure-secret-key-for-production
jwt.expiration=86400000
```

**Important**: Use a strong, randomly generated secret key in production (at least 256 bits).

### 4. Configure Azure Communication Services (for Voice Notifications)

1. Create an Azure account at https://azure.microsoft.com
2. Create a Communication Services resource in Azure Portal
3. Get your connection string from the resource's "Keys" section
4. Acquire a phone number from the "Phone Numbers" section
5. Update `application.properties`:

```properties
azure.communication.connection-string=endpoint=https://<resource-name>.communication.azure.com/;accesskey=<access-key>
azure.communication.phone-number=+1234567890
azure.communication.callback-url=https://your-domain.com/api/callbacks/voice
```

**Note**: Without Azure Communication Services credentials, the application will still run, but voice notifications will fail.

### 5. Build the Application

```bash
mvn clean install
```

### 6. Run the Application

```bash
mvn spring-boot:run
```

Or run the JAR file:

```bash
java -jar target/scheduler-backend-1.0.0.jar
```

The application will start on `http://localhost:8080`

## API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### User Management

- `GET /api/users` - Get all users (Scheduler only)
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/healthcare-workers` - Get all healthcare workers (Scheduler only)
- `DELETE /api/users/{id}` - Delete user (Scheduler only)

### Client Management

- `GET /api/clients` - Get all clients
- `GET /api/clients/{id}` - Get client by ID
- `POST /api/clients` - Create new client (Scheduler only)
- `PUT /api/clients/{id}` - Update client (Scheduler only)
- `DELETE /api/clients/{id}` - Delete client (Scheduler only)
- `GET /api/clients/active` - Get active clients

### Appointment/Schedule Management

- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/{id}` - Get appointment by ID
- `POST /api/appointments` - Create new appointment (Scheduler only)
- `PUT /api/appointments/{id}` - Update appointment (Scheduler only)
- `DELETE /api/appointments/{id}` - Delete appointment (Scheduler only)
- `GET /api/appointments/client/{clientId}` - Get appointments by client
- `GET /api/appointments/careworker/{careWorkerId}` - Get appointments by care worker
- `GET /api/appointments/status/{status}` - Get appointments by status
- `PATCH /api/appointments/{id}/status` - Update appointment status

### Voice Notifications

- `POST /api/notifications/voice/{appointmentId}` - Send voice notification for specific appointment (Scheduler only)
- `POST /api/notifications/voice/bulk` - Send bulk voice notifications (Scheduler only)

## Authentication

All endpoints except `/api/auth/**` and Swagger documentation require authentication.

### Getting a Token

1. Register a user:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "scheduler1",
    "email": "scheduler@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "role": "SCHEDULER"
  }'
```

2. Login to get token:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "scheduler1",
    "password": "password123"
  }'
```

3. Use the token in subsequent requests:
```bash
curl -X GET http://localhost:8080/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Roles

- **SCHEDULER**: Can create, update, and view all schedules, clients, and users
- **HEALTHCARE_WORKER**: Can view their assigned schedules and update appointment status

## Environment Variables

You can override configuration using environment variables:

```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/healthcare_scheduler
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=root
export JWT_SECRET=your-secret-key
export AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://your-resource.communication.azure.com/;accesskey=your-key
export AZURE_COMMUNICATION_PHONE_NUMBER=+1234567890
export AZURE_COMMUNICATION_CALLBACK_URL=https://your-domain.com/api/callbacks/voice
```

## Database Schema

The application will automatically create the following tables:

- `users` - User accounts with roles
- `clients` - Client information
- `appointments` - Scheduled appointments linking clients and healthcare workers

## Development

### Running Tests

```bash
mvn test
```

### Using H2 Console (Development Mode)

When running in dev profile, access H2 console at:
http://localhost:8080/h2-console

- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (leave empty)

## Production Deployment

1. Update `application.properties` with production database credentials
2. Set a secure JWT secret
3. Configure Azure Communication Services credentials
4. Build the application: `mvn clean package -DskipTests`
5. Run with production profile: `java -jar target/scheduler-backend-1.0.0.jar --spring.profiles.active=prod`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Verify database credentials in `application.properties`
   - Check if database exists

2. **JWT Token Errors**
   - Ensure JWT secret is at least 256 bits (32 characters)
   - Token expires after 24 hours by default

3. **Azure Communication Services Errors**
   - Verify connection string is correct
   - Ensure phone numbers are in E.164 format (+1234567890)
   - Check Azure resource is active and has available credits
   - Verify callback URL is accessible from the internet

4. **Port Already in Use**
   - Change server port in `application.properties`: `server.port=8081`

## Security Considerations

- Always use HTTPS in production
- Change default JWT secret to a strong, random key
- Store sensitive credentials in environment variables, not in code
- Implement rate limiting for production
- Regular security updates for dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the Apache License 2.0

## Support

For issues and questions, please open an issue on GitHub or contact support@healthcarescheduler.com

## Acknowledgments

- Spring Boot team for the excellent framework
- Azure Communication Services for voice notification API
- SpringDoc for API documentation tools
