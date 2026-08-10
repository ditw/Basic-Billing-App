# Basic Billing App
A modular billing, accounts, and currency management microservice built with the NestJS framework on Node.js.


## Description

**basic-billing-app** is a backend service built with the modern NestJS framework. It provides modular APIs for handling account billing, transactions, and currency configurations, complete with Swagger OpenAPI documentation, Docker containerization support, and automated test coverage.

---

## 1. Prerequisites

Ensure your development environment meets the following minimum version requirements:

* **Node.js:** `v24.15.0` or greater
* **npm:** `v11.12.1` or greater
* **Docker & Docker Desktop:** Optional (required for containerized execution)

## 2. Environment Configuration

The application reads configuration settings from a `.env` file located at the project root.

1. Create a `.env` file in the root directory:
2. 
   ```bash
   cp .env.test .env

    # Application Configuration
    APP_NAME=basic-billing-app
    HOST=localhost
    PORT=3000
    GLOBAL_PREFIX=v1
    NODE_ENV=development

## 3. How to Start the Application

#### Option A: Running Locally with npm

1. Install dependencies:

    ```
    npm install
    ```
2. Start the application:

    ```
    # Development mode with hot-reload
    npm run start:dev

    # Standard start
    npm run start

    # Production mode (after running npm run build)
    npm run start:prod
    ```

#### Option B: Running with Docker Compose

1. Build and start the container in detached mode:

    ```
    docker compose up -d --build
    ```

2. Verify running containers:

    ```
    docker ps
    ```

3. Stop the container:

    ```
    docker compose down
    ```

## 4. Architecture & Structural Highlights
The application follows NestJS best practices and enterprise software patterns:

1. Global Exception Handling: Standardized, consistent HTTP error response payloads across all controllers using centralized exception filters.
2. Barrel File Exports: Clean encapsulations using index.ts barrel exports for modules, services, DTOs, and controllers to keep imports tidy and prevent circular dependency issues.
3. Domain-Driven Modular Structure: Clean separation of concerns into distinct feature modules:
    * currencies: Manages supported currencies and exchange rates.
    * accounts: Manages customer account profiles, balances, and lifecycle states.
    * billing: Processes invoicing, transaction entries, and billing events.

4. Structured Logging: Integrated NestJS Logger service across controllers, services, and exception filters for real-time operational tracing and debug visibility.

## 5. API Documentation & Routing (Swagger UI)

* Swagger OpenAPI Documentation: Accessible at http://localhost:3000/api
* Root URL (/): Automatically redirects users to /api (Swagger UI).
* Application Metadata (/v1): Returns live service health and routing configuration:
    ```
    {
      "service": "basic-billing-app",
      "status": "online",
      "version": "1.0.0",
      "documentation": "/api",
      "apiPrefix": "v1"
    }
    ```

## 6. Testing, Linting & Formatting Commands

#### Linting & Formatting

Integrated ESLint and Prettier tools ensure code style consistency:

  ```
    # Run ESLint to detect and fix code quality issues
    npm run lint

    # Format codebase using Prettier
    npm run format
  ```

#### Automated Testing

The application includes unit test and end-to-end (e2e) test suites powered by Jest and Supertest.

   ```
      # Unit tests
      npm run test

      # End-to-end (e2e) tests
      npm run test:e2e

      # Test coverage report
      npm run test:cov
  ```

## License

Nest is MIT licensed.