import { Component } from '@angular/core';
import { ButtonComponent } from '../shared/button/button.component';
import { FormFieldComponent } from '../shared/form-field/form-field.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ButtonComponent, FormFieldComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
    
    loginForm = new FormGroup({
        loginEmail: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.email]
        }),
        loginPassword: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        })
    });
    
    onSubmit() {
        if (this.loginForm.invalid) {
            return;
        }

        console.log(this.loginForm.getRawValue());
    }

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
}
