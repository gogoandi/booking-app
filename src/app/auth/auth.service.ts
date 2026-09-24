import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';

interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered ?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private httpRequest: HttpClient) {}

  signup(email: string, password: string) {
    return this.httpRequest
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAX9IZo0WhxqQN5jWe-OWtaqDWMsMqvPtU',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        },
      )
      .pipe(
        catchError((errorResponse) => {
          let failedRegister = 'An unknown error has occured';
          if (!errorResponse.error || !errorResponse.error.error) {
            return throwError(() => new Error(failedRegister));
          }
          switch (errorResponse.error.error.message) {
            case 'EMAIL_EXISTS':
              failedRegister = 'The email address is already in use by another account';
              break;

            case 'OPERATION_NOT_ALLOWED':
              failedRegister = 'Password sign-in is disabled for this project.';
              break;

            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
              failedRegister =
                'We have blocked all requests from this device due to unusual activity. Try again later.';
          }

          return throwError(() => new Error(failedRegister));
        }),
      );
  }

  login(email: string, password: string) {
    return this.httpRequest.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAX9IZo0WhxqQN5jWe-OWtaqDWMsMqvPtU',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        },
      ).pipe(
        catchError((errorResponse) => {
                      console.log(errorResponse);

          let failedLogin = 'Login failed - An unknown error has occurred';
          if (!errorResponse.error || !errorResponse.error.error) {
            return throwError(() => new Error(failedLogin));
          }
          switch (errorResponse.error.error.message) {
            case 'INVALID_LOGIN_CREDENTIALS':
              failedLogin = 'Incorrect email or password. Please check your credentials and try again.';
              break;
            
              case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                failedLogin = 'Too many attempts. Please try again later.'
            }

          return throwError(() => new Error(failedLogin));
        }),
      );;
  }
} 
