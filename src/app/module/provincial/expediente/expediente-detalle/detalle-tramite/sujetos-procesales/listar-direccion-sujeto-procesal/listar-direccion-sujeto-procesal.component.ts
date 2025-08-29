import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DireccionSalida } from '@interfaces/provincial/administracion-casos/sujetos/DireccionSalida';
import { DireccionRequest } from '@interfaces/reusables/sujeto-procesal/direccionRequest';
import { MaestroService } from '@services/shared/maestro.service';
import { DireccionSujetoProcesalModalComponent } from '@components/modals/direccion-sujeto-procesal-modal/direccion-sujeto-procesal-modal.component';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { PaginatorComponent } from "@core/components/generales/paginator/paginator.component";
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { InputSwitchModule } from "primeng/inputswitch";

@Component({
  standalone: true,
  selector: 'app-listar-direccion-sujeto-procesal',
  templateUrl: './listar-direccion-sujeto-procesal.component.html',
  styleUrls: ['./listar-direccion-sujeto-procesal.component.scss'],
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CommonModule,
    CmpLibModule,
    PaginatorComponent,
    InputSwitchModule,
    FormsModule
],
  providers: [MessageService, DialogService, DatePipe, NgxCfngCoreModalDialogService],
})
export class ListarDireccionSujetoProcesalComponent
  implements OnInit, OnChanges {
  @Input() sujeto!: string;
  @Input() tipoRegistro!: string; // 0 cuando es registro manual --- 1 cuando es regisro por RENIEC

  @Input() tipoPersona!: string; // 1 persona Natural --- 2 persona juridica
  @Input() inputListaDirecciones!: DireccionRequest[];
  @Input() nacionalidad!: string;
  @Input() lstTipoVia: any;

  @Input({ required: true }) paginacionCondicion: any;
  @Input({ required: true }) paginacionConfiguracion: any;
  @Input({ required: true }) paginacionReiniciar: boolean = false;
  @Output() cambiarPagina = new EventEmitter<PaginacionInterface>();
  @Output() buscarPorTexto = new EventEmitter<string>();
  protected temporizadorBusqueda: any;

  @Output() onListaDirecciones: EventEmitter<any> = new EventEmitter<any>();
  public formDireccionSujetoProcesal!: FormGroup;

  public acciones = ['', 'pi pi-pencil', 'pi pi-trash'];
  public referenciaModal!: DynamicDialogRef;
  @Input() listaDirecciones: DireccionRequest[] = [];
  public subscriptions: Subscription[] = [];
  opcionEligida!: number;
  ref!: DynamicDialogRef;
  origenInicial: any = '';
  lecturaLista: boolean = false;
  public ocultarBuscador: boolean = false;

  lstDptos: any;
  lstProvincias: any;
  lstDistritos: any;
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  protected pagina!: number;

  constructor(
    private readonly dialogService: DialogService,
    private readonly maestrosService: MaestroService,
    protected readonly iconUtil: IconUtil,
    private formulario: FormBuilder,
  ) { }

  async ngOnInit() {
    this.formInicio();
    await this.obtenerDptos();
    this.pagina = this.paginacionCondicion.page;
  }

  private formInicio(): void {
    this.formDireccionSujetoProcesal = this.formulario.group({
      buscar: [''],
    });
  }

  protected eventoBuscarSegunTexto(): void {
    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => {
      const buscado = this.formDireccionSujetoProcesal.get('buscar')!.value;
      this.buscarPorTexto.emit(buscado);
    }, 200);
  }

  async ngOnChanges(changes: SimpleChanges) {
    /**this.listaDirecciones = this.inputListaDirecciones;**/
    if (changes['listaDirecciones'] && changes['listaDirecciones'].currentValue) {
      if (this.listaDirecciones.length > 0) this.ocultarBuscador = true;
    }
  }

  protected eventoCambiarPagina(paginacion: PaginacionInterface){
    this.pagina = paginacion.page;
    this.cambiarPagina.emit(paginacion);
  }
  
  obtenerDptos() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenerDepartamentos().subscribe({
          next: (resp) => {
            this.lstDptos = resp.data;
            resolve();
          },
        })
      );
    });
  }

  obtenerProvincias(dpto: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenerProvincias(dpto).subscribe({
          next: (resp) => {
            this.lstProvincias = resp.data;
            resolve();
          },
        })
      );
    });
  }

  obtenertipoVia() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenertipovia().subscribe({
          next: (resp) => {
            console.log(resp.data);
            this.lstTipoVia = resp.data;
            resolve();
          },
        })
      );
    });
  }

  eliminarDireccion(index: number) {
   const dialog = this.modalDialogService.question(
        `Eliminar dirección`,
        /**`¿Está seguro de eliminar esta dirección para este sujeto procesal?`, */
        `¿Está seguro de eliminar esta dirección para este sujeto procesal, esta acción no puede ser revertida?`,
        'Aceptar',
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.listaDirecciones.splice(index, 1);
            this.formDireccionSujetoProcesal.get('buscar')?.setValue(null);
            this.onListaDirecciones.emit(this.listaDirecciones);
            this.modalDialogService.success("Exito",'Se eliminó correctamente la dirección', 'Aceptar');
            if (this.listaDirecciones.length === 0) this.ocultarBuscador = false;
          }
        },
      });
  }

  setTipoDireccion(tipoVia: any) {
    const via = this.lstTipoVia?.find((item: any) => +item.id === +tipoVia);

    return via?.nombre;
  }

  verModalDireccion(
    accion: string,
    data: DireccionRequest | null,
    index: number
  ) {
    this.ref = this.referenciaModal = this.dialogService.open(
      DireccionSujetoProcesalModalComponent,
      {
        showHeader: false,
        data: {
          tipoAccion: accion,
          tipoPersona: this.tipoPersona,
          nacionalidad: this.nacionalidad,
          direccion: data,
          sujeto: this.sujeto,
          item: this.listaDirecciones.length,
          direcciones: this.listaDirecciones,
          tipoRegistro: this.tipoRegistro,
        },
        contentStyle: { padding: '0', 'border-radius': '15px' }
      }
    );
    this.ref.onClose.subscribe((respuesta: DireccionSalida) => {
      if(respuesta){
        if (respuesta.tipoDireccionNombre === 'REAL') {
          this.listaDirecciones = this.listaDirecciones.map((itemDireccion: any) => ({
            ...itemDireccion,
            habilitado: itemDireccion.tipoDireccionNombre === 'REAL' ? false : itemDireccion.habilitado
          }));
        }
  
        if (respuesta.tipoDireccionNombre === 'PROCESAL') {
          this.listaDirecciones = this.listaDirecciones.map((itemDireccion: any) => ({
            ...itemDireccion,
            habilitado: itemDireccion.tipoDireccionNombre === 'PROCESAL' ? false : itemDireccion.habilitado
          }));
        }
  
        if (typeof respuesta === 'undefined') {
          return;
        }
  
        this.formDireccionSujetoProcesal.get('buscar')?.setValue(null);
        if (accion === 'R') {
          // R: REGISTRAR
          this.listaDirecciones.unshift({
            idDireccion: respuesta.idDireccion,
            tipoDireccion: respuesta.tipoDireccion,
            tipoDireccionNombre: respuesta.tipoDireccionNombre,
            dpto: respuesta.dpto,
            dptoNombre: respuesta.dptoNombre,
            provincia: respuesta.provincia,
            provinciaNombre: respuesta.provinciaNombre,
            distrito: respuesta.distrito,
            distritoNombre: respuesta.distritoNombre,
            cpoblado: respuesta.cpoblado,
            tipoVia: Number(respuesta.tipoVia),
            nombre: respuesta.nombre,
            nroDireccion: respuesta.nroDireccion,
            prefijoUrb: respuesta.prefijoUrb,
            nombreUrb: respuesta.nombreUrb,
            block: respuesta.block,
            interior: respuesta.interior,
            etapa: respuesta.etapa,
            mz: respuesta.mz,
            lote: respuesta.lote,
            referencia: respuesta.referencia,
            sujeto: respuesta.sujeto,
            lat: respuesta.lat,
            lon: respuesta.lon,
            registradoPor: respuesta.registradoPor,
            fechaRegistro: respuesta.fechaRegistro,
            actualizadoPor: respuesta.actualizadoPor,
            fechaActualizacion: respuesta.fechaActualizacion,
            pais: respuesta.pais.toString(),
            habilitado: true,
            paisNombre: respuesta.paisNombre,
          });
          this.onListaDirecciones.emit(this.listaDirecciones);
        } else if (accion === 'E') {
            this.listaDirecciones[index] = {
              idDireccion: respuesta.idDireccion,
              tipoDireccion: respuesta.tipoDireccion,
              tipoDireccionNombre: respuesta.tipoDireccionNombre,
              dpto: respuesta.dpto,
              dptoNombre: respuesta.dptoNombre,
              provincia: respuesta.provincia,
              provinciaNombre: respuesta.provinciaNombre,
              distrito: respuesta.distrito,
              distritoNombre: respuesta.distritoNombre,
              cpoblado: respuesta.cpoblado,
              tipoVia: Number(respuesta.tipoVia),
              nombre: respuesta.nombre,
              nroDireccion: respuesta.nroDireccion,
              prefijoUrb: respuesta.prefijoUrb,
              nombreUrb: respuesta.nombreUrb,
              block: respuesta.block,
              interior: respuesta.interior,
              etapa: respuesta.etapa,
              mz: respuesta.mz,
              lote: respuesta.lote,
              referencia: respuesta.referencia,
              sujeto: respuesta.sujeto,
              lat: respuesta.lat,
              lon: respuesta.lon,
              registradoPor: respuesta.registradoPor,
              fechaRegistro: respuesta.fechaRegistro,
              actualizadoPor: respuesta.actualizadoPor,
              fechaActualizacion: respuesta.fechaActualizacion,
              pais: respuesta.pais.toString(),
              habilitado: true,
              paisNombre: respuesta.paisNombre,
            };
            this.onListaDirecciones.emit(this.listaDirecciones);
          }
      }
    });
  }

  habilitar(direccion: any) {
    if (direccion.habilitado === false) {
      const dialog = this.modalDialogService.question(
        `Desactivar dirección`,
        `¿Está seguro de desactivar esta dirección para este sujeto procesal? Esta acción no puede ser revertida.`,
        'Aceptar',
        'Cancelar'
      );

      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.listaDirecciones = this.listaDirecciones.map(dir =>
              dir.idDireccion === direccion.idDireccion
                ? { ...dir, habilitado: false }
                : dir
            );
            this.onListaDirecciones.emit(this.listaDirecciones);
            this.modalDialogService.success(
              "Éxito",
              'Se desactivó correctamente la dirección',
              'Aceptar'
            );
          } else {
            direccion.habilitado = true;
          }
        }
      });

    } else {
      this.listaDirecciones = this.listaDirecciones.map(dir =>
        dir.idDireccion === direccion.idDireccion
          ? { ...dir, habilitado: true }
          : dir
      );
      this.onListaDirecciones.emit(this.listaDirecciones);
    }
  }

}
