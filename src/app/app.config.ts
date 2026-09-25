import { provideHttpClient } from '@angular/common/http';

import { ApplicationConfig } from '@angular/core';

import {
  provideRouter,
  withInMemoryScrolling,
} from '@angular/router';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),

    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
  ],
};