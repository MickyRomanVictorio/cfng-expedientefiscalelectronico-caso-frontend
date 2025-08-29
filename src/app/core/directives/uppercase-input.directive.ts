import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[upperCaseInput]'
})
export class UpperCaseInputDirective {
  constructor(private readonly control: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const upperCaseValue = inputElement.value.toUpperCase();
    this.control.control?.setValue(upperCaseValue, { emitEvent: false });
  }
}