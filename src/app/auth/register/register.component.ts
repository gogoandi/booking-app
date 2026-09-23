import { Component } from '@angular/core';

import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { ButtonComponent } from '../../shared/button/button.component';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    return { passwordMismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, ButtonComponent],
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

      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),

      password: new FormControl('', {
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

  isPasswordFocused = false;

  get passwordRequirements() {
    const password = this.registerForm.controls.password.value;

    return {
      length: password.length > 8,
      letterCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      specialCharacter: /[^a-zA-Z0-9\s]/.test(password),
      number: /\d/.test(password),
    };
  }

  get hasUnmetPasswordRequirements(): boolean {
    return Object.values(this.passwordRequirements).some((requirement) => !requirement);
  }

  get showPasswordTips(): boolean {
    const passwordControl = this.registerForm.controls.password;

    return (
      this.isPasswordFocused ||
      (passwordControl.dirty && passwordControl.touched && this.hasUnmetPasswordRequirements)
    );
  }

  get showPasswordError(): boolean {
    const passwordControl = this.registerForm.controls.password;

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
    return this.registerForm.controls.password.value.length > 0;
  }

  //   Email conditions
  isEmailFocused = false;

  get showEmailError(): boolean {
    const email = this.registerForm.controls.email;
    return email.invalid && email.dirty && email.touched && !this.isEmailFocused;
  }

  get emailErrorMessage(): string {
    const email = this.registerForm.controls.email;

    if (email.hasError('required')) {
      return 'Email address is required.';
    }

    if (email.hasError('email')) {
      return 'Please enter a valid email address (e.g., name@example.com).';
    }

    return '';
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const registrationData = this.registerForm.getRawValue();

    // TODO: Send registrationData to your authentication backend.
    // Do not log or store passwords in localStorage.
  }
}
