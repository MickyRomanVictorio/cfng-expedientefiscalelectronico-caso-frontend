import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertaData } from '@interfaces/comunes/alert';
import { direccionService } from '@services/generales/sujeto/direccion.service';
import { MaestroService } from '@services/shared/maestro.service';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { DireccionBDModalComponent } from '@components/modals/direccion-bd-modal/direccion-bd-modal.component';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'sujeto2-direccion',
  templateUrl: './sujeto-component.html',
  // styleUrls: ['./dni-component.scss'],
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CommonModule,
  ],
  providers: [MessageService, DialogService, DatePipe],
})
export class sujeto2DireccionComponent implements OnInit, OnChanges {
  @Input() sujeto!: string;
  @Input() tipoRegistro!: string; // 0 cuando es registro manual --- 1 cuando es regisro por RENIEC

  @Input() tipoPersona!: string; // 1 persona Natural --- 2 persona juridica
  @Input() inputListaDirecciones!: string;
  @Input() nacionalidad!: string;
  @Input() esMesa: boolean = false;
  @Output() onListaDirecciones: EventEmitter<string> =
    new EventEmitter<string>();
  //definicion de variables

  public acciones = ['', 'pi pi-pencil', 'pi pi-trash'];

  public referenciaModal!: DynamicDialogRef;
  listaDirecciones: any;
  public subscriptions: Subscription[] = [];
  opcionEligida!: Number;
  ref!: DynamicDialogRef;
  origenInicial: any = '';
  lecturaLista: boolean = false;

  constructor(
    private direService: direccionService,
    private dialogService: DialogService,
    private maestrosService: MaestroService
  ) {}
  async ngOnChanges(changes: SimpleChanges) {
    await this.obtenerDptos();

    if (this.inputListaDirecciones) {
      if (this.inputListaDirecciones.length > 0 && this.lecturaLista == false) {
        if (this.inputListaDirecciones == '0') {
          this.inputListaDirecciones = '';
          this.listaDirecciones = [];
          return;
        }
        try {
          this.listaDirecciones = JSON.parse(this.inputListaDirecciones);
          let direccion: any[] = [];
          this.listaDirecciones.forEach(async (xx: any) => {
            if (
              xx.dpto == '00' ||
              xx.provincia == '00' ||
              xx.distrito == '00'
            ) {
              xx['dptoNombre'] = '-';
              xx['provinciaNombre'] = '-';
              xx['distritoNombre'] = '-';
            } else {
              let dpto = this.lstDptos.find((x: any) => x.codigo === xx.dpto);
              await this.actualizarProvincias(dpto.codigo);
              let provincia = this.lstProvincias.find(
                (x: any) => x.codigo === xx.provincia
              );
              await this.actualizarDistritos(dpto.codigo, provincia.codigo);
              let distrito = this.lstDistritos.find(
                (x: any) => x.codigo === xx.distrito
              );
              xx['dptoNombre'] = dpto.nombre;
              xx['provinciaNombre'] = provincia.nombre;
              xx['distritoNombre'] = distrito.nombre;
            }
            direccion.push(xx);
          });
          this.listaDirecciones = direccion;
        } catch (error) {
          this.listaDirecciones = this.inputListaDirecciones;
          let direccion: any[] = [];
          this.listaDirecciones.forEach(async (xx: any) => {
            if (
              xx.dpto == '00' ||
              xx.provincia == '00' ||
              xx.distrito == '00'
            ) {
              xx['dptoNombre'] = '-';
              xx['provinciaNombre'] = '-';
              xx['distritoNombre'] = '-';
            } else {
              let dpto = this.lstDptos.find((x: any) => x.codigo === xx.dpto);
              await this.actualizarProvincias(dpto.codigo);
              let provincia = this.lstProvincias.find(
                (x: any) => x.codigo === xx.provincia
              );
              await this.actualizarDistritos(dpto.codigo, provincia.codigo);
              let distrito = this.lstDistritos.find(
                (x: any) => x.codigo === xx.distrito
              );
              xx['dptoNombre'] = dpto.nombre;
              xx['provinciaNombre'] = provincia.nombre;
              xx['distritoNombre'] = distrito.nombre;
            }
            direccion.push(xx);
          });
          this.listaDirecciones = direccion;
        }
      }
    }
  }

  async ngOnInit() {
    console.log('tpersona_init');
    console.log(this.tipoPersona);

    await this.obtenerDptos();

    if (this.sujeto == '0') {
      this.listaDirecciones = [];
      this.origenInicial = 'Form';
    } else {
      this.obtenerDirecciones('BD');
      this.origenInicial = 'BD';
    }

    await this.obtenerDptos();
    console.log('recupera lista direcciones -2');
    console.log(this.inputListaDirecciones);

    if (this.inputListaDirecciones) {
      if (this.inputListaDirecciones.length > 0 && this.lecturaLista == false) {
        if (this.inputListaDirecciones == '0') {
          this.inputListaDirecciones = '';
          this.listaDirecciones = [];
          return;
        }
        try {
          this.listaDirecciones = JSON.parse(this.inputListaDirecciones);
          this.listaDirecciones = this.listaDirecciones;
        } catch (error) {
          this.listaDirecciones = this.inputListaDirecciones;
          let direccion: any[] = [];
          console.log(this.listaDirecciones);

          this.listaDirecciones.forEach(async (xx: any) => {
            if (
              xx.dpto == '00' ||
              xx.provincia == '00' ||
              xx.distrito == '00'
            ) {
              xx['dptoNombre'] = '-';
              xx['provinciaNombre'] = '-';
              xx['distritoNombre'] = '-';
            } else {
              let dpto = this.lstDptos.find((x: any) => x.codigo === xx.dpto);
              await this.actualizarProvincias(dpto.codigo);
              let provincia = this.lstProvincias.find(
                (x: any) => x.codigo === xx.provincia
              );
              await this.actualizarDistritos(dpto.codigo, provincia.codigo);
              let distrito = this.lstDistritos.find(
                (x: any) => x.codigo === xx.distrito
              );
              xx['dptoNombre'] = dpto.nombre;
              xx['provinciaNombre'] = provincia.nombre;
              xx['distritoNombre'] = distrito.nombre;
            }
            direccion.push(xx);
          });
          this.listaDirecciones = direccion;
        }
      }
    }
  }

