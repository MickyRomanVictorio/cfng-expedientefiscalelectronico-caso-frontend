import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrearCuadernoExtremo, CrearSujetoProcesalExtremo, ListaSujetosProcesales } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/cuadernos-extremos.interface';
import { ListaDelitosSujetos } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/sujeto-procesal.interface';
import { CuadernosExtremosService } from '@core/services/provincial/cuadernos-extremos/cuadernos-extremos.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { urlConsultaCasoFiscal } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import {  DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nuevo-cuaderno-extremo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CmpLibModule,
    TableModule,
    MultiSelectModule,
    FormsModule,
    TooltipModule
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './nuevo-cuaderno-extremo.component.html',
  styleUrl: './nuevo-cuaderno-extremo.component.scss'
})
export class NuevoCuadernoExtremoComponent {

  private readonly subscriptions: Subscription[] = [];
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    protected iconUtil: IconUtil,
    private readonly router: Router,
    private readonly gestionCasoService: GestionCasoService,
    private readonly cuadernosExtremosService: CuadernosExtremosService,

  ) {
  }
  @ViewChild('multiSelect') multiSelect!: MultiSelect;
  private caso!: Expediente;
  listaSujetosProcesales: ListaSujetosProcesales[] = [];
  sujetosProcesalesSeleccionados: ListaSujetosProcesales[] = [];
  @ViewChild('tooltip') tooltip!: Tooltip;

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
    this.listarSujetosProcesales();

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  listarSujetosProcesales() {
    this.listaSujetosProcesales = [];
    this.subscriptions.push(
      this.cuadernosExtremosService.listarSujetosProcesales(this.caso.idCaso).subscribe({
        next: resp => {
          if (resp?.length) {
            this.listaSujetosProcesales = resp;
            this.listaSujetosProcesales.forEach(sujeto => {
              sujeto.delitos.forEach(delito => {
                delito.delitoCompleto = `${delito.delitoGenerico} / ${delito.delitoSubgenerico} / ${delito.delitoEspecifico}`;
              });
              sujeto.delitosSeleccionados = [];
            });
          }
        },
        error: error => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar listar los sujetos procesales`, 'Aceptar');
          this.dialogRef.close();
        }
      })
    )
  }

  seleccionarDelito(sujeto: ListaSujetosProcesales, event: any): void {
    if (event.originalEvent.selected) {
      //ACA AGREGA LA API PARA VALIDAR SI EXISTE  EL DELITO CON EL SUJETO EN OTRO EXTREMO
      const delitoEncontrado = sujeto.delitos.find(
        (delito) => delito.idDelitoSujeto === event.itemValue.idDelitoSujeto
      );
      if (delitoEncontrado) {
        const request={
          idCasoPadre:this.caso.idCaso,
          idDelitoGenerico:delitoEncontrado.idDelitoGenerico,
          idDelitoSubgenerico:delitoEncontrado.idDelitoSubgenerico,
          idDelitoEspecifico:delitoEncontrado.idDelitoEspecifico
        }
        this.subscriptions.push(
          this.cuadernosExtremosService.validarDelitosCuadernoExtremos(request).subscribe({
            next: resp => {
              if (resp?.length) {
                delitoEncontrado.existeExtremo = resp?.length > 0;
                if(delitoEncontrado.existeExtremo){
                  delitoEncontrado.listaCuadernosExistentes= resp.map((cuaderno:any) => cuaderno.nroCaso);
                }
              }
            },
            error: error => {
              this.modalDialogService.error("Error", `Se ha producido un error al intentar validar la existencia del delito en otros cuadernos extremos`, 'Ok');
            }
          })
        )
      }
    }
  }

  quitarDelito(sujeto: ListaSujetosProcesales, delito: ListaDelitosSujetos, event: Event, multiSelect: any): void {
    event.stopPropagation();
    sujeto.delitosSeleccionados = sujeto.delitosSeleccionados.filter(
      d => d.idDelitoSujeto !== delito.idDelitoSujeto
    );
    multiSelect.hide();
    this.listaSujetosProcesales = [...this.listaSujetosProcesales];
  }

  quitarSeleccionSujeto(event: any): void {
    event.data.delitosSeleccionados = [];
  }

  quitarSeleccionSujetoTabla(event: any): void {
    if (!event.checked) {
      this.listaSujetosProcesales.forEach(sujeto => sujeto.delitosSeleccionados = []);
    }
  }

  sujetoSeleccionado(
    idSujetoCaso: string
  ): boolean {
    return this.sujetosProcesalesSeleccionados.some(sujeto => sujeto.idSujetoCaso === idSujetoCaso);
  }

  validarSeleccionSujetos(): boolean {
    if (!this.sujetosProcesalesSeleccionados || this.sujetosProcesalesSeleccionados.length === 0) {
      return false;
    }
    return this.sujetosProcesalesSeleccionados.every(
      (sujeto) => sujeto.delitosSeleccionados && sujeto.delitosSeleccionados.length > 0
    );
  }

  verificarExistenciaExtremo(sujetos: CrearSujetoProcesalExtremo[]): boolean {
    return sujetos.some(sujeto =>
      sujeto.delitos.some(delito => delito.existeExtremo)
    );
  }

  confirmarCrearCuaderno(){
    let sujetos:CrearSujetoProcesalExtremo[]=[];
    this.sujetosProcesalesSeleccionados.forEach(sujetosProcesal => {
      sujetos.push(
        {
          idSujetoCaso:sujetosProcesal.idSujetoCaso,
          delitos:sujetosProcesal.delitosSeleccionados
        }
      );
    })
    const request:CrearCuadernoExtremo ={
      idCaso:this.caso.idCaso,
      sujetos:sujetos
    }
    if(this.verificarExistenciaExtremo(sujetos)){
      const dialog = this.modalDialogService.question(
        'Posible duplicidad de delitos y sujetos',
        'Existen alertas de posibles duplicidades en el registro de delitos ¿De todas maneras desea continuar?',
        'Continuar',
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.crearCuaderno(request);
          }
        },
      });
    }
    else{
      this.crearCuaderno(request);
    }
  }

  crearCuaderno(request:CrearCuadernoExtremo) {
    this.subscriptions.push(
      this.cuadernosExtremosService.crearCuadernoExtremos(request).subscribe({
        next: resp => {
          if(resp?.codigo == 200){
            this.modalDialogService.success(
              'Cuaderno creado correctamente','Se creó el cuaderno '+resp?.data?.nroCaso);
          this.dialogRef.close(RESPUESTA_MODAL.OK);
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar crear el cuaderno de extremos", 'Ok');
        }
      })
    );

  }

  cerrarVentana() {
    const validar: boolean = this.validarSeleccionSujetos();
    if (validar) {
      const dialog = this.modalDialogService.question(
        'Cancelar',
        'Confirme la acción, se perderán todas las selecciones realizadas',
        'Confirmar',
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.dialogRef.close()
          }
        },
      });
    }
    else {
      this.dialogRef.close()
    }
  }

  tipificarNuevosDelitos(idSujetoCaso: string): void {
    this.dialogRef.close()
    this.router.navigate([`${urlConsultaCasoFiscal(this.caso)}/sujeto/${idSujetoCaso}`]);
  }

  mostrarcTooltipDelito(item: ListaDelitosSujetos): string {
    if(item.existeExtremo){
      const textCuaderno=item.listaCuadernosExistentes?.length == 1?'el cuaderno de extremos':'los cuadernos de extremos';
      return `
      <div class="flex-center pl-2 pb-3 pr-2 border-round-lg label-bg-info">
        <img src="assets/icons/info.svg" width="25" alt="info">
          <span class="text-md ml-2">
              El delito <strong>${item.delitoCompleto},</strong> ya se encuentra
              registrado en ${textCuaderno} <strong style="text-decoration: underline;">${item.listaCuadernosExistentes.join(", ")}</strong>
          </span>
      </div>
      `;
    }
    return '';
  }
}
