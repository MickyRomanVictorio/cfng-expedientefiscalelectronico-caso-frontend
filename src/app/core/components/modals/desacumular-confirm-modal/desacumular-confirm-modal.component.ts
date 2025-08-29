import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-desacumular-confirm-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './desacumular-confirm-modal.component.html',
})
export class DesacumularConfirmModalComponent {
  constructor(private dialogRef: DynamicDialogRef) {}

  close() {
    this.dialogRef.close();
  }
}
