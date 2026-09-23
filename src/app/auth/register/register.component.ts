import { Component } from '@angular/core';

import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import { FormFieldComponent } from '../../shared/form-field/form-field.component';


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
    imports: [ReactiveFormsModule, RouterLink, FormFieldComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {

    registerForm = new FormGroup({

        fullName: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(2)]
        }),

        email: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.email]
        }),

        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(8)]
        }),

        confirmPassword: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        })

    }, {
        validators: passwordsMatch
    });


    onSubmit() {

        if (this.registerForm.invalid) {
            return;
        }

        const registrationData = this.registerForm.getRawValue();

        // TODO: Send registrationData to your authentication backend.
        // Do not log or store passwords in localStorage.

    }
}