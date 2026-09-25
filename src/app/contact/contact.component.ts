import { Component, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../shared/button/button.component';
import { FormFieldComponent } from '../shared/form-field/form-field.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FormFieldComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  submitAttempted = signal(false);

  focusedField = signal<string | null>(null);

  contactForm = new FormGroup({
    contactName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),

    contactEmail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),

    contactSubject: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    contactMessage: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
  });

  checkContactFormFieldRequired(control: FormControl): boolean {
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    this.submitAttempted.set(true);

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const contactData = this.contactForm.getRawValue();

    // TODO: Send contactData to the backend.

    this.contactForm.reset();
  }
}
