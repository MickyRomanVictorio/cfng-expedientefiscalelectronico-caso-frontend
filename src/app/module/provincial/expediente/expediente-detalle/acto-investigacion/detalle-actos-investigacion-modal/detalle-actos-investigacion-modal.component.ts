import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { DerivacionInternaComponent } from '../../../../tramites/comun/calificacion/derivacion-interna/derivacion-interna.component';
import {
  ElementoConviccion,
  SolicitudActoInvestigacion,
} from '../lista-actos-investigacion/interfaces/elemento-conviccion-interface';
import { SujetoProcesal } from '../lista-actos-investigacion/interfaces/sujetos-procesales-interface';
import { ActosInvestigacionService } from '../lista-actos-investigacion/services/actos-investigacion.service';
import { AlertaModalComponent } from '@core/components/modals/alerta-modal/alerta-modal.component';
import { TipoAccionEnum } from '../utils/tipo-accion-enum';
import { RespuestasActoProcesal } from '../lista-actos-investigacion/interfaces/acto-procesal-respuestas-interface';
import { Expediente } from '@core/utils/expediente';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-detalle-actos-investigacion-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    MultiSelectModule,
    ButtonModule,
    CmpLibModule,
    TableModule,
    DerivacionInternaComponent,
    JsonPipe,
  ],
  templateUrl: './detalle-actos-investigacion-modal.component.html',
  styleUrl: './detalle-actos-investigacion-modal.component.scss',
})
export class DetalleActosInvestigacionModalComponent implements OnInit {
  public caso: Expediente;
  public item: RespuestasActoProcesal;
  public tipoAccionActual: TipoAccionEnum;

  protected id: string;
  protected idCaso: string;
  protected numeroCaso: string;
  protected idDocumento: string;
  protected respuesta: string;
  protected tipoAccionEnum = TipoAccionEnum;
  protected listaCatalogoClasificacion: any[] = [];
  protected solicitudActoInvestigacion!: SolicitudActoInvestigacion;
  protected listaElementosDeConviccion: ElementoConviccion[] = [];
  protected listaSujetosProcesales: SujetoProcesal[] = [];
  protected actoInvestigacionForm: FormGroup;
  private objConviccion: any = {};
  protected obtenerIcono = obtenerIcono;
  protected titulo: string;
  protected verMasSujetosProcesales: boolean = true;
  protected superaLimiteCaracteres: boolean = false;

  constructor(
    protected referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private actosInvestigacionService: ActosInvestigacionService
  ) {
    this.caso = this.configuracion.data?.caso;
    this.item = this.configuracion.data?.item;

    this.id = this.item.idRespuesta;
    this.idCaso = this.caso.idCaso;
    this.numeroCaso = this.caso.numeroCaso;
    this.idDocumento = this.item.idDocumento;
    this.respuesta = this.item.respuesta;
    this.tipoAccionActual = this.configuracion.data?.tipoAccionActual;

    this.actoInvestigacionForm = this.fb.group({
      clasificacion: [null, Validators.required], // Add the dropdown control
      items: this.fb.array([]), // Initialize the FormArray
    });

    this.titulo =
      this.tipoAccionActual === TipoAccionEnum.VISUALIZAR
        ? 'Respuesta del acto de investigación'
        : 'Detalle del documento de respuesta';
  }

  ngOnInit(): void {
    this.obtenerActosDeInvestigacion();
    this.obtenerSujetosProcesales();
    this.obtenerElementosDeConviccion();
  }

  protected eventoCambiarClasificacion($event: any) {
    // console.log($event);
  }

  private obtenerActosDeInvestigacion() {
    this.actosInvestigacionService.obtenerActosDeInvestigacion().subscribe({
      next: (resp) => {
        this.listaCatalogoClasificacion = resp.data;
      },
      error: (err) => {},
    });
  }

  private obtenerSujetosProcesales() {
    this.actosInvestigacionService
      .obtenerSujetosProcesales(this.idCaso)
      .subscribe({
        next: (resp) => {
          // console.log(
          //   'resp - obtenerSujetosProcesales: ',
          //   JSON.stringify(resp)
          // );

          this.listaSujetosProcesales = resp;
        },
        error: (err) => {},
      });
  }

  private obtenerElementosDeConviccion() {
    this.actosInvestigacionService
      .obtenerElementosDeConviccion(this.id)
      .subscribe({
        next: (resp) => {
          // console.log(
          //   'this.listaElementosDeConviccion: ',
          //   JSON.stringify(resp)
          // );
          this.solicitudActoInvestigacion = resp;
          // this.listaElementosDeConviccion = resp.elementos;
          this.listaElementosDeConviccion = resp.elementos.map((data: any) => ({
            ...data,
            isCollapsed: true,
          }));

          console.log(
            'this.listaElementosDeConviccion: ',
            JSON.stringify(this.listaElementosDeConviccion)
          );

          this.inicializarItems();
        },
        error: (err) => {},
      });
  }

  protected get items(): FormArray {
    return this.actoInvestigacionForm.get('items') as FormArray;
  }

