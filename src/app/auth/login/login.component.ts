import { Component, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { finalize } from 'rxjs';

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
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
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

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginEmail = this.loginForm.controls.loginEmail.value;
    const loginPassword = this.loginForm.controls.loginPassword.value;

    this.failedLogin.set('');
    this.isLoading.set(true);

    this.authService
      .authRequest('signInWithPassword', loginEmail, loginPassword)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.loginForm.reset();

          this.router.navigate(['/dashboard']);
        },

        error: (error: Error) => {
          this.failedLogin.set(error.message);
        },
      });
  }
}
