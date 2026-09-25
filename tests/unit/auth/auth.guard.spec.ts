import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { BehaviorSubject, isObservable, lastValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthGuard } from '../../../src/app/auth/auth.guard';
import { AuthService } from '../../../src/app/auth/auth.service';
import { UserModel } from '../../../src/app/auth/user.model';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;
  let user: BehaviorSubject<UserModel | null>;

  beforeEach(() => {
    user = new BehaviorSubject<UserModel | null>(null);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { user } }],
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  async function checkAccess() {
    const result = guard.canActivate(new ActivatedRouteSnapshot(), {
      url: '/dashboard',
    } as RouterStateSnapshot);
    // Waiting for completion also verifies the guard does not keep listening to session changes.
    return isObservable(result) ? lastValueFrom(result) : result;
  }

  it('redirects unauthenticated users to login', async () => {
    expect(await checkAccess()).toEqual(router.createUrlTree(['/login']));
  });

  it('allows authenticated users to access the protected route', async () => {
    user.next(
      new UserModel('guest@example.com', 'user-1', 'test-token', new Date(Date.now() + 60000)),
    );

    expect(await checkAccess()).toBe(true);
  });

  it('denies subsequent access after logout', async () => {
    user.next(
      new UserModel('guest@example.com', 'user-1', 'test-token', new Date(Date.now() + 60000)),
    );
    expect(await checkAccess()).toBe(true);

    user.next(null);

    expect(await checkAccess()).toEqual(router.createUrlTree(['/login']));
  });
});
