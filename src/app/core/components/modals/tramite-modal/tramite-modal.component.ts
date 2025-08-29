import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalTramiteData } from '@interfaces/provincial/bandeja-tramites/ModalTramite';
import { IconType } from '@core/types/IconType';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-tramite-modal',
  templateUrl: './tramite-modal.component.html',
  styleUrls: ['./tramite-modal.component.scss'],
})
export class TramiteModalComponent implements OnInit {
  public accion: string = '';
  public containerClass:string = '';
  public icon: IconType;
  public title: string = '';
  public description: string = '';
  public tituloPrimerBoton: string = '';
  public tituloSegundoBoton: string = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig<ModalTramiteData>,
    private sanitizer: DomSanitizer
  ) {
    this.accion = this.config.data!.accion;
    this.containerClass = this.config.data!.containerClass;
    this.icon = this.config.data!.icon;
    this.title = this.config.data!.title;
    this.description = this.config.data!.description!;
    this.tituloPrimerBoton = this.config.data!.tituloPrimerBoton!;
    this.tituloSegundoBoton = this.config.data!.tituloSegundoBoton!;
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

  public ordenNotificacion(): void {
    this.ref.close('notificar');
  }

  public ordenCitacion(): void {
    this.ref.close('citar');
  }

  public editarTramite(): void {
    this.ref.close('editar');
  }

  public cancelar(): void {
    this.ref.close('cancelar');
  }

  public closeAction(): void {
    this.ref.close('closed');
  }
}
