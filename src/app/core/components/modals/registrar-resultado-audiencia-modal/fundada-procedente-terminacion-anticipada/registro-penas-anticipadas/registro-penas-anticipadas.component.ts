import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegistrarPenasComponent } from '@core/components/reutilizable/registrar-penas/registrar-penas.component';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { RegistrarPenasService } from '@core/services/reusables/otros/registrar-penas.service';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'dist/cmp-lib';
import { TIPO_ACCION } from '@core/types/tipo-accion.type';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { DataPena } from '@core/interfaces/reusables/registrar-penas/data-pena.interface';

@Component({
  selector: 'app-registro-penas-anticipadas',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TableModule,
    CmpLibModule,
    RegistrarPenasComponent
  ],
  templateUrl: './registro-penas-anticipadas.component.html',
  styleUrl: './registro-penas-anticipadas.component.scss'
})
export class RegistroPenasAnticipadasComponent {

  @Input() data!: DataPena;

  @Input() modoLectura!: boolean;

  obtenerIcono = obtenerIcono;
  private subscriptions: Subscription[] = []
  idActoTramiteCaso!: string;
  idCaso!: string;
  TIPO_SENTENCIA:number=1334;
  idActoTramiteDelitoSujeto!:string;
  idPena!:string;
  mostrarModalVerEditar: boolean = false;
  ACCION_CREAR:TIPO_ACCION=TIPO_ACCION.CREAR;
  ACCION_VER:TIPO_ACCION=TIPO_ACCION.VISUALIZAR;
  ACCION_EDITAR:TIPO_ACCION=TIPO_ACCION.EDITAR;
  accion:number=0;
  listaPenas: any = [];

  constructor(
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private registrarPenasService: RegistrarPenasService,
    protected iconUtil: IconUtil
  ) {

  }
  ngOnInit() {
    this.idActoTramiteCaso = this.data?.idActoTramiteCaso;
    this.idCaso = this.data?.idCaso;
    this.listarPenas();
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  listarPenas() {
    this.subscriptions.push(
      this.registrarPenasService.listarPenas(this.idActoTramiteCaso).subscribe({
        next: resp => {
          console.log(resp);

         this.listaPenas=resp
        }
      })
    )
  }
  abrirVerEditarModal(idActoTramiteDelitoSujeto:string,idPena:string,accion:number) {
    this.mostrarModalVerEditar = true;
    this.accion=accion;
    this.idActoTramiteDelitoSujeto=idActoTramiteDelitoSujeto;
    this.idPena=idPena;
  }

  eliminarPena(pena: any) {
    const dialog = this.modalDialogService.question("Eliminar Pena",
      "A continuación, se eliminará el registro de pena de "+pena.sujeto+" ¿Está seguro de realizar la siguiente acción?", 'Aceptar', 'Cancelar');
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.subscriptions.push(
            this.registrarPenasService.eliminarPena(pena.idActoTramiteDelitoSujeto, pena.idPena).subscribe({
              next: resp => {
                if (resp?.code === "0") {
                  this.modalDialogService.info("Éxito", 'Pena eliminada correctamente', 'Aceptar');
                  this.listarPenas();
                }
              },
              error: error => {
                this.modalDialogService.error("ERROR", "Error al intentar eliminar la pena", 'Aceptar');
              }
            })
          );
        }
      }
    });

  }
  respuestaFormulario(data: any) {
    if(data?.respuesta){
      this.listarPenas();
    }
    if(this.accion==1 || this.accion==2){
      this.mostrarModalVerEditar = false;
    }
  }

}
