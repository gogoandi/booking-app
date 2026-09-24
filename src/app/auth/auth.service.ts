import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Subject, tap } from 'rxjs';
import { throwError } from 'rxjs';
import { UserModel } from './user.model';

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
  constructor(private httpRequest: HttpClient) {}

  user = new Subject<UserModel>();

  // One method for both the signup and login request since the requests are almost identical(both require only email/password and both are of POST type). The only difference is the API endpoint which still only changes between 'signUp'  or 'signInWithPassword'
  authRequest(authType: 'signUp' | 'signInWithPassword', email: string, password: string) {
    return this.httpRequest
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:' + authType + '?key=' + this.apiKey,
        {
          email: email,
          password: password,
          returnSecureToken: true,
        },
      )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)}),
      );
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new UserModel(email, userId, token, expirationDate);
    this.user.next(user);
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
}
