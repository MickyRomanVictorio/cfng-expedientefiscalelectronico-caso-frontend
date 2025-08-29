import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrearCuadernoExtremo, CrearSujetoProcesalExtremo, ListaSujetosProcesales } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/cuadernos-extremos.interface';
import { ListaDelitosSujetos } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/sujeto-procesal.interface';
import { CuadernosExtremosService } from '@core/services/provincial/cuadernos-extremos/cuadernos-extremos.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { urlConsultaCuaderno } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-agregar-editar-sujetos-procesales-extremo',
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
  templateUrl: './agregar-editar-sujetos-procesales-extremo.component.html',
  styleUrl: './agregar-editar-sujetos-procesales-extremo.component.scss'
})
export class AgregarEditarSujetosProcesalesExtremoComponent {

  private readonly subscriptions: Subscription[] = []

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  protected readonly iconUtil = inject(IconUtil)

  protected readonly dialogRef = inject(DynamicDialogRef)

  private readonly router = inject(Router)

  private readonly gestionCasoService = inject(GestionCasoService)

  private readonly cuadernosExtremosService = inject(CuadernosExtremosService)

  protected readonly config = inject(DynamicDialogConfig)

  @ViewChild('multiSelect') protected multiSelect!: MultiSelect;

  @ViewChild('tooltip') protected tooltip!: Tooltip;

  private caso!: Expediente;

  private readonly idSujetoCaso: string | null = null;

  protected listaSujetosProcesales: ListaSujetosProcesales[] = [];

  protected sujetosProcesalesSeleccionados: ListaSujetosProcesales[] = [];

  constructor() {
    this.idSujetoCaso = this.config.data?.idSujetoCaso;
  }

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
    this.listarSujetosProcesales();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected get edicionDelitoSujeto(): boolean {
    return this.idSujetoCaso == null || this.idSujetoCaso == undefined;
  }

  protected listarSujetosProcesales() {
    this.listaSujetosProcesales = [];
    this.subscriptions.push(
      this.cuadernosExtremosService.listarSujetosProcesales(this.caso.idCasoPadre!, this.caso.idCaso, this.idSujetoCaso).subscribe({
        next: resp => {
          if (resp?.length) {
            this.sujetosProcesalesSeleccionados = [];
            this.listaSujetosProcesales = resp;
            this.listaSujetosProcesales.forEach(sujeto => {
              sujeto.delitos.forEach(delito => {
                delito.delitoCompleto = `${delito.delitoGenerico} / ${delito.delitoSubgenerico} / ${delito.delitoEspecifico}`;
              });
              if (sujeto.idSujetoCasoSeleccionado !== null) {
                sujeto.delitosSeleccionados = this.setearDelitosObtenidos(
                  sujeto.delitos,
                  sujeto.delitosSeleccionados
                );
                this.sujetosProcesalesSeleccionados.push(sujeto);
              }
              else {
                sujeto.delitosSeleccionados = [];
              }
            });
          }
        },
        error: error => {
          this.modalDialogService.error("Error",
            `Se ha producido un error al intentar listar los sujetos procesales`);
          this.dialogRef.close();
        }
      })
    )
  }

  protected seleccionarDelito(sujeto: ListaSujetosProcesales, event: any): void {
    if (event.originalEvent.selected) {
      const delitoEncontrado = sujeto.delitos.find(
        (delito) => delito.idDelitoSujeto === event.itemValue.idDelitoSujeto
      );
      if (delitoEncontrado) {
        const request = {
          idCasoPadre: this.caso.idCaso,
          idDelitoGenerico: delitoEncontrado.idDelitoGenerico,
          idDelitoSubgenerico: delitoEncontrado.idDelitoSubgenerico,
          idDelitoEspecifico: delitoEncontrado.idDelitoEspecifico
        }
        this.subscriptions.push(
          this.cuadernosExtremosService.validarDelitosCuadernoExtremos(request).subscribe({
            next: resp => {
              if (resp?.length) {
                delitoEncontrado.existeExtremo = resp?.length > 0;
                if (delitoEncontrado.existeExtremo) {
                  delitoEncontrado.listaCuadernosExistentes = resp.map((cuaderno: any) => cuaderno.nroCaso);
                }
              }
            },
            error: error => {
              this.modalDialogService.error("Error", `Se ha producido un error al intentar validar la existencia del delito en otros cuadernos extremos`, 'Aceptar');
            }
          })
        )
      }
    }
  }
  protected setearDelitosObtenidos(
    listaTotal: ListaDelitosSujetos[],
    listaObtenidos: ListaDelitosSujetos[]
  ): ListaDelitosSujetos[] {
    console.log(listaTotal)
    console.log(listaObtenidos)
    const obtenidosSet = new Set(
      listaObtenidos.map(
        (delito) =>
          `${delito.idDelitoEspecifico}-${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}`
      )
    );
    console.log(obtenidosSet)
    return listaTotal.filter((delito) =>
      obtenidosSet.has(
        `${delito.idDelitoEspecifico}-${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}`
      )
    );
  }

