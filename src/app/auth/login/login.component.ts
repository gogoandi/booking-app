import { Component, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  imports: [
    ButtonComponent,
    FormFieldComponent,
    RouterLink,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  isLoading = signal(false);
  constructor(private authService: AuthService) {}
  failedLogin = signal('');

  loginForm = new FormGroup({
    loginEmail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    loginPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  isLoginEmailFocused = false;
  get checkLoginEmail(): boolean {
    const emailControl = this.loginForm.controls.loginEmail;
    return (
      emailControl.dirty &&
      emailControl.invalid &&
      !!emailControl.value &&
      emailControl.touched &&
      !this.isLoginEmailFocused
    );
  }

  get emailErrorMessage(): string {
    const email = this.loginForm.controls.loginEmail;

    if (email.hasError('required')) {
      return 'Email address is required.';
    }

    if (email.hasError('email')) {
      return 'Please enter a valid email address (e.g., name@example.com).';
    }

    return '';
  }

  onSubmit() {
    this.isLoading.set(true);
    this.failedLogin.set('');

    const loginEmail = this.loginForm.controls.loginEmail.value;
    const loginPassword = this.loginForm.controls.loginPassword.value;

    if (this.loginForm.invalid || !loginEmail || !loginPassword) {
      return;
    }    

    this.authService.authRequest('signInWithPassword', loginEmail, loginPassword).subscribe({
      next: (resData) => {
        /** The response from the server after a user logs in or registers should never be logged to the console, as it may contain sensitive information such as tokens or passwords.
         *
         Although this is a demo application with no real user data, sensitive information should still not be logged.
         */
        console.log('Login successful:', resData);
        this.isLoading.set(false);
        this.loginForm.reset();
      },

      error: (failedLogin) => {
        console.log(failedLogin);
        this.failedLogin.set(failedLogin);
        this.isLoading.set(false);
      },
    });
  }
}
