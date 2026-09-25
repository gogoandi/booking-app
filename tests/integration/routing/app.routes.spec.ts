import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appRoutes } from '../../../src/app/app.routes';
import { AuthService } from '../../../src/app/auth/auth.service';
import { LoginComponent } from '../../../src/app/auth/login/login.component';
import { RegisterComponent } from '../../../src/app/auth/register/register.component';
import { DashboardComponent } from '../../../src/app/dashboard/dashboard.component';

describe('Application authentication routes', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(appRoutes), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(async () => {
    // Real session timers are cancelled while the router is still available.
    TestBed.inject(AuthService).logout();
    await TestBed.inject(Router).navigateByUrl('/login');
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  function saveSession(expirationDate: Date) {
    localStorage.setItem(
      'userData',
      JSON.stringify({
        email: 'guest@example.com',
        userId: 'user-1',
        token: 'test-token',
        expirationDate: expirationDate.toISOString(),
      }),
    );
  }

  it('redirects a guest visiting the actual dashboard route to Login', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/dashboard', LoginComponent);

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement!.querySelector('h2')!.textContent).toContain('Sign in');
  });

  it('makes login and registration routes accessible to guests', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/login', LoginComponent);
    expect(TestBed.inject(Router).url).toBe('/login');

    await harness.navigateByUrl('/register', RegisterComponent);
    expect(TestBed.inject(Router).url).toBe('/register');
  });

  it('restores a valid session before deciding whether dashboard access is allowed', async () => {
    saveSession(new Date(Date.now() + 60000));
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/dashboard', DashboardComponent);

    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(TestBed.inject(AuthService).user.value?.email).toBe('guest@example.com');
  });

  it('rejects an expired saved session when navigating to the dashboard', async () => {
    saveSession(new Date(Date.now() - 1000));
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/dashboard', LoginComponent);

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(localStorage.getItem('userData')).toBeNull();
  });

  it('allows access after a successful login and denies access again after logout', async () => {
    const harness = await RouterTestingHarness.create();
    const login = await harness.navigateByUrl('/login', LoginComponent);
    login.loginForm.setValue({ loginEmail: 'guest@example.com', loginPassword: 'Password1!' });
    login.onSubmit();

    TestBed.inject(HttpTestingController)
      .expectOne(
        (request) =>
          request.method === 'POST' && request.url.includes('accounts:signInWithPassword'),
      )
      .flush({
        kind: 'identitytoolkit#VerifyPasswordResponse',
        email: 'guest@example.com',
        localId: 'user-1',
        idToken: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresIn: '3600',
      });
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(harness.routeDebugElement!.componentInstance).toBeInstanceOf(DashboardComponent);

    TestBed.inject(AuthService).logout();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(localStorage.getItem('userData')).toBeNull();

    await harness.navigateByUrl('/dashboard', LoginComponent);
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
