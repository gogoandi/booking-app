import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormFieldComponent } from '../../../src/app/shared/form-field/form-field.component';
import { FormFieldModel } from '../../../src/app/shared/form-field/form-field.model';

@Component({
  imports: [FormFieldComponent, ReactiveFormsModule],
  template: `
    <form (ngSubmit)="onSubmit()">
      <app-form-field [formField]="field" [control]="control" />
    </form>
  `,
})
class TestHostComponent {
  field: FormFieldModel = { name: 'password', label: 'Password', type: 'password' };
  control = new FormControl('Abcdef1!', { nonNullable: true });
  onSubmit = vi.fn();
}

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('associates the label with the input and displays the control value', () => {
    const input = element.querySelector('input')!;

    expect(element.querySelector('label')!.htmlFor).toBe(input.id);
    expect(element.querySelector('label')!.textContent).toContain('Password');
    expect(input.value).toBe('Abcdef1!');
  });

  it('updates the form control when the user types and marks it touched on blur', () => {
    const input = element.querySelector('input')!;
    input.value = 'NewPassword1!';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('blur'));

    expect(host.control.value).toBe('NewPassword1!');
    expect(host.control.dirty).toBe(true);
    expect(host.control.touched).toBe(true);
  });

  it('updates the input when the form control changes or becomes disabled', () => {
    host.control.setValue('Changed1!');
    host.control.disable();
    fixture.detectChanges();

    expect(element.querySelector('input')!.value).toBe('Changed1!');
    expect(element.querySelector('input')!.disabled).toBe(true);
  });

  it('toggles password visibility and accessible labels without submitting the form', () => {
    const input = element.querySelector('input')!;
    const toggle = element.querySelector('button')!;
    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(input.value).toBe('Abcdef1!');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(host.onSubmit).not.toHaveBeenCalled();

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(host.onSubmit).not.toHaveBeenCalled();
  });

  it('does not display a password toggle for other input types', () => {
    host.field = { name: 'email', label: 'Email address', type: 'email' };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(element.querySelector('input')!.type).toBe('email');
    expect(element.querySelector('button')).toBeNull();
  });

  it('passes the minimum date to the input', () => {
    host.field = { name: 'date', label: 'Check-in', type: 'date', min: '2026-01-01' };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(element.querySelector('input')!.min).toBe('2026-01-01');
  });
});
