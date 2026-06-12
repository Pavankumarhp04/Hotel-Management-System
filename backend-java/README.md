# Hotel Management System - Java Backend

This is the Spring Boot implementation of the Hotel Management System backend.

## Prerequisites
- JDK 17 or higher
- Maven 3.8+

## Setup
1. Open this folder in VS Code or IntelliJ IDEA.
2. The project uses SQLite, so it will continue to use the same `hotel.db` located in the root of the project.
3. Configure the `spring.datasource.url` in `src/main/resources/application.properties` if you move the database file.

## Running the app
```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080`.

## API Endpoints
- `GET /api/rooms` - List all rooms
- `GET /api/bookings` - List all bookings
- `GET /api/customers` - List all customers
- `GET /api/reports/dashboard` - Get dashboard statistics
