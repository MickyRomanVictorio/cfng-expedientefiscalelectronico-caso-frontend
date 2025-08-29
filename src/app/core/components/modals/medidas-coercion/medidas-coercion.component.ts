import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogoInterface } from '@core/interfaces/comunes/catalogo-interface';
import { Combo } from '@core/interfaces/comunes/combo';
import {
  GenericResponse,
  GenericResponseList,
} from '@core/interfaces/comunes/GenericResponse';
import {
  MedidaCoercionSujeto,
  RegistrarMedidasMultipleDetalleRequest,
  RegistrarMedidasMultipleRequest
} from '@core/interfaces/provincial/tramites/comun/calificacion/requerimiento-incoacion/registrar-requerimiento.interface';
import { SujetoProcesal } from '@core/interfaces/provincial/tramites/comun/calificacion/requerimiento-incoacion/sujetos-procesales.interface';
import { RequerimientoIncoacionService } from '@core/services/provincial/tramites/comun/calificacion/requerimiento-incoacion/requerimiento-incoacion.service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { NO_GRUPO_CATALOGO } from '@core/types/grupo-catalago';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconAsset, IconUtil } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-medidas-coercion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    MultiSelectModule,
    CmpLibModule,
    RouterLink,
    MessagesModule,
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './medidas-coercion.component.html',
  styleUrl: './medidas-coercion.component.scss',
})
export class MedidasCoercionComponent implements OnInit {
  protected listaTipoParteSujeto: Combo[] = [];
  protected listaSujetosProcesales: SujetoProcesal[] = [];
  protected listaTipoMedidaCoercion: CatalogoInterface[] = [];
  protected listaMedidasCoercion: Combo[] = [];
  protected listaMedidasCoercionSujetos: MedidaCoercionSujeto[] = [];
  protected listaMedidasCoercionSujetosOriginal: MedidaCoercionSujeto[] = [];

  protected subscriptions: Subscription[] = [];

  sujetosSeleccionados: SujetoProcesal[] = [];
  tipoMedidaCoercionSeleccionada!: CatalogoInterface| null;
  medidasCoercionSeleccionadas: Combo[] = [];
  sujetoSeleccionado: any;
  idCaso: string = '';
  etapa: string = '';
  idActoTramiteCaso: string = '';
  activarMedidaCoercion: boolean = false;
  verMensaje: boolean = false;
  mensaje: string = '';
  modoLectura: boolean = false;

  constructor(
    protected iconUtil: IconUtil,
    protected ref: DynamicDialogRef,
    protected config: DynamicDialogConfig,
    protected maestrosService: MaestroService,
    protected requerimientoIncoacionService: RequerimientoIncoacionService,
    protected iconAsset: IconAsset,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
    this.idCaso = this.config.data?.idCaso;
    this.etapa = this.config.data?.etapa;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.modoLectura = this.config.data?.modoLectura;
  }

  ngOnInit(): void {
    this.obtenerSujetosParte();
    this.obtenerSujetosProcesales();
    this.obtenerTipoMedidaCoercion();
    this.obtenerMedidasCoercion();
    this.listarMedidasCoercionSujetos(true);
  }
  get validarDesactivarCheckTodo(): boolean {
    return !this.listaSujetosProcesales.some(sujeto => sujeto.idTipoParteSujeto === 4 && sujeto.flVerificado === '1');
  }

  protected obtenerSujetosParte() {
    this.subscriptions.push(
      this.maestrosService.obtenerTipoParteSujetoInvestigados().subscribe({
        next: (resp: GenericResponseList<Combo>) => {
          this.listaTipoParteSujeto = resp.data;
        },
      })
    );
  }

  protected obtenerSujetosProcesales() {
    this.subscriptions.push(
      this.requerimientoIncoacionService
        .obtenerInvestigados(this.idCaso)
        .subscribe({
          next: (resp: GenericResponseList<SujetoProcesal>) => {
            this.listaSujetosProcesales = resp.data;
            this.listaSujetosProcesales = this.listaSujetosProcesales.map(sujeto => 
              ({ ...sujeto, idTipoParteSujetoOriginal: sujeto.idTipoParteSujeto })
            );
          },
        })
    );
  }

  protected obtenerUrlSujetos(): string {
    return `${'/app/administracion-casos/consultar-casos-fiscales/[ETAPA]/caso/[CASO]/sujeto'
      .replace('[CASO]', this.idCaso)
      .replace('[ETAPA]', this.etapa)}`;
  }

  protected obtenerTipoMedidaCoercion() {
    this.subscriptions.push(
      this.maestrosService
        .obtenerCatalogo(NO_GRUPO_CATALOGO.TIPO_MEDIDA_COERCION)
        .subscribe({
          next: (resp: GenericResponseList<CatalogoInterface>) => {
            this.listaTipoMedidaCoercion = resp.data;
          },
        })
    );
  }

