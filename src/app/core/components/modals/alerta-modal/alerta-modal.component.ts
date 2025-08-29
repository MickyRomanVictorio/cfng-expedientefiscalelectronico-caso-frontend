import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertaData } from '@interfaces/comunes/alert';
import { IconType } from '@core/types/IconType';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { valid } from '@core/utils/string';

@Component({
  standalone: true,
  selector: 'app-alerta-modal',
  templateUrl: './alerta-modal.component.html',
  styleUrls: ['./alerta-modal.component.scss'],
  imports: [CommonModule],
  providers: [DialogService],
})
export class AlertaModalComponent implements OnInit {
  public containerClass:any
  public icon: IconType;
  public title: string;
  public description: string;
  public confirmButtonText: string;
  public confirmSecondButtonText: string;
  public cancelButtonText: string;
  public irHechosCasosButtonText: string;
  public confirm: boolean;
  public confirmSecond: boolean;
  public confirmHechosCasos: boolean;
  public ocultarBotones: boolean;
  public ocultarCierre: boolean;
  public rowsView: boolean;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig<AlertaData>,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService
  ) {
    this.containerClass = this.config.data!.containerClass;
    this.icon = this.config.data!.icon;
    this.title = this.config.data!.title || '';
    this.description = this.config.data!.description || '';
    this.confirmButtonText = this.config.data!.confirmButtonText || 'Confirmar';
    this.confirmSecondButtonText = this.config.data!.confirmSecondButtonText || 'Confirmar';
    this.cancelButtonText = this.config.data!.cancelButtonText || 'Cancelar';
    this.irHechosCasosButtonText =
      this.config.data!.irHechoCasoButtonText || 'Cancelar';
    this.confirm = this.config.data!.confirm || false;
    this.confirmSecond = this.config.data!.confirmSecond || false;
    this.confirmHechosCasos = this.config.data!.confirmHechosCasos || false;
    this.ocultarBotones = this.config.data!!.ocultarBotones || false;
    this.ocultarCierre = this.config.data!.ocultarCierre || false;
    this.rowsView = this.config.data!.rowsView || false;
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

  public validarEstiloListaDescripcion(): boolean {
    return valid(this.description) ? this.description.includes("<ul>"):false;
  }
  public confirmAction(): void {
    this.ref.close('confirm');
  }

  public confirmAction2(): void {
    this.ref.close('confirm2');
  }

  public cancelAction(): void {
    this.ref.close('cancel');
  }

  public closeAction(): void {
    this.ref.close('closedAction');
  }



}
