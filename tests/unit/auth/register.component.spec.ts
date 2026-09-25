import { signal, type WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import { AuthService } from '../../../src/app/auth/auth.service';
import { RegisterComponent } from '../../../src/app/auth/register/register.component';

type AuthResponse = ReturnType<AuthService['authRequest']> extends Observable<infer T> ? T : never;

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let element: HTMLElement;
  let request: Subject<AuthResponse>;

  let authService: {
    authRequest: ReturnType<typeof vi.fn>;
    successSignUp: WritableSignal<boolean>;
  };

  let navigate: MockInstance<Router['navigate']>;

  beforeEach(async () => {
    request = new Subject<AuthResponse>();

    authService = {
      authRequest: vi.fn().mockReturnValue(request.asObservable()),
      successSignUp: signal(false),
    };

    vi.spyOn(console, 'log').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compileComponents();

    // Mock navigation so Angular doesn't try to resolve /login
    // against the empty route configuration used by these tests.
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    fixture.detectChanges();
  });

  afterEach(() => {
    request.complete();
    vi.restoreAllMocks();
  });

  function setInputValue(name: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;

    input.value = value;

    input.dispatchEvent(new Event('input', { bubbles: true }));

    fixture.detectChanges();
  }

  function fillValidForm(): void {
    setInputValue('fullName', 'Test Guest');
    setInputValue('email', 'guest@example.com');
    setInputValue('password', 'Abcdef1!');
    setInputValue('confirmPassword', 'Abcdef1!');
  }

  /* ========================================
     REQUIRED FIELD VALIDATION
  ======================================== */

  it.each(['fullName', 'email', 'password', 'confirmPassword'])(
    'disables registration when %s is missing',
    (name) => {
      fillValidForm();

      setInputValue(name, '');

      expect(element.querySelector<HTMLButtonElement>('button[appButton]')!.disabled).toBe(true);

      component.onSubmit();

      expect(authService.authRequest).not.toHaveBeenCalled();
    },
  );

  /* ========================================
     FULL NAME VALIDATION
  ======================================== */

  it('rejects a name shorter than two characters', () => {
    fillValidForm();

    setInputValue('fullName', 'A');

    expect(component.registerForm.invalid).toBe(true);

    expect(element.querySelector<HTMLButtonElement>('button[appButton]')!.disabled).toBe(true);
  });

  /* ========================================
     EMAIL VALIDATION
  ======================================== */

  it('shows the email validation message after an invalid email loses focus', () => {
    fillValidForm();

    const input = element.querySelector<HTMLInputElement>('input[name="email"]')!;

    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    setInputValue('email', 'invalid-email');

    expect(
      element.querySelector('.register-email-error-wrapper')!.classList.contains('is-visible'),
    ).toBe(false);

    input.dispatchEvent(new FocusEvent('blur'));

    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));

    fixture.detectChanges();

    expect(
      element.querySelector('.register-email-error-wrapper')!.classList.contains('is-visible'),
    ).toBe(true);

    expect(element.querySelector('.register-email-error-wrapper')!.textContent).toContain(
      'Please enter a valid email address',
    );

    expect(component.registerForm.invalid).toBe(true);
  });

  /* ========================================
     PASSWORD VALIDATION
  ======================================== */

  it('uses the same eight-character minimum for validation and password guidance', () => {
    fillValidForm();

    setInputValue('password', 'Abcde1!');
    setInputValue('confirmPassword', 'Abcde1!');

    expect(component.registerForm.invalid).toBe(true);

    setInputValue('password', 'Abcdef1!');
    setInputValue('confirmPassword', 'Abcdef1!');

    expect(component.registerForm.valid).toBe(true);

    expect(component.hasUnmetPasswordRequirements).toBe(false);

    const lengthTip = element.querySelector('.register-password-tips li')!;

    expect(lengthTip.classList.contains('completed')).toBe(true);

    expect(lengthTip.textContent).toContain('At least 8 characters');
  });

  /* ========================================
     PASSWORD CONFIRMATION
  ======================================== */

  it('blocks mismatched passwords and clears the error when they match', () => {
    fillValidForm();

    setInputValue('confirmPassword', 'Different1!');

    const confirmation = element.querySelector<HTMLInputElement>('input[name="confirmPassword"]')!;

    confirmation.dispatchEvent(new FocusEvent('blur'));

    fixture.detectChanges();

    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);

    expect(element.querySelector('.register-error-wrapper')!.classList.contains('is-visible')).toBe(
      true,
    );

    expect(element.querySelector<HTMLButtonElement>('button[appButton]')!.disabled).toBe(true);

    setInputValue('confirmPassword', 'Abcdef1!');

    expect(component.registerForm.valid).toBe(true);

    expect(element.querySelector('.register-error-wrapper')!.classList.contains('is-visible')).toBe(
      false,
    );
  });

  /* ========================================
     INVALID SUBMISSION
  ======================================== */

  it('does not leave the spinner running after an invalid submission', () => {
    component.onSubmit();

    fixture.detectChanges();

    expect(authService.authRequest).not.toHaveBeenCalled();

    expect(component.isLoading()).toBe(false);

    expect(element.querySelector('app-loading-spinner')).toBeNull();
  });

  /* ========================================
     REGISTRATION REQUEST
  ======================================== */

  it('submits signup credentials, clears the previous error, and shows the spinner', () => {
    fillValidForm();

    component.failedRegister.set('Previous error');

    element.querySelector('form')!.dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      }),
    );

    fixture.detectChanges();

    expect(authService.authRequest).toHaveBeenCalledExactlyOnceWith(
      'signUp',
      'guest@example.com',
      'Abcdef1!',
    );

    expect(component.isLoading()).toBe(true);

    expect(element.querySelector('app-loading-spinner')).not.toBeNull();

    expect(element.querySelector('[role="alert"]')).toBeNull();

    expect(authService.successSignUp()).toBe(false);
  });

  /* ========================================
     PREVENT DUPLICATE REQUESTS
  ======================================== */

  it('does not submit twice while signup is pending', () => {
    fillValidForm();

    component.onSubmit();
    component.onSubmit();

    expect(authService.authRequest).toHaveBeenCalledTimes(1);
  });

  /* ========================================
     SUCCESSFUL REGISTRATION
  ======================================== */

  it('resets the form, stops loading, sets the success message, and redirects to login after successful signup', () => {
    fillValidForm();

    component.onSubmit();

    expect(authService.successSignUp()).toBe(false);

    expect(component.isLoading()).toBe(true);

    request.next({
      kind: 'identitytoolkit#SignupNewUserResponse',
      email: 'guest@example.com',
      localId: 'user-1',
      idToken: 'test-token',
      refreshToken: 'test-refresh-token',
      expiresIn: '3600',
    });

    request.complete();

    fixture.detectChanges();

    // The success notification should be enabled.
    expect(authService.successSignUp()).toBe(true);

    // The form should be cleared.
    expect(component.registerForm.getRawValue()).toEqual({
      fullName: '',
      registerEmail: '',
      registerPassword: '',
      confirmPassword: '',
    });

    // The loading spinner should disappear.
    expect(component.isLoading()).toBe(false);

    expect(element.querySelector('app-loading-spinner')).toBeNull();

    // The registration button should be disabled again.
    expect(element.querySelector<HTMLButtonElement>('button[appButton]')!.disabled).toBe(true);

    // The user should be redirected to Login.
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/login']);
  });

  /* ========================================
     FAILED REGISTRATION
  ======================================== */

  it('displays a plain error message, preserves input, and allows another attempt', () => {
    fillValidForm();

    component.onSubmit();

    request.error(new Error('The email address is already in use by another account'));

    fixture.detectChanges();

    expect(element.querySelector('[role="alert"] p')!.textContent!.trim()).toBe(
      'The email address is already in use by another account',
    );

    // Preserve the information entered by the user.
    expect(component.registerForm.getRawValue()).toEqual({
      fullName: 'Test Guest',
      registerEmail: 'guest@example.com',
      registerPassword: 'Abcdef1!',
      confirmPassword: 'Abcdef1!',
    });

    // Stop loading.
    expect(component.isLoading()).toBe(false);

    expect(element.querySelector('app-loading-spinner')).toBeNull();

    // Failed registration should not trigger success.
    expect(authService.successSignUp()).toBe(false);

    // Failed registration should not redirect.
    expect(navigate).not.toHaveBeenCalled();

    // Prepare a new request for another registration attempt.
    request = new Subject<AuthResponse>();

    authService.authRequest.mockReturnValue(request.asObservable());

    component.onSubmit();

    fixture.detectChanges();

    expect(authService.authRequest).toHaveBeenCalledTimes(2);

    expect(element.querySelector('[role="alert"]')).toBeNull();

    expect(component.isLoading()).toBe(true);

    expect(element.querySelector('app-loading-spinner')).not.toBeNull();
  });
});
