# Booking App

A modern hotel booking frontend built with Angular.

The application allows users to browse available hotels, view individual hotel details, search by destination and dates, authenticate using Firebase, and access protected dashboard functionality.

The frontend communicates with a separate Spring Boot REST API for hotel and booking data.

## Features

- Hotel listing
- Individual hotel detail pages
- Hotel search by city and dates
- User registration
- User login and logout
- Firebase Authentication
- Persistent authentication sessions
- Protected dashboard routes
- User dashboard
- Notifications section
- Responsive interface
- REST API integration
- Loading and error states
- Unit, integration, and end-to-end testing

## Tech Stack

### Frontend

- Angular 21
- TypeScript
- Angular Router
- Angular Reactive Forms
- Angular Signals
- Angular HttpClient
- CSS
- Firebase Authentication
- Firebase Hosting

### Backend

The backend API is developed separately using:

- Spring Boot
- Spring MVC
- Spring Data JPA
- Hibernate
- MySQL
- REST APIs

The Spring Boot backend is maintained separately from this frontend repository.

## Application Architecture

The frontend communicates with the backend through HTTP requests.

```text
Angular Frontend
       |
       | HTTP / JSON
       v
Spring Boot REST API
       |
       | JPA / Hibernate
       v
     MySQL
```

Firebase is used separately for user authentication.

```text
Angular
   |
   +---- Firebase Authentication
   |
   +---- Spring Boot REST API
                |
                v
              MySQL
```

## API

During local development, the backend API runs at:

```text
http://localhost:8081/api
```

Example endpoints:

```text
GET /api/hotels
GET /api/hotels/{id}

GET /api/bookings
GET /api/bookings/{id}

POST /api/bookings
PUT /api/bookings/{id}
DELETE /api/bookings/{id}
```

The API base URL is centralized in the Angular environment configuration so it can be changed easily between development and production.

Example:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api'
};
```

## Hotel Model

The frontend currently uses the following hotel structure:

```ts
export interface HotelModel {
  id: number;
  hotelName: string;
  hotelAddress: string;
  hotelCity: string;
  hotelPricePerNight: number;
  hotelImageUrl: string;
}
```

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Angular CLI
- Git

Check your installations:

```bash
node --version
npm --version
ng version
git --version
```

## Clone the Repository

```bash
git clone https://github.com/gogoandi/booking-app.git
```

Enter the project directory:

```bash
cd booking-app
```

Install dependencies:

```bash
npm install
```

## Development Server

Start the Angular development server:

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

Angular automatically reloads the application whenever source files change.

## Backend Requirement

Hotel and booking functionality requires the Spring Boot backend to be running.

By default, the frontend expects the API at:

```text
http://localhost:8081
```

Start the Spring Boot application before using functionality that depends on backend data.

The Angular application and Spring Boot API therefore normally run locally as:

```text
Angular:
http://localhost:4200

Spring Boot:
http://localhost:8081
```

## Authentication

Authentication is handled using Firebase Authentication.

The application supports:

- User registration
- Login
- Logout
- Authentication state restoration after refresh
- Protected routes
- Dashboard access for authenticated users

Angular route guards prevent unauthenticated users from accessing protected areas.

## Routing

Some of the main application routes include:

```text
/
 /login
 /register
 /hotel/:id
 /dashboard
 /dashboard/notifications
```

A hotel detail page uses a dynamic route parameter:

```text
/hotel/:id
```

For example:

```text
/hotel/5
```

loads the hotel with ID `5` from the backend API.

## Building

Create a production build with:

```bash
ng build
```

The compiled application is generated inside:

```text
dist/
```

## Testing

Tests are organized under the `tests/` directory.

```text
tests/
├── unit/
│   ├── auth/
│   ├── header/
│   └── shared/
│
├── integration/
│   └── routing/
│
└── e2e/
```

### Unit and Integration Tests

Run the Vitest test suite with:

```bash
npm test -- --watch=false
```

### End-to-End Tests

The project uses Playwright for browser-based end-to-end tests.

Install Chromium once:

```bash
npx playwright install chromium
```

Run the tests:

```bash
npm run test:e2e
```

Playwright starts a dedicated Angular development server at:

```text
http://127.0.0.1:4201
```

The E2E tests currently cover authentication-related flows including:

- Login
- Registration
- Session restoration
- Logout
- Protected dashboard access
- Failed login attempts

Firebase responses are mocked during these tests, so real user credentials are not required.

Test screenshots, traces, and failure information are stored in:

```text
test-results/
```

## Deployment

The Angular frontend is deployed using Firebase Hosting.

The production frontend can be built with:

```bash
ng build
```

and deployed through the configured Firebase deployment workflow.

The Spring Boot REST API and MySQL database are deployed separately from the Angular frontend.

## Project Structure

A simplified overview of the Angular application:

```text
src/
├── app/
│   ├── auth/
│   ├── dashboard/
│   ├── header/
│   ├── hero/
│   ├── hotels/
│   │   ├── hotel/
│   │   ├── single-hotel/
│   │   ├── hotel.model.ts
│   │   └── hotels.service.ts
│   │
│   ├── login/
│   ├── register/
│   ├── search-engine/
│   ├── shared/
│   ├── app.routes.ts
│   └── app.config.ts
│
├── environments/
├── main.ts
└── styles.css
```

The exact structure may evolve as additional booking functionality is implemented.

## Current Development

The project is currently being expanded from an authentication-focused Angular application into a complete booking application.

Current development areas include:

- Spring Boot REST API integration
- MySQL persistence
- Hotel detail pages
- Booking functionality
- Search and filtering
- API documentation
- Improved frontend/backend integration

## Repository

Frontend source code:

https://github.com/gogoandi/booking-app

## License

This project is currently intended for learning and personal development purposes.
