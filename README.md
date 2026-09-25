# BookingApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Test organization

All tests live under `tests/`, grouped by test type and feature:

```text
tests/
  unit/
    auth/                  # Auth service, guard, user model, login, registration
    header/                # Header actions and session changes
    shared/                # Shared form fields
  integration/
    routing/               # Application routes and authentication flow
  e2e/                     # Browser authentication journeys
```

Angular's test discovery patterns in `angular.json` are relative to `src/`, so they
use `../tests/`. TypeScript's includes in `tsconfig.spec.json` are relative to the
repository root. Playwright discovers browser tests in `tests/e2e/`.

## Running unit and integration tests

To execute unit and integration tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm test -- --watch=false
```

## Running end-to-end tests

Install Playwright's Chromium browser once after installing npm dependencies:

```bash
npx playwright install chromium
```

Run the browser tests:

```bash
npm run test:e2e
```

Playwright starts and stops a dedicated development server at `http://127.0.0.1:4201`.
These tests cover login, session restoration after refresh, logout, protected dashboard
access, failed-login retries, and registration. Firebase responses are mocked, so no
real credentials or running backend are required. Hotel functionality is excluded.
Failure screenshots and traces are saved in the ignored `test-results/` directory.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
