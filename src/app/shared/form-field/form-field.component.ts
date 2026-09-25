import { Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormFieldModel } from './form-field.model';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css',
})
export class FormFieldComponent {
  formField = input.required<FormFieldModel>();
  control = input.required<FormControl<string>>();

  // Checks the password visibility
  isPasswordVisible = false;
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  preventPasswordClipboard(event: ClipboardEvent): void {
    if (this.formField().type === 'password') {
      event.preventDefault();
    }
  }
}