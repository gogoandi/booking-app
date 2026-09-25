import { Injectable } from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { map, Observable, take } from 'rxjs';

import { AuthService } from './auth.service';

/* ========================================
   AUTH GUARD
   Protects pages that require login
======================================== */

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.authService.user.pipe(
      take(1),

      map((user) => {
        const isAuth = !!user?.getToken;

        if (isAuth) {
          return true;
        }

        return this.router.createUrlTree(['/login']);
      }),
    );
  }
}

/* ========================================
   GUEST GUARD
   Protects Login and Register from
   already authenticated users
======================================== */

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.authService.user.pipe(
      take(1),

      map((user) => {
        const isAuth = !!user?.getToken;

        if (!isAuth) {
          return true;
        }

        return this.router.createUrlTree(['/dashboard']);
      }),
    );
  }
}