  lstDptos: any;
  lstProvincias: any;
  lstDistritos: any;

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

  actualizarProvincias(dpto: any) {
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

  actualizarDistritos(dpto: any, prov: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenerDistritos(dpto, prov).subscribe({
          next: (resp) => {
            this.lstDistritos = resp.data;
            resolve();
          },
        })
      );
    });
  }

  insertarCamposAdicionales() {
    return new Promise<void>((resolve, reject) => {
      if (this.tipoRegistro === '0') {
        this.listaDirecciones['descripcionPrefijoBlock'] = '';
        this.listaDirecciones['descripcionPrefijoInterior'] = '';
        this.listaDirecciones['direccionDomicilio'] = '';
      } else {
        resolve();
      }
    });
  }

  async obtenerDirecciones(info: any) {
    if (info.origen == 'BD' || info == 'BD') {
      this.subscriptions.push(
        this.direService.obtenerDirecciones(this.sujeto).subscribe({
          next: async (resp) => {
            this.listaDirecciones = resp.data;
            await this.insertarCamposAdicionales();

            this.onListaDirecciones.emit(this.listaDirecciones);
          },
        })
      );
    } else {
      let respuestaForm = info.data;
      respuestaForm['origen'] = 'Form';
      this.listaDirecciones.push(respuestaForm);
      await this.insertarCamposAdicionales();
      this.onListaDirecciones.emit(this.listaDirecciones);
    }
  }
  mensajeError(mensaje: string, submensaje: string) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  eliminarDireccion(datos: any, index: number) {
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `Confirmar eliminar la dirección Nro ${index + 1}`,
        description: ``,
        confirmButtonText: 'Confirmar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          if (datos.origen == 'Form') {
            this.eliminaItem(datos);
          } else {
            this.subscriptions.push(
              this.direService.borrarDireccion(datos.idDireccion).subscribe({
                next: (resp) => {
                  let data = resp;
                  this.obtenerDirecciones('BD');
                },
              })
            );
          }
        }
      },
    });
  }

  async eliminaItem(datos: any) {
    let listaTemp: any[] = [];
    this.listaDirecciones.forEach((x: any) => {
      if (x.item != datos.item) {
        listaTemp.push(x);
      }
    });
    this.listaDirecciones = listaTemp;
    this.insertarCamposAdicionales();
    await this.onListaDirecciones.emit(this.listaDirecciones);
  }

  mostrarAccion(i: number, datos: any, index: number) {
    if (datos == null) {
      this.popupDireccion(i, [], [], '');
      return;
    }
    if (this.origenInicial === 'BD') {
      this.subscriptions.push(
        this.direService.obtenerUnaDireccion(datos.idDireccion).subscribe({
          next: (resp) => {
            let data = resp.data;
            if (i == 0) {
              this.popupDireccion(i, data, [], this.origenInicial);
            } else if (i == 1) {
              this.popupDireccion(i, data, [], this.origenInicial);
            } else if (i == 2) {
              if (datos.tipoDireccionNombre == 'RENIEC') {
                this.mensajeError(
                  'Aviso:',
                  'No es posible eliminar un tipo domicilio RENIEC'
                );
                return;
              }
              this.eliminarDireccion(datos, index);
            }
          },
        })
      );
    } else {
      if (i == 0) {
        this.popupDireccion(i, [], datos, this.origenInicial);
      } else if (i == 1) {
        this.popupDireccion(i, [], datos, this.origenInicial);
      } else if (i == 2) {
        if (datos.tipoDireccionNombre == 'RENIEC') {
          this.mensajeError(
            'Aviso:',
            'No es posible eliminar un tipo domicilio RENIEC'
          );
          return;
        }
        this.eliminarDireccion(datos, index);
      }
    }
  }

  public popupDireccion(
    opcion: number,
    data: any,
    data2: any,
    origen: string
  ): void {
    this.ref = this.referenciaModal = this.dialogService.open(
      DireccionBDModalComponent,
      {
        showHeader: false,
        data: {
          tipoEjecucion: opcion,
          data: data,
          data2: data2,
          origen: origen,
          sujeto: this.sujeto,
          item: this.listaDirecciones.length,
          tipoRegistro: this.tipoRegistro,
          inputListaDirecciones: this.inputListaDirecciones,
          tipoPersona: this.tipoPersona,
          nacionalidad: this.nacionalidad,
        },
      }
    );

    this.ref.onClose.subscribe((respuesta) => {
      if (typeof respuesta === 'undefined') {
        return;
      }
      let rsta = JSON.parse(respuesta);

      if (rsta.opcion == 'actualizar_lista') {
        this.obtenerDirecciones(rsta);
      } else if (rsta.opcion == 'actualizar_lista2') {
        this.eliminaItem(data2);
        this.obtenerDirecciones(rsta);
      }
    });
  }
}
