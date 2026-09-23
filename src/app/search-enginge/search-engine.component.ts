import { Component, input } from '@angular/core';
import { FormFieldComponent } from '../shared/form-field/form-field.component';
import { ButtonComponent } from '../shared/button/button.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-engine',
  standalone:true,
  imports: [FormFieldComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './search-engine.component.html',
  styleUrl: './search-engine.component.css',
})
export class SearchEngineComponent {

    today = new Date().toLocaleDateString('en-CA');

    searchForm = new FormGroup({
        city: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        fromDate: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        toDate: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        })
    });
    onSubmit() {

    }
}
