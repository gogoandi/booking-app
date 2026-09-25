import { Component, input } from '@angular/core';

@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',

  host: {
    '[class.white-bg]': 'hasWhiteBg()',
  },
})
export class ButtonComponent {
  buttonName = input.required<string>();

  hasWhiteBg = input(false);
}