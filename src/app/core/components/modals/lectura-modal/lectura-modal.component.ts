import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { EncabezadoModalComponent } from '@components/modals/encabezado-modal/encabezado-modal.component';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-lectura-modal',
  templateUrl: './lectura-modal.component.html',
  imports: [
    CommonModule,
    SelectButtonModule,
    ReactiveFormsModule,
    InputTextareaModule,
    InputTextareaModule,
    EncabezadoModalComponent,
    CommonModule,
    ButtonModule,
    InputTextareaModule,
  ],
})
export class LecturaModalComponent implements OnInit {
  public subscriptions: Subscription[] = [];
  public numeroCaso = '';
  public content = '';
  public containerClass = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizer: DomSanitizer
  ) {
    this.numeroCaso = this.config.data.numeroCaso;
    this.content = this.config.data.content;
    this.containerClass = this.config.data.containerClass;
  }

  public getCaso(): any {
    const caso = this.numeroCaso.split('-');
    const casoHtml = `Motivo de anulación del caso: <div class="cfe-caso">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</div>`;
    return this.sanitizer.bypassSecurityTrustHtml(casoHtml);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  public confirmAction(): void {
    this.ref.close('confirm');
  }

  public cancelAction(): void {
    this.ref.close('cancel');
  }

  public closeAction(): void {
    this.ref.close('closed');
  }
}
