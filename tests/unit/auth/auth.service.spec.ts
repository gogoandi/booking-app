import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AuthService } from '../../../src/app/auth/auth.service';
import { UserModel } from '../../../src/app/auth/user.model';


describe('AuthService', () => {

  const now = new Date('2026-01-01T12:00:00Z');

  const response = {
    kind: 'identitytoolkit#VerifyPasswordResponse',
    email: 'guest@example.com',
    localId: 'user-1',
    idToken: 'test-token',
    refreshToken: 'test-refresh-token',
    expiresIn: '3600',
  };

  const savedUser = {
    email: response.email,
    userId: response.localId,
    token: response.idToken,
    expirationDate: new Date(+now + 3600000).toISOString(),
  };

  let httpTesting: HttpTestingController;

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };


  beforeEach(() => {

    localStorage.clear();

    vi.useFakeTimers({
      toFake: ['Date', 'setTimeout', 'clearTimeout'],
    });

    vi.setSystemTime(now);

    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),

        {
          provide: Router,
          useValue: router,
        },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);

  });


  afterEach(() => {

    httpTesting.verify();

    localStorage.clear();

    vi.clearAllTimers();
    vi.useRealTimers();

    vi.restoreAllMocks();

  });


  function createService(): AuthService {

    const service = TestBed.inject(AuthService);

    service.apiKey = 'test-api-key';

    return service;

  }


  /* ========================================
     REGISTRATION
  ======================================== */

  it('registers a user without creating an authenticated session', async () => {

    const service = createService();

    const result = firstValueFrom(
      service.authRequest(
        'signUp',
        response.email,
        'Password1!',
      ),
    );

    const request = httpTesting.expectOne({
      method: 'POST',
      url: 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=test-api-key',
    });

    expect(request.request.body).toEqual({
      email: response.email,
      password: 'Password1!',
      returnSecureToken: true,
    });


    // Simulate successful Firebase registration.

    request.flush(response);

    expect(await result).toEqual(response);


    // Registration success notification should be enabled.

    expect(service.successSignUp()).toBe(true);


    // Registration should not authenticate the user.

    expect(service.user.value).toBeNull();


    // No session should be saved in localStorage.

    expect(localStorage.getItem('userData')).toBeNull();


    // No automatic logout should be scheduled.

    vi.advanceTimersByTime(3600000);

    expect(router.navigate).not.toHaveBeenCalled();

  });


  /* ========================================
     LOGIN
  ======================================== */

  it('logs in a user and saves the authenticated session', async () => {

    const service = createService();

    const result = firstValueFrom(
      service.authRequest(
        'signInWithPassword',
        response.email,
        'Password1!',
      ),
    );

    const request = httpTesting.expectOne({
      method: 'POST',
      url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=test-api-key',
    });

    expect(request.request.body).toEqual({
      email: response.email,
      password: 'Password1!',
      returnSecureToken: true,
    });


    // Simulate successful Firebase login.

    request.flush(response);

    expect(await result).toEqual(response);


    // A user session should be created.

    expect(service.user.value).toBeInstanceOf(UserModel);

    expect(service.user.value?.email).toBe(response.email);

    expect(service.user.value?.id).toBe(response.localId);

    expect(service.user.value?.getToken).toBe(response.idToken);


    // The session should be persisted.

    expect(
      JSON.parse(localStorage.getItem('userData')!),
    ).toEqual(savedUser);


    // Login should not trigger the registration notification.

    expect(service.successSignUp()).toBe(false);


    // Advance to the token expiration time.

    vi.advanceTimersByTime(3600000);


    // Automatic logout should clear the session.

    expect(service.user.value).toBeNull();

    expect(localStorage.getItem('userData')).toBeNull();

    expect(router.navigate).toHaveBeenCalledExactlyOnceWith([
      '/login',
    ]);

  });


  /* ========================================
     FIREBASE AUTHENTICATION ERRORS
  ======================================== */

  it.each([
    [
      'INVALID_LOGIN_CREDENTIALS',
      'Incorrect email or password. Please check your credentials and try again.',
    ],
    [
      'TOO_MANY_ATTEMPTS_TRY_LATER',
      'Too many attempts. Please try again later.',
    ],
    [
      'EMAIL_EXISTS',
      'The email address is already in use by another account',
    ],
    [
      'OPERATION_NOT_ALLOWED',
      'Password sign-in is disabled for this project.',
    ],
    [
      'UNRECOGNIZED_ERROR',
      'An unknown error has occurred',
    ],
  ])(
    'maps %s to a readable error without creating a session',
    async (code, message) => {

      const service = createService();

      const result = firstValueFrom(
        service.authRequest(
          'signInWithPassword',
          response.email,
          'wrong',
        ),
      );

      httpTesting
        .expectOne((request) => request.method === 'POST')
        .flush(
          {
            error: {
              message: code,
            },
          },
          {
            status: 400,
            statusText: 'Bad Request',
          },
        );

      await expect(result).rejects.toThrow(message);

      expect(service.user.value).toBeNull();

      expect(localStorage.getItem('userData')).toBeNull();

    },
  );


  /* ========================================
     NETWORK ERRORS
  ======================================== */

  it('handles network errors without a Firebase error payload', async () => {

    const service = createService();

    const result = firstValueFrom(
      service.authRequest(
        'signInWithPassword',
        response.email,
        'Password1!',
      ),
    );

    httpTesting
      .expectOne((request) => request.method === 'POST')
      .error(new ProgressEvent('error'));

    await expect(result).rejects.toThrow(
      'An unknown error has occurred',
    );

    expect(service.user.value).toBeNull();

    expect(localStorage.getItem('userData')).toBeNull();

  });


  /* ========================================
     AUTO LOGIN
  ======================================== */

  it('stays logged out when there is no saved session', () => {

    const service = createService();

    expect(service.user.value).toBeNull();

    expect(router.navigate).not.toHaveBeenCalled();

  });


  it('restores a saved session on startup and logs out after its remaining lifetime', () => {

    localStorage.setItem(
      'userData',
      JSON.stringify(savedUser),
    );

    vi.setSystemTime(
      new Date(+now + 1800000),
    );

    const service = createService();


    // Session should be restored.

    expect(service.user.value).toBeInstanceOf(UserModel);

    expect(service.user.value?.email).toBe(savedUser.email);

    expect(service.user.value?.id).toBe(savedUser.userId);

    expect(service.user.value?.getToken).toBe(savedUser.token);


    // Session should remain valid before expiration.

    vi.advanceTimersByTime(1799999);

    expect(service.user.value?.getToken).toBe(savedUser.token);

    expect(router.navigate).not.toHaveBeenCalled();


    // Session should expire after the remaining millisecond.

    vi.advanceTimersByTime(1);

    expect(service.user.value).toBeNull();

    expect(localStorage.getItem('userData')).toBeNull();

    expect(router.navigate).toHaveBeenCalledExactlyOnceWith([
      '/login',
    ]);

  });


  /* ========================================
     INVALID SAVED SESSIONS
  ======================================== */

  it.each([
    [
      'expired',
      JSON.stringify({
        ...savedUser,
        expirationDate: now.toISOString(),
      }),
    ],
    [
      'invalid expiration',
      JSON.stringify({
        ...savedUser,
        expirationDate: 'invalid',
      }),
    ],
    [
      'missing token',
      JSON.stringify({
        ...savedUser,
        token: '',
      }),
    ],
    [
      'malformed JSON',
      '{invalid json',
    ],
  ])(
    'clears a saved session with %s data',
    (_description, storedValue) => {

      vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorage.setItem(
        'userData',
        storedValue,
      );

      const service = createService();

      expect(service.user.value).toBeNull();

      expect(localStorage.getItem('userData')).toBeNull();

      expect(router.navigate).toHaveBeenCalledExactlyOnceWith([
        '/login',
      ]);

    },
  );


  /* ========================================
     MANUAL LOGOUT
  ======================================== */

  it('clears the session and cancels the pending timer on manual logout', () => {

    localStorage.setItem(
      'userData',
      JSON.stringify(savedUser),
    );

    const service = createService();

    service.logout();


    // Session should be removed immediately.

    expect(service.user.value).toBeNull();

    expect(localStorage.getItem('userData')).toBeNull();

    expect(router.navigate).toHaveBeenCalledExactlyOnceWith([
      '/login',
    ]);


    // Previously scheduled logout must not run again.

    vi.advanceTimersByTime(3600000);

    expect(router.navigate).toHaveBeenCalledTimes(1);

  });


  /* ========================================
     AUTOMATIC LOGOUT TIMER
  ======================================== */

  it('replaces the previous automatic logout timer', () => {

    localStorage.setItem(
      'userData',
      JSON.stringify(savedUser),
    );

    const service = createService();

    service.autoLogout(1000);

    service.autoLogout(2000);


    // Previous timer should have been cancelled.

    vi.advanceTimersByTime(1000);

    expect(service.user.value).not.toBeNull();

    expect(router.navigate).not.toHaveBeenCalled();


    // New timer should expire.

    vi.advanceTimersByTime(1000);

    expect(service.user.value).toBeNull();

    expect(router.navigate).toHaveBeenCalledExactlyOnceWith([
      '/login',
    ]);

  });


  it.each([0, -1, NaN, Infinity])(
    'logs out immediately for an invalid duration of %s',
    (duration) => {

      localStorage.setItem(
        'userData',
        JSON.stringify(savedUser),
      );

      const service = createService();

      service.autoLogout(duration);

      expect(service.user.value).toBeNull();

      expect(localStorage.getItem('userData')).toBeNull();

      expect(router.navigate).toHaveBeenCalledExactlyOnceWith([
        '/login',
      ]);

    },
  );

});