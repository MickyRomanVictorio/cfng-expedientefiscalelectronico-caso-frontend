import { AfterViewInit, Directive, Input } from '@angular/core';
import { Calendar } from 'primeng/calendar';
import Inputmask from 'inputmask';

@Directive({
  selector: '[dateMask]',
})
export class DateMaskDirective implements AfterViewInit {
  
  constructor(private readonly primeCalendar: Calendar) {}
  @Input() withDateTime = false;
  
  ngAfterViewInit() {
    const calendar = this.getHTMLInput();
    const im = new Inputmask(this.getDateMask());
    im.mask(calendar);
  }

  getHTMLInput(): HTMLInputElement {
    return this.primeCalendar.el.nativeElement.querySelector('input');
  }

  getDateMask(): string {
    if (this.withDateTime) {
      return '99/99/9999 99:99';
    } else {
      return '99/99/9999';
    }
  }
}