  protected obtenerMedidasCoercion() {
    this.medidasCoercionSeleccionadas = [];
    this.activarMedidaCoercion = false;
    if (
      this.tipoMedidaCoercionSeleccionada &&
      this.tipoMedidaCoercionSeleccionada !== null
    ) {
      this.subscriptions.push(
        this.maestrosService
          .obtenerMedidasCoercion(this.tipoMedidaCoercionSeleccionada.id)
          .subscribe({
            next: (resp: GenericResponseList<Combo>) => {
              this.listaMedidasCoercion = resp.data;
              this.activarMedidaCoercion = true;
            },
          })
      );
    }
  }

 private listarMedidasCoercionSujetos(inicio:boolean = false) {
    this.subscriptions.push(
      this.requerimientoIncoacionService
        .obtenerMedidasCoercionSujetos(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: GenericResponseList<MedidaCoercionSujeto>) => {
            this.listaMedidasCoercionSujetos = resp.data;
            if(inicio){
              this.listaMedidasCoercionSujetosOriginal= JSON.parse(JSON.stringify(this.listaMedidasCoercionSujetos));
            }
          },
        })
    );
  }

  private compararMedidasSujetosModificadas(array1: MedidaCoercionSujeto[], array2: MedidaCoercionSujeto[]): boolean {
      if (array1.length !== array2.length) {
        return false;
      }
      return array1.every((item, index) => {
        const item2 = array2[index];
    
        return (
          item.idActoTramiteCasoSujeto === item2.idActoTramiteCasoSujeto &&
          item.idMedidaCoercitiva === item2.idMedidaCoercitiva &&
          item.idTipoMedidaCoercitiva === item2.idTipoMedidaCoercitiva
        );
      });
  }

  protected close() {
    let editado:boolean=false;
    if(this.listaMedidasCoercionSujetosOriginal.length>0){
      editado=!this.compararMedidasSujetosModificadas(
          this.listaMedidasCoercionSujetos,
          this.listaMedidasCoercionSujetosOriginal
        )
    }
    this.ref.close(editado);
  }

  protected agregarMedidasCoercion() {
    if (
      this.tipoMedidaCoercionSeleccionada &&
      this.tipoMedidaCoercionSeleccionada !== null &&
      this.medidasCoercionSeleccionadas.length === 0
    ) {
      this.verMensaje = true;
      this.mensaje = 'Seleccione una medida de coerción';
      return;
    }
    let medidasCoercionSujetoDetalleRequest: RegistrarMedidasMultipleDetalleRequest[] = [];
    const medidas = this.tipoMedidaCoercionSeleccionada == null 
      ? [{ id: 3,nombre:"COMPARECENCIA SIMPLE" }] 
      : this.medidasCoercionSeleccionadas;
    
    this.sujetosSeleccionados.forEach((s) => {
      medidas.forEach((m) => {
        medidasCoercionSujetoDetalleRequest.push({
          idMedidaCoercion: m.id,
          idSujetoCaso: s.idSujetoCaso,
          idTipoParteSujeto: s.idTipoParteSujeto,
          sujeto:s.nombreSujeto,
          medida:m.nombre
        });
      });
    });
    
    const request: RegistrarMedidasMultipleRequest = {
      idCaso:this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      detalle: medidasCoercionSujetoDetalleRequest
    };

    this.subscriptions.push(
      this.requerimientoIncoacionService.guardarMedidaCoercionMultiple(request).subscribe({
        next: resp => {
          if(resp.code == 0){
            this.listarMedidasCoercionSujetos();
            this.sujetosSeleccionados = [];
            this.tipoMedidaCoercionSeleccionada = null;
            this.medidasCoercionSeleccionadas = [];
            this.sujetoSeleccionado = null;
            this.modalDialogService.success(
              'Medida de coerción registrada ',
              'Se registró correctamente la medida de coerción',
              'Aceptar'
            );
          }
        },
        error: error => {
         if (error.error?.code && error.error.code === '42201056') {
            this.modalDialogService.warning("Advertencia",error.error.message, 'Aceptar');
          } else {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar guardar las medidas de coerción`, 'Aceptar');
          }
        }
      })
    )

  }

  protected eliminarItem(data: MedidaCoercionSujeto) {

    const dialog = this.modalDialogService.question(
      'Quitar registro',
      '¿Realmente desea quitar este registro?',
      'Sí',
      'No'
    );

    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.subscriptions.push(
            this.requerimientoIncoacionService
              .eliminarMedidaCoercion(data.idActoTramiteCasoSujetoMedidaCoercitiva)
              .subscribe({
                next: (resp: GenericResponse) => {
                  if (resp.code === 200) {
                    this.modalDialogService.info('Éxito', 'Registro eliminado correctamente', 'Ok');
                    this.listarMedidasCoercionSujetos();
                  }
                },
                error: () => {
                  this.modalDialogService.error('ERROR', 'Error al intentar quitar el registro', 'Ok');
                }
              })
          );
        
        }
      }
    });
  }

  protected cerrarMensaje() {
    this.verMensaje = false;
  }
}
