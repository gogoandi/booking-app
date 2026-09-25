import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../src/app/auth/auth.service';
import { RegisterComponent } from '../../../src/app/auth/register/register.component';

type AuthResponse = ReturnType<AuthService['authRequest']> extends Observable<infer T> ? T : never;

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let element: HTMLElement;
  let request: Subject<AuthResponse>;
  let authService: { authRequest: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    request = new Subject<AuthResponse>();
    authService = { authRequest: vi.fn().mockReturnValue(request.asObservable()) };
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    request.complete();
    vi.restoreAllMocks();
  });

  function setInputValue(name: string, value: string) {
    const input = element.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  function fillValidForm() {
    setInputValue('fullName', 'Test Guest');
    setInputValue('email', 'guest@example.com');
    setInputValue('password', 'Abcdef1!');
    setInputValue('confirmPassword', 'Abcdef1!');
  }

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

  it('rejects a name shorter than two characters', () => {
    fillValidForm();
    setInputValue('fullName', 'A');

    expect(component.registerForm.invalid).toBe(true);
    expect(element.querySelector<HTMLButtonElement>('button[appButton]')!.disabled).toBe(true);
  });

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

  it('does not leave the spinner running after an invalid submission', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(authService.authRequest).not.toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
    expect(element.querySelector('app-loading-spinner')).toBeNull();
  });

  it('submits signup credentials, clears the previous error, and shows the spinner', () => {
    fillValidForm();
    component.failedRegister.set('Previous error');

    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(authService.authRequest).toHaveBeenCalledExactlyOnceWith(
      'signUp',
      'guest@example.com',
      'Abcdef1!',
    );
    expect(element.querySelector('app-loading-spinner')).not.toBeNull();
    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  it('does not submit twice while signup is pending', () => {
    fillValidForm();

    component.onSubmit();
    component.onSubmit();

    expect(authService.authRequest).toHaveBeenCalledTimes(1);
  });

  it('resets the form and stops loading after successful signup', () => {
    fillValidForm();
    component.onSubmit();
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

    expect(component.registerForm.getRawValue()).toEqual({
      fullName: '',
      registerEmail: '',
      registerPassword: '',
      confirmPassword: '',
    });
    expect(component.isLoading()).toBe(false);
    expect(element.querySelector('app-loading-spinner')).toBeNull();
    expect(element.querySelector<HTMLButtonElement>('button[appButton]')!.disabled).toBe(true);
  });

  it('displays a plain error message, preserves input, and allows another attempt', () => {
    fillValidForm();
    component.onSubmit();
    request.error(new Error('The email address is already in use by another account'));
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"] p')!.textContent!.trim()).toBe(
      'The email address is already in use by another account',
    );
    expect(component.registerForm.getRawValue()).toEqual({
      fullName: 'Test Guest',
      registerEmail: 'guest@example.com',
      registerPassword: 'Abcdef1!',
      confirmPassword: 'Abcdef1!',
    });
    expect(component.isLoading()).toBe(false);
    expect(element.querySelector('app-loading-spinner')).toBeNull();

    request = new Subject<AuthResponse>();
    authService.authRequest.mockReturnValue(request.asObservable());
    component.onSubmit();
    fixture.detectChanges();

    expect(authService.authRequest).toHaveBeenCalledTimes(2);
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(component.isLoading()).toBe(true);
  });
});
