import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import { AuthService } from '../../../src/app/auth/auth.service';
import { LoginComponent } from '../../../src/app/auth/login/login.component';

type AuthResponse = ReturnType<AuthService['authRequest']> extends Observable<infer T> ? T : never;

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let element: HTMLElement;
  let request: Subject<AuthResponse>;
  let authService: { authRequest: ReturnType<typeof vi.fn> };
  let navigate: MockInstance<Router['navigate']>;

  beforeEach(async () => {
    request = new Subject<AuthResponse>();
    authService = { authRequest: vi.fn().mockReturnValue(request.asObservable()) };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
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
  }

  function fillValidForm() {
    setInputValue('email', 'guest@example.com');
    setInputValue('password', 'Password1!');
    fixture.detectChanges();
  }

  it('keeps Sign In disabled until the form is valid', () => {
    const button = element.querySelector<HTMLButtonElement>('button[appButton]')!;

    expect(button.disabled).toBe(true);

    setInputValue('email', 'invalid-email');
    setInputValue('password', 'Password1!');
    fixture.detectChanges();
    expect(button.disabled).toBe(true);

    fillValidForm();
    expect(button.disabled).toBe(false);
  });

  it('rejects invalid submissions without starting a request or loading state', () => {
    component.onSubmit();

    expect(authService.authRequest).not.toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
    expect(component.loginForm.controls.loginEmail.touched).toBe(true);
    expect(component.loginForm.controls.loginPassword.touched).toBe(true);
  });

  it('submits credentials through the form and shows the loading spinner', () => {
    fillValidForm();
    component.failedLogin.set('Previous error');

    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(authService.authRequest).toHaveBeenCalledExactlyOnceWith(
      'signInWithPassword',
      'guest@example.com',
      'Password1!',
    );
    expect(component.isLoading()).toBe(true);
    expect(element.querySelector('app-loading-spinner')).not.toBeNull();
    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  it('does not send another request while login is pending', () => {
    fillValidForm();

    component.onSubmit();
    component.onSubmit();

    expect(authService.authRequest).toHaveBeenCalledTimes(1);
  });

  it('resets the form, hides the spinner, and opens the dashboard after login', () => {
    fillValidForm();
    component.onSubmit();

    request.next({
      kind: 'identitytoolkit#VerifyPasswordResponse',
      email: 'guest@example.com',
      localId: 'user-1',
      idToken: 'test-token',
      refreshToken: 'test-refresh-token',
      expiresIn: '3600',
    });
    request.complete();
    fixture.detectChanges();

    expect(component.loginForm.getRawValue()).toEqual({ loginEmail: '', loginPassword: '' });
    expect(component.isLoading()).toBe(false);
    expect(element.querySelector('app-loading-spinner')).toBeNull();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/dashboard']);
  });

  it('displays the error, preserves credentials, and stops loading after failure', () => {
    fillValidForm();
    component.onSubmit();

    request.error(new Error('Incorrect email or password.'));
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Incorrect email or password.',
    );
    expect(component.loginForm.getRawValue()).toEqual({
      loginEmail: 'guest@example.com',
      loginPassword: 'Password1!',
    });
    expect(component.isLoading()).toBe(false);
    expect(element.querySelector('app-loading-spinner')).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });
});
