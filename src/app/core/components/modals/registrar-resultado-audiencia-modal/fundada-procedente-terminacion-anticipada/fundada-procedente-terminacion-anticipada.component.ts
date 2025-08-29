import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RegistrarReparacionCivilComponent } from '@core/components/reutilizable/registrar-reparacion-civil/registrar-reparacion-civil.component';
import { TabsViewComponent } from '@core/components/tabs-view/tabs-view.component';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconAsset, IconUtil, ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { RegistroPenasAnticipadasComponent } from './registro-penas-anticipadas/registro-penas-anticipadas.component';
import { ApelacionesPenasReparacionesComponent } from './apelaciones-penas-reparaciones/apelaciones-penas-reparaciones.component';
import { Subscription } from 'rxjs';
import { validateMessageService } from '@core/services/provincial/tramites/validateMessage.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { TramiteService } from '@services/provincial/tramites/tramite.service';

@Component({
  selector: 'app-fundada-procedente-terminacion-anticipada',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TabsViewComponent,
    TabViewModule,
    TabMenuModule,
    CmpLibModule,
    RegistroPenasAnticipadasComponent,
    RegistrarReparacionCivilComponent,
    ApelacionesPenasReparacionesComponent
  ],
  templateUrl: './fundada-procedente-terminacion-anticipada.component.html',
  styleUrl: './fundada-procedente-terminacion-anticipada.component.scss'
})
export class FundadaProcedenteTerminacionAnticipadaComponent {
  protected items: MenuItem[]  = [];
  @Input() data!: any;
  resultadoForm:any;
  activeItem: any;

  ultimoItem: string = '';
  subscription!: Subscription;
  validacion: boolean = false;

  constructor(
    private readonly tramiteService: TramiteService,
    private readonly validateMessageService: validateMessageService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    protected iconAsset : IconAsset,
    protected iconUtil: IconUtil,
    private dialogRef: DynamicDialogRef,

  ) {
    this.items = [
      {
        id:"0",
        label: "Penas",
      },
      {
        id:"1",
        label: "Reparación Civil",
      },
      {
        id:"2",
        label: "Apelaciones",
      },
    ]
    this.activeItem = this.items[0];
  }

  onTabChange(event: any) {
    /**this.activeItem = event.item;**/
    if (this.ultimoItem != event.label) {
      if (this.ultimoItem !== '' && this.ultimoItem !== 'Apelaciones') {
        this.ultimoItem = event.label;
        return;
      }
      this.ultimoItem = event.label;

      if (this.ultimoItem !== 'Apelaciones') {
        this.subscription = this.validateMessageService.validacion$.subscribe((valor) => {
          this.validacion = valor;
        });

        if (this.validacion) {
          const cfeDialog = this.modalDialogService.warning(
            'Advertencia',
            'Aún no ha seleccionado una fiscalía superior a elevar, no podrá firmar el trámite',
            'Aceptar'
          );
        }
      }
    }
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  get tramiteEstadoFirmadoRecibido(): boolean {
    return this.data.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.data.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  continuar(){
    this.activeItem = this.items[Number(this.activeItem.id) + 1]
  }

  cancelar(){
    this.dialogRef.close()
  }
}