  private inicializarItems() {
    this.actoInvestigacionForm.patchValue({
      clasificacion: this.solicitudActoInvestigacion.idClasificacion,
    });

    this.solicitudActoInvestigacion.elementos.forEach((data) =>
      this.agregarItem(data)
    );
    // this.listaElementosDeConviccion.forEach((data) => this.agregarItem(data));
  }

  private agregarItem(data?: any) {
    let sujetos: any = [];

    if (data && data.sujetos) {
      sujetos = this.listaSujetosProcesales.find(
        (e) => e.codigo === data.sujetos[0].codigo
      )
        ? [
            this.listaSujetosProcesales.find(
              (e) => e.codigo === data.sujetos[0].codigo
            ) as SujetoProcesal,
          ]
        : [];
    }

    let clasificacion = this.actoInvestigacionForm.get('clasificacion')?.value;

    const itemGroup = this.fb.group({
      id: [data?.id || ''],
      descripcion: [data?.descripcion || '', Validators.required],
      sujetos: [sujetos, Validators.required],
      // tipo: [data?.tipo || clasificacion],
      fechaRegistro: [data?.fechaRegistro || ''],
      estado: [data?.estado || 1],
    });

    this.items.push(itemGroup);
  }

  /**
   * Elimina un item del arreglo de items según su índice.
   * Si el item tiene un id, establece el estado en 0, de lo contrario elimina el item del arreglo.
   *
   * @param {number} index - El índice del item a eliminar.
   * @return {void}
   */
  protected eliminarItem(index: number) {
    // console.log('id: ', this.items.at(index).get('id')?.value);
    const idData = this.items.at(index).get('id')?.value;
    if (idData) {
      this.items.at(index).get('estado')?.setValue(0);
    } else {
      this.items.removeAt(index);
    }
  }

  protected eventoAgregarElemento() {
    this.agregarItem();
  }

  protected eventoEliminarElemento(index: number) {
    this.eliminarItem(index);
  }

  protected cancelar() {
    this.referenciaModal.close();
  }

  protected guardarElemento() {
    const elementosConviccion = this.actoInvestigacionForm.value.items;

    // console.log('elementosConviccion: ', JSON.stringify(elementosConviccion));

    this.objConviccion = {
      id: this.id,
      tipo: this.actoInvestigacionForm.value.clasificacion,
      idDocumento: this.idDocumento,
      elementosConviccion: elementosConviccion,
    };

    // limpiar sujetos antes de enviar
    const obj = this.limpiarSujetos();
    // Transforming the array
    // const obj = this.objConviccion.map((item: any) => ({
    //   id: item.id,
    //   descripcion: item.descripcion,
    //   sujetos: item.sujetos.map((sujeto: any) => sujeto.codigo), // Get only 'codigo' field
    //   estado: item.estado,
    // }));

    // console.log('this.objConvicciones: ', JSON.stringify(obj));

    const ref = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `¿Confirma grabar los elementos de convicción?`,
        description: ``,
        confirmButtonText: 'Confirmar',
        confirm: true,
      },
    });
    ref.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          // data.estado = 'SOLUCIONADO';
          // this.actualizarAlertas(data);
          // llamar al servicio
          this.actosInvestigacionService
            .agregarElementoDeConviccion(this.id, obj)
            .subscribe({
              next: (resp) => {
                // console.log(
                //   'resp - agregarElementoDeConviccion: ',
                //   JSON.stringify(resp)
                // );
                const refRespuesta = this.dialogService.open(
                  AlertaModalComponent,
                  {
                    width: '600px',
                    showHeader: false,
                    data: {
                      icon: 'success',
                      confirmButtonText: 'Ok',
                      title: `Documento de respuesta y elemento de convicción guardado correctamente`,
                      description: '',
                    },
                  }
                );

                refRespuesta.onClose.subscribe({
                  next: (resp) => {
                    if (resp === 'confirm') {
                      // console.log('cerrando....');
                      // this.selectedSujetos = [];
                      this.referenciaModal.close();
                    }
                  },
                });
              },
              error: (err) => {},
            });
        }
      },
    });
  }

  private limpiarSujetos() {
    return {
      ...this.objConviccion,
      elementosConviccion: this.objConviccion.elementosConviccion.map(
        (item: any) => ({
          ...item,
          sujetos: item.sujetos.map((sujeto: any) => sujeto.codigo),
        })
      ),
    };
  }

  protected superaLimiteDeCaracteres(sujetos: any[]): boolean {
    const data = this.getNombres(sujetos);
    return data.length > 20;
  }

  protected sujetosProcesales(item: ElementoConviccion): String {
    // return this.getNombres(sujetos);
    const data = this.getNombres(item.sujetos);
    // this.superaLimiteCaracteres = this.superaLimiteDeCaracteres(data);
    return data.length > 20 && item.isCollapsed
      ? `${data.substring(0, 20)}...`
      : data;
  }

  private getNombres(sujetos: any[]): string {
    return sujetos.map((sujeto: any) => sujeto.nombre).join(', ');
  }

  protected alternarVista(item: ElementoConviccion) {
    // this.verMasSujetosProcesales = !this.verMasSujetosProcesales;
    item.isCollapsed = !item.isCollapsed;
  }
}
