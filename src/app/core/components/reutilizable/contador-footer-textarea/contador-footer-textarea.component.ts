import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'contador-footer-textarea',
  standalone: true,
  imports: [NgClass],
  templateUrl: './contador-footer-textarea.component.html',
  styleUrl: './contador-footer-textarea.component.scss'
})
export class ContadorFooterTextareaComponent {
  /**
   * 🟢 **Variable de tipo FormControl**
   * - FormControl del campo textarea
   */
  public textarea = input.required<AbstractControl | null>()
  /**
   * 🟢 **Variable de tipo Number**
   * - Tamaño del Textarea
   */
  public size = input<number>(200);

  protected counterReportChar(): number {
    return this.textarea()!.value !== null
      ? this.textarea()!.value.length
      : 0;
  }
}
