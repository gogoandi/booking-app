import { Component, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  imports: [ButtonComponent, FormFieldComponent, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
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

  onSubmit() {
    const loginEmail = this.loginForm.controls.loginEmail.value;
    const loginPassword = this.loginForm.controls.loginPassword.value;

    if (this.loginForm.invalid || !loginEmail || !loginPassword) {
      return;
    }

    this.isLoading.set(true);
    this.failedLogin.set('');

    this.authService.login(loginEmail, loginPassword).subscribe({
      next: (resData) => {
        console.log('Login successful:', resData);
        this.isLoading.set(false);
        this.loginForm.reset();
      },

      error: (failedLogin) => {
        this.failedLogin.set(failedLogin);
        this.isLoading.set(false);
      },
    });
  }
}
