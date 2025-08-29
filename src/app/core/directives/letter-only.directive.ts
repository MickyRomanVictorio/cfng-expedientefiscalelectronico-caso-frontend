import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[lettersOnly]'
})
export class LetterOnlyDirective {

  private regex: RegExp = /^[a-zA-ZÀ-ÿñÑ\s]*$/;

  constructor(private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const originalValue = inputElement.value;

    const filteredValue = originalValue.split('').filter(char => this.regex.test(char)).join('');

    if (originalValue !== filteredValue) {
      this.control.control?.setValue(filteredValue);
    }
  }
}
