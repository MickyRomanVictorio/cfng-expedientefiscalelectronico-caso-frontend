import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ResumenResultadoComponent } from './resumen-resultado/resumen-resultado.component';
import { ApelacionesResultadosComponent } from './apelaciones-resultados/apelaciones-resultados.component';
import { MenuItem } from 'primeng/api';
import { IconAsset, ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'dist/cmp-lib';
import { RegistrarReparacionCivilComponent } from '@core/components/reutilizable/registrar-reparacion-civil/registrar-reparacion-civil.component';
import { Subscription } from 'rxjs';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { validateMessageService } from '@core/services/provincial/tramites/validateMessage.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-fundada-procedente',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TabViewModule,
    TabMenuModule,
    CmpLibModule,
    ResumenResultadoComponent,
    RegistrarReparacionCivilComponent,
    ApelacionesResultadosComponent
  ],
  templateUrl: './fundada-procedente.component.html',
  styleUrl: './fundada-procedente.component.scss'
})
export class FundadaProcedenteComponent {
  obtenerIcono = obtenerIcono;
  protected items: MenuItem[] = [];
  @Input() data!: any;
  activeItem: any;

  ultimoItem: string = '';
  subscription!: Subscription;
  validacion: boolean = false;

  constructor(
    private readonly validateMessageService: validateMessageService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly tramiteService: TramiteService,
    protected iconAsset: IconAsset,
    private dialogRef: DynamicDialogRef,
  ) {
    this.items = [
      {
        label: "Salidas Alternas",
        id: '0'
      },
      {
        label: "Apelaciones",
        id: '1'
      },
      {
        label: "Resumen",
        id: '2'
      }
    ]
    this.activeItem = this.items[0];
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  get tramiteEstadoFirmadoRecibido(): boolean {
    return this.data.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.data.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  onTabChange(event: any) {
    /**this.activeItem = event.item;**/
    if (this.ultimoItem != event.label) {
      if (this.ultimoItem !== '' && this.ultimoItem !== 'Apelaciones') {
        this.ultimoItem = event.label;
        return;
      }
      this.ultimoItem = event.label

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

  continuar(){
    this.activeItem = this.items[Number(this.activeItem.id) + 1]
  }

  cancelar(){
    this.dialogRef.close()
  }
}
