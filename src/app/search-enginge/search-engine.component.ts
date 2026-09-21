import { Component, input } from '@angular/core';
import { FormFieldComponent } from '../shared/form-field/form-field.component';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-search-engine',
  standalone:true,
  imports: [FormFieldComponent, ButtonComponent],
  templateUrl: './search-engine.component.html',
  styleUrl: './search-engine.component.css',
})
export class SearchEngineComponent {
    formField = input.required<{
        name: string,
        label: string,
        type: string
    }>();
}