  protected quitarDelito(sujeto: ListaSujetosProcesales, delito: ListaDelitosSujetos, event: Event, multiSelect: any): void {
    event.stopPropagation();
    sujeto.delitosSeleccionados = sujeto.delitosSeleccionados.filter(
      d => d.idDelitoSujeto !== delito.idDelitoSujeto
    );
    multiSelect.hide();
    this.listaSujetosProcesales = [...this.listaSujetosProcesales];
  }

  protected quitarSeleccionSujeto(event: any): void {
    event.data.delitosSeleccionados = [];
  }

  protected quitarSeleccionSujetoTabla(event: any): void {
    if (!event.checked) {
      this.listaSujetosProcesales.forEach(sujeto => sujeto.delitosSeleccionados = []);
    }
  }

  protected sujetoSeleccionado(
    idSujetoCaso: string
  ): boolean {
    return this.sujetosProcesalesSeleccionados.some(sujeto => sujeto.idSujetoCaso === idSujetoCaso);
  }

  protected validarSeleccionSujetos(): boolean {
    if (!this.sujetosProcesalesSeleccionados || this.sujetosProcesalesSeleccionados.length === 0) {
      return false;
    }
    return this.sujetosProcesalesSeleccionados.every(
      (sujeto) => sujeto.delitosSeleccionados && sujeto.delitosSeleccionados.length > 0
    );
  }

  protected verificarExistenciaExtremo(sujetos: CrearSujetoProcesalExtremo[]): boolean {
    return sujetos.some(sujeto =>
      sujeto.delitos.some(delito => delito.existeExtremo)
    );
  }

  protected confirmarCrearCuaderno() {

    let sujetos: CrearSujetoProcesalExtremo[] = [];
    this.sujetosProcesalesSeleccionados.forEach(sujetosProcesal => {
      sujetos.push(
        {
          idSujetoCaso: sujetosProcesal.idSujetoCaso,
          delitos: sujetosProcesal.delitosSeleccionados
        }
      );
    })
    const request: CrearCuadernoExtremo = {
      idCaso: this.caso.idCaso,
      sujetos: sujetos
    }
    if (this.verificarExistenciaExtremo(sujetos)) {
      const dialog = this.modalDialogService.question(
        'Posible duplicidad de delitos y sujetos',
        'Existen alertas de posibles duplicidades en el registro de delitos ¿De todas maneras desea continuar?',
        'Continuar',
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.editarSujetos(request);
          }
        },
      });
    }
    else {
      this.editarSujetos(request);
    }
  }

  protected editarSujetos(request: CrearCuadernoExtremo) {

    if (this.edicionDelitoSujeto) {
      this.subscriptions.push(
        this.cuadernosExtremosService.editarSujetosExtremo(request).subscribe({
          next: resp => {
            if (resp?.code == 0) {
              this.modalDialogService.success(
                'Cuaderno creado correctamente', 'Se modificó los sujetos procesales del cuaderno ' + this.caso.numeroCaso + ' satisfactoriamente');
              this.dialogRef.close(RESPUESTA_MODAL.OK);
            }
          },
          error: error => {
            this.modalDialogService.error("ERROR", "Error al intentar modificar los sujetos del cuaderno de extremos", 'Aceptar');
          }
        })
      );
    }
    else {
      this.subscriptions.push(
        this.cuadernosExtremosService.editarDelitosSujetosExtremo(request).subscribe({
          next: resp => {
            if (resp?.code == 0) {
              this.modalDialogService.success(
              'Sujeto actualizado', 'Se actualizó los delitos del sujeto satisfactoriamente');
              this.dialogRef.close(RESPUESTA_MODAL.OK);
            }
          },
          error: error => {
            this.modalDialogService.error("ERROR", "Error al intentar modificar el sujeto del cuaderno de extremos", 'Aceptar');
          }
        })
      );
    }


  }

  protected cerrarVentana() {
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

  protected tipificarNuevosDelitos(idSujetoCaso: string): void {
    this.dialogRef.close()
    this.router.navigate([`${urlConsultaCuaderno('extremo', this.caso)}/sujeto/${idSujetoCaso}`]);
  }

  protected mostrarcTooltipDelito(item: ListaDelitosSujetos): string {
    if (item.existeExtremo) {
      const textCuaderno = item.listaCuadernosExistentes?.length == 1 ? 'el cuaderno de extremos' : 'los cuadernos de extremos';
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
