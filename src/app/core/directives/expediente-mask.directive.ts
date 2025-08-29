import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import Inputmask from 'inputmask';

@Directive({
  selector: '[expedienteMask]',
})
export class ExpedienteMaskDirective implements AfterViewInit {
  constructor(private el: ElementRef) {    
  }

  ngAfterViewInit() {    
    const input = this.getHTMLInput();
    if (input) {
      const mask = new Inputmask(this.getExpedienteMask());
      mask.mask(input);
    }
  }

  private getHTMLInput(): HTMLInputElement | null {
    return this.el.nativeElement.querySelector('input') || this.el.nativeElement;
  }

  private getExpedienteMask(): string {
    return '99999-9999-9-9999-AA-AA-99'; 
  }
}
