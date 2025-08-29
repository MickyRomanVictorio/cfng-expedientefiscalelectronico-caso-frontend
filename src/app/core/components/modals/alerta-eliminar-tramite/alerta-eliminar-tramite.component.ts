import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InformacionEliminarTramite } from '@interfaces/reusables/eliminar-tramite/informacion-eliminar-tramite';
import { IconType } from '@core/types/IconType';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { EliminarTramiteModalComponent } from '../eliminar-tramite-modal/eliminar-tramite-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-alerta-eliminar-tramite',
  templateUrl: './alerta-eliminar-tramite.component.html',
  styleUrls: ['./alerta-eliminar-tramite.component.scss'],
  providers: [DialogService],
})
export class AlertaEliminarTramiteComponent implements OnInit {
  public containerClass:any;
  public icon: IconType;
  public title: string;
  public description: string;
  public confirmButtonText: string;
  public cancelButtonText: string;
  public confirm: boolean;
  public dato: any;

  public referenciaModal!: DynamicDialogRef;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig<InformacionEliminarTramite>,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService
  ) {
    this.containerClass = this.config.data!.containerClass;
    this.icon = this.config.data!.icon;
    this.title = this.config.data!.titulo || '';
    this.description = this.config.data!.descripcion || '';
    this.confirmButtonText = this.config.data!.confirmButtonText || 'Continuar';
    this.cancelButtonText = this.config.data!.cancelButtonText || 'Cancelar';
    this.confirm = this.config.data!.confirm || false;
    this.dato = this.config.data!.dato;
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
    this.mostrarDialogEliminarTramite();
    this.ref.close('confirm');
  }

  public cancelAction(): void {
    this.ref.close('cancel');
  }

  public closeAction(): void {
    this.ref.close('closed');
  }

  public mostrarDialogEliminarTramite() {
    this.referenciaModal = this.dialogService.open( EliminarTramiteModalComponent, {
        width: '600px',
        showHeader: false,
        //contentStyle: { padding: '0', 'border-radius': '15px' },
        data: {
          dato: this.dato,
        },
      }
    );
  }
}
