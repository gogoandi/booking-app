import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, Subject, tap } from 'rxjs';
import { throwError } from 'rxjs';
import { UserModel } from './user.model';
import { Router } from '@angular/router';

interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiKey = 'AIzaSyAX9IZo0WhxqQN5jWe-OWtaqDWMsMqvPtU';
  constructor(
    private httpRequest: HttpClient,
    private router: Router,
  ) {
    if (typeof window !== 'undefined') {
      this.autoLogin();
    }
  }
  user = new BehaviorSubject<UserModel | null>(null);
  private tokenExpirationTimer: any;

  successSignUp = signal<boolean>(false);

  // One method for both the signup and login request since the requests are almost identical(both require only email/password and both are of POST type). The only difference is the API endpoint which still only changes between 'signUp'  or 'signInWithPassword'
  authRequest(authType: 'signUp' | 'signInWithPassword', email: string, password: string) {
    if (authType === 'signUp') {
      this.successSignUp.set(false);
    }

    return this.httpRequest
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:' + authType + '?key=' + this.apiKey,
        {
          email,
          password,
          returnSecureToken: true,
        },
      )
      .pipe(
        catchError(this.handleError),

        tap((resData) => {
          if (authType === 'signUp') {
            // Registration successful.
            // Do NOT create or save an authenticated session.
            this.successSignUp.set(true);
          } else {
            // Only log the user in after successful authentication.
            this.handleAuthentication(
              resData.email,
              resData.localId,
              resData.idToken,
              +resData.expiresIn,
            );
          }
        }),
      );
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number,
  ): void {
    const expirationDate = new Date(Date.now() + expiresIn * 1000);
    const user = new UserModel(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);

    localStorage.setItem(
      'userData',
      JSON.stringify({
        email,
        userId,
        token,
        expirationDate: expirationDate.toISOString(),
      }),
    );
  }

  private handleError(errorResponse: HttpErrorResponse) {
    let failedRequest = 'An unknown error has occurred';
    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(() => new Error(failedRequest));
    }
    switch (errorResponse.error.error.message) {
      case 'INVALID_LOGIN_CREDENTIALS':
        failedRequest = 'Incorrect email or password. Please check your credentials and try again.';
        break;

      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        failedRequest = 'Too many attempts. Please try again later.';
        break;

      case 'EMAIL_EXISTS':
        failedRequest = 'The email address is already in use by another account';
        break;

      case 'OPERATION_NOT_ALLOWED':
        failedRequest = 'Password sign-in is disabled for this project.';
        break;
    }

    return throwError(() => new Error(failedRequest));
  }

  autoLogin(): void {
    const storedUser = localStorage.getItem('userData');

    if (!storedUser) {
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      // Reconstruct expiration date from localStorage
      const expirationDate = new Date(userData.expirationDate);

      // Calculate remaining token lifetime
      const expirationDuration = expirationDate.getTime() - Date.now();

      // Check expiration date before creating the user
      if (!Number.isFinite(expirationDuration) || expirationDuration <= 0) {
        this.logout();
        return;
      }

      // Reconstruct UserModel
      const user = new UserModel(userData.email, userData.userId, userData.token, expirationDate);

      // Check whether the token exists and is valid
      if (!user.getToken) {
        this.logout();
        return;
      }

      // Restore authentication state
      this.user.next(user);

      // Restart automatic logout timer
      this.autoLogout(expirationDuration);
    } catch (error) {
      console.error('Failed to restore user session:', error);

      this.logout();
    }
  }

  logout() {
    this.user.next(null);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
    this.router.navigate(['/login']);
  }

  autoLogout(expirationDuration: number): void {
    // Clear existing timer
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    // Prevent invalid durations
    if (!Number.isFinite(expirationDuration) || expirationDuration <= 0) {
      this.logout();
      return;
    }

    // Start automatic logout timer
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
