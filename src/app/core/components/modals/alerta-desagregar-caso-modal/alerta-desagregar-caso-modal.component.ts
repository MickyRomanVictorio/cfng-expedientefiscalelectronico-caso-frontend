import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertaDataDesagregados } from '@interfaces/provincial/administracion-casos/desagregar/AlertaDesagregar';
import { GruposDesagregados } from '@interfaces/provincial/administracion-casos/desagregar/GruposDesagregados';
import { IconType } from '@core/types/IconType';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-alerta-desagregar-caso-modal',
  templateUrl: './alerta-desagregar-caso-modal.component.html',
})
export class AlertaDesagregarCasoModalComponent implements OnInit {
  public containerClass:any;
  public icon: IconType;
  public title: string;
  public description: string;
  public confirmButtonText: string;
  public cancelButtonText: string;
  public confirm: boolean;
  public gruposDesagregados: GruposDesagregados[];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig<AlertaDataDesagregados>,
    private sanitizer: DomSanitizer
  ) {
    this.containerClass = this.config.data!.containerClass;
    this.icon = this.config.data!.icon;
    this.title = this.config.data!.title || '';
    this.description = this.config.data!.description || '';
    this.confirmButtonText = this.config.data!.confirmButtonText || 'Confirmar';
    this.cancelButtonText = this.config.data!.cancelButtonText || 'Cancelar';
    this.confirm = this.config.data!.confirm || false;
    this.gruposDesagregados = this.config.data!.gruposDesagregados || [];
  }

  ngOnInit() {}

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  get alertIcon(): string {
    return `assets/icons/${this.icon}.svg`;
  }

  get showDescription(): boolean {
    return this.description !== '';
  }

  public getDescription(): any {
    return this.sanitizer.bypassSecurityTrustHtml(this.description);
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
