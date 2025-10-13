# Spring Boot Backend with MongoDB

This backend is initialized for your project. It uses Spring Boot and connects to MongoDB. You can add REST API endpoints and business logic as needed.

## Setup Steps

1. Make sure you have Java (JDK 17+) and Maven installed.
2. Install MongoDB and start the service (or use MongoDB Atlas for cloud DB).
3. Update `src/main/resources/application.properties` with your MongoDB connection string.
4. Build and run the backend:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

## Folder Structure
- `src/main/java/...` - Java source code
- `src/main/resources/` - Configuration files
- `pom.xml` - Maven dependencies

## Example API
A sample REST controller and MongoDB entity will be added next.
