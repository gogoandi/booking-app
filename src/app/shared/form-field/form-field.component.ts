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
}
