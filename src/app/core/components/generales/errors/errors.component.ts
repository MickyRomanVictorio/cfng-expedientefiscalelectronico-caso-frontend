import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import InputErrorMessagesUtil from '@core/utils/input-error';
@Component({
  selector: 'app-errors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './errors.component.html',
})
export class ErrorsComponent {
  @Input() isSubmitted!: Boolean;
  @Input() control!: FormControl;

  getErrorMessage() {
    for (let propertyName in this.control.errors) {
      const { errors, dirty, touched } = this.control;
      const isInvalid =
        errors.hasOwnProperty(propertyName) &&
        (dirty || touched || this.isSubmitted);

      if (isInvalid) {
        return InputErrorMessagesUtil.getMessages(
          propertyName,
          errors[propertyName]
        );
      }
    }
    return null;
  }
}
