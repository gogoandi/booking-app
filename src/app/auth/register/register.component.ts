import { Component, signal } from '@angular/core';

import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

import { AuthService } from '../auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('registerPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FormFieldComponent,
    ButtonComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm = new FormGroup(
    {
      fullName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),

      registerEmail: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),

      registerPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),

      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: passwordsMatch,
    },
  );

  isLoading = signal(false);
  failedRegister = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  isPasswordFocused = false;

  get passwordRequirements() {
    const password = this.registerForm.controls.registerPassword.value;

    return {
      length: password.length >= 8,
      letterCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      specialCharacter: /[^a-zA-Z0-9\s]/.test(password),
      number: /\d/.test(password),
    };
  }

  get hasUnmetPasswordRequirements(): boolean {
    return Object.values(this.passwordRequirements).some((requirement) => !requirement);
  }

  get showPasswordTips(): boolean {
    const passwordControl = this.registerForm.controls.registerPassword;

    return (
      this.isPasswordFocused ||
      (passwordControl.dirty && passwordControl.touched && this.hasUnmetPasswordRequirements)
    );
  }

  get showPasswordError(): boolean {
    const passwordControl = this.registerForm.controls.registerPassword;

    return (
      !this.isPasswordFocused &&
      this.hasPasswordValue &&
      passwordControl.dirty &&
      passwordControl.touched &&
      this.hasUnmetPasswordRequirements
    );
  }

  isConfirmPasswordFocused = false;
  get checkPasswordMismatch(): boolean {
    const confirmPassword = this.registerForm.controls.confirmPassword;

    return (
      this.registerForm.hasError('passwordMismatch') &&
      confirmPassword.dirty &&
      confirmPassword.touched &&
      !this.isConfirmPasswordFocused
    );
  }

  get hasPasswordValue(): boolean {
    return this.registerForm.controls.registerPassword.value.length > 0;
  }

  //   Email conditions
  isEmailFocused = false;
  get showEmailError(): boolean {
    const email = this.registerForm.controls.registerEmail;
    return email.invalid && email.dirty && email.touched && !this.isEmailFocused;
  }

  get emailErrorMessage(): string {
    const email = this.registerForm.controls.registerEmail;

    if (email.hasError('required')) {
      return 'Email address is required.';
    }

    if (email.hasError('email')) {
      return 'Please enter a valid email address (e.g., name@example.com).';
    }

    return '';
  }

  onSubmit() {
    const registerEmail = this.registerForm.controls.registerEmail.value;
    const registerPassword = this.registerForm.controls.registerPassword.value;

    if (this.registerForm.invalid || this.isLoading() || !registerEmail || !registerPassword) {
      return;
    }

    this.isLoading.set(true);
    this.failedRegister.set('');

    this.authService.authRequest('signUp', registerEmail, registerPassword).subscribe({
      next: (resData) => {
        /** The response from the server after a user logs in or registers should never be logged to the console, as it may contain sensitive information such as tokens or passwords.
         *
         Although this is a demo application with no real user data, sensitive information should still not be logged.
         */
        console.log('Registration successful:', resData);
        this.isLoading.set(false);
        this.registerForm.reset();
        this.authService.successSignUp.set(true);
        this.router.navigate(['/login']);
      },

      error: (failedRegister: Error) => {
        console.log(failedRegister);
        this.failedRegister.set(failedRegister.message);
        this.isLoading.set(false);
      },
    });
  }
}
