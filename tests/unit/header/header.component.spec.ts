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

      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user, logout },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);

    element = fixture.nativeElement;

    fixture.detectChanges();
  });

  afterEach(() => {
    user.complete();

    vi.restoreAllMocks();
  });

  function signIn(): void {
    user.next(
      new UserModel('guest@example.com', 'user-1', 'test-token', new Date(Date.now() + 60000)),
    );

    fixture.detectChanges();
  }

  function openAccountMenu(): void {
    const accountTrigger = element.querySelector<HTMLButtonElement>('.account-trigger');

    expect(accountTrigger).not.toBeNull();

    accountTrigger!.click();

    fixture.detectChanges();
  }

  it('shows only Login in the guest actions', () => {
    expect(element.querySelector('.header-actions a[href="/login"]')).not.toBeNull();

    expect(element.querySelector('.account-trigger')).toBeNull();

    expect(element.querySelector('.account-dropdown')).toBeNull();
  });

  it('replaces Login with an account dropdown when a user signs in', () => {
    signIn();

    // Login button should disappear

    expect(element.querySelector('.header-actions a[href="/login"]')).toBeNull();

    // Account trigger should be visible

    const accountTrigger = element.querySelector<HTMLButtonElement>('.account-trigger');

    expect(accountTrigger).not.toBeNull();

    // Dropdown should initially be closed

    expect(element.querySelector('.account-dropdown')).toBeNull();

    expect(accountTrigger!.getAttribute('aria-expanded')).toBe('false');

    // Open dropdown

    openAccountMenu();

    // Dropdown should now be visible

    expect(element.querySelector('.account-dropdown')).not.toBeNull();

    expect(accountTrigger!.getAttribute('aria-expanded')).toBe('true');

    // Dashboard link should exist

    const dashboardLink = element.querySelector<HTMLAnchorElement>(
      '.account-dropdown a[href="/dashboard"]',
    );

    expect(dashboardLink).not.toBeNull();

    expect(dashboardLink!.textContent).toContain('Dashboard');

    // Logout button should exist

    const logoutButton = element.querySelector<HTMLButtonElement>('.account-dropdown-logout');

    expect(logoutButton).not.toBeNull();

    expect(logoutButton!.textContent).toContain('Logout');
  });

  it('restores guest actions when the session ends', () => {
    signIn();

    openAccountMenu();

    // End session

    user.next(null);

    fixture.detectChanges();

    expect(element.querySelector('.header-actions a[href="/login"]')).not.toBeNull();

    expect(element.querySelector('.account-trigger')).toBeNull();

    expect(element.querySelector('.account-dropdown')).toBeNull();
  });

  it('logs out and redirects to login when Logout is clicked', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    signIn();

    // Open the account dropdown first

    openAccountMenu();

    // Click the actual Logout menu item

    const logoutButton = element.querySelector<HTMLButtonElement>('.account-dropdown-logout');

    expect(logoutButton).not.toBeNull();

    logoutButton!.click();

    fixture.detectChanges();

    // Verify authentication service was called

    expect(logout).toHaveBeenCalledTimes(1);

    // Verify session ended

    expect(user.value).toBeNull();

    // Verify redirect

    expect(navigate).toHaveBeenCalledWith(['/login']);

    // Verify guest actions are restored

    expect(element.querySelector('.header-actions a[href="/login"]')).not.toBeNull();

    // Verify authenticated account menu disappears

    expect(element.querySelector('.account-trigger')).toBeNull();

    expect(element.querySelector('.account-dropdown')).toBeNull();
  });

  it('closes the account dropdown when the trigger is clicked again', () => {
    signIn();

    openAccountMenu();

    expect(element.querySelector('.account-dropdown')).not.toBeNull();

    // Click account icon again

    element.querySelector<HTMLButtonElement>('.account-trigger')!.click();

    fixture.detectChanges();

    expect(element.querySelector('.account-dropdown')).toBeNull();

    expect(element.querySelector('.account-trigger')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the account dropdown when Escape is pressed', () => {
    signIn();

    openAccountMenu();

    expect(element.querySelector('.account-dropdown')).not.toBeNull();

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    );

    fixture.detectChanges();

    expect(element.querySelector('.account-dropdown')).toBeNull();
  });

  it('stops responding to session changes after it is destroyed', () => {
    signIn();

    fixture.destroy();

    user.next(null);

    expect(fixture.componentInstance.isAuthenticated()).toBe(true);
  });
});
