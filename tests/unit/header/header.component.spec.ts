import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../src/app/auth/auth.service';
import { UserModel } from '../../../src/app/auth/user.model';
import { HeaderComponent } from '../../../src/app/header/header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let element: HTMLElement;
  let user: BehaviorSubject<UserModel | null>;
  let logout: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    user = new BehaviorSubject<UserModel | null>(null);
    logout = vi.fn(() => user.next(null));
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: { user, logout } }],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    user.complete();
    vi.restoreAllMocks();
  });

  function signIn() {
    user.next(
      new UserModel('guest@example.com', 'user-1', 'test-token', new Date(Date.now() + 60000)),
    );
    fixture.detectChanges();
  }

  it('shows only Login in the guest actions', () => {
    expect(element.querySelector('.header-actions a')!.getAttribute('href')).toBe('/login');
    expect(element.querySelector('.header-actions a[href="/dashboard"]')).toBeNull();
    expect(element.querySelector('.header-actions button')).toBeNull();
  });

  it('replaces Login with Dashboard and Logout when a user signs in', () => {
    signIn();

    expect(element.querySelector('.header-actions a[href="/login"]')).toBeNull();
    expect(element.querySelector('.header-actions a[href="/dashboard"]')!.textContent).toContain(
      'Dashboard',
    );
    expect(element.querySelector('.header-actions button')!.textContent).toContain('Logout');
  });

  it('restores guest actions when the session ends', () => {
    signIn();
    user.next(null);
    fixture.detectChanges();

    expect(element.querySelector('.header-actions a[href="/login"]')).not.toBeNull();
    expect(element.querySelector('.header-actions a[href="/dashboard"]')).toBeNull();
    expect(element.querySelector('.header-actions button')).toBeNull();
  });

  it('logs out and redirects to login when Logout is clicked', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    signIn();

    element.querySelector<HTMLButtonElement>('.header-actions button')!.click();
    fixture.detectChanges();

    expect(logout).toHaveBeenCalledTimes(1);
    expect(user.value).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
    expect(element.querySelector('.header-actions a[href="/login"]')).not.toBeNull();
  });

  it('stops responding to session changes after it is destroyed', () => {
    signIn();
    fixture.destroy();

    user.next(null);

    expect(fixture.componentInstance.isAuthenticated()).toBe(true);
  });
});
