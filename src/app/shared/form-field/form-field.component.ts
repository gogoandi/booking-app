import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css',
})
export class FormFieldComponent {
  formField = input.required<{
    name: string;
    label: string;
    type: 'text' | 'date';
  }>();
}
