# Use an official Maven image to build the Spring Boot app
FROM maven:3.8.4-openjdk-17 AS build

# Set the working Directory
WORKDIR /app

# Copy the pom. ml and install dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Use an official OpenJDK image to run the application
FROM eclipse-temurin:17-jdk

#Set the working directory
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/nextstep-backend-1.0.0.jar .

# Expose Port 8080
EXPOSE 8080

# Specify the command to run the application
ENTRYPOINT ["java", "-jar", "/app/nextstep-backend-1.0.0.jar"]



