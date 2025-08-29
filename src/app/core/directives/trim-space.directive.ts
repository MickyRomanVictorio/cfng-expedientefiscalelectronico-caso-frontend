import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[trimSpaces]'
})
export class TrimSpacesDirective {
  constructor(private el: ElementRef) {}


  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement as HTMLInputElement;
    input.value = input.value.replace(/\s{2,}/g, ' ');
  }

  @HostListener('blur')
  onBlur() {
    const input = this.el.nativeElement as HTMLInputElement;
    input.value = input.value.trim();
  }
}
