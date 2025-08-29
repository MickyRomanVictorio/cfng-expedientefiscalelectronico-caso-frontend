import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertaData } from '@interfaces/comunes/alert';
import { Direccion } from '@interfaces/provincial/administracion-casos/sujetos/Direccion';
import { direccionService } from '@services/generales/sujeto/direccion.service';
import { MaestroService } from '@services/shared/maestro.service';
import { GeoService } from '@shared/geo.service';
import { formatoCampoPipe } from '@pipes/formato-campo.pipe';
import { LatLng, Map, Marker, latLng, tileLayer } from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';

@Component({
  standalone: true,
  selector: 'app-reason-modal',
  templateUrl: './direccion-modal.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    EncabezadoModalComponent,
    CheckboxModule,
    formatoCampoPipe,
  ],
})
export class DireccionModalComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public razon = new FormControl('', [Validators.required]);

  public tipoEjecucion;
  public dataDirecciones;
  public idSujeto;

  public subscriptions: Subscription[] = [];
  public currentMarker!: Marker;
  private map!: Map;
  public coordsRegistered: boolean = false;

  constructor(
    public referenciaModal: DynamicDialogRef,
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private maestrosService: MaestroService,
    private dialogService: DialogService,
    private direService: direccionService,
    private fb: FormBuilder,
    private geoService: GeoService
  ) {
    this.tipoEjecucion = this.config.data.tipoEjecucion;
    this.dataDirecciones = this.config.data.data;
    this.idSujeto = this.config.data.sujeto;
  }

  ngAfterViewInit(): void {
    this.map = new Map('map').setView(
      [-12.05145781025591, -77.0280674167715],
      17
    );
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on('click', (event) => {
      const latLng: LatLng = event.latlng;
      this.addMarkerToMap(latLng);
    });
  }

  public place: string[] = ['Perú'];
  public loadingData: boolean = false;

  lstTipoVia: any;
  lstTipoDomicilio: any;
  lstDptos: any;
  lstProvincias: any = [];
  lstDistritos: any = [];
  lstPrefijos: any = [];
  direccion: Direccion = {} as Direccion;
  prefijoDefault: String = '';

  codDptoSeleccionado: String = '';
  codProvSeleccionado: String = '';
  public etiqueta = ['VER', 'EDITAR', '', 'AGREGAR'];
  nombreOpcion: String = '';
  lectura: any;
  direccionMapa: String = '';
  usarMapas: boolean = true;
  form!: FormGroup;

  async ngOnInit() {
    //
    this.form = this.fb.group({
      tipoDomicilio: [null],
      dpto: [null],
      provincia: [null],
      distrito: [null],
      tipovia: [null],
      tipoPrefijo: [null],
      nombreCalle: '',
      referencia: '',
      lote: '',
      manzana: '',
      etapa: '',
      interior: '',
      block: '',
      nombreUrb: '',
      nroDireccion: 0,
      idDireccion: '',
      latitude: new FormControl(null, []),
      longitude: new FormControl(null, []),
      direccionMapa: '',
      esMapa: new FormControl(null, []),
    });
    //
    await this.obtenerPrefijo();
    await this.obtenertipoVia();

    await this.obtenerDptos();
    await this.obtenerTiposDomicilio();

    this.nombreOpcion = this.etiqueta[this.tipoEjecucion];
    this.lectura = this.tipoEjecucion == 0 ? true : false;

    //si es ver o editar llenar interfaz con los valores de la variable Data
    if (this.tipoEjecucion == 0 || this.tipoEjecucion == 1) {
      this.direccion.dpto = this.dataDirecciones.departamento;
      this.direccion.provincia = this.dataDirecciones.provincia;
      this.direccion.distrito = this.dataDirecciones.distrito;
      this.direccion.tipoDireccion = this.dataDirecciones.tipoDireccion;
      this.direccion.tipovia = this.retornarNombreCombo(
        this.lstTipoVia,
        this.dataDirecciones.tipoVia
      );
    }

    let dpto = '';
    let prov = '';
    let dist = '';

    if (typeof this.dataDirecciones.ubigeo !== 'undefined') {
      if (this.dataDirecciones.ubigeo.length == 6) {
        dpto = this.dataDirecciones.ubigeo.substr(0, 2);
        prov = this.dataDirecciones.ubigeo.substr(2, 2);
        dist = this.dataDirecciones.ubigeo.substr(4, 2);
        this.actualizarProvincias(prov);
        await this.actualizarDistritosService(dpto, prov);
        let objDistrito = this.lstDistritos.find((x: any) => x.codigo === dist);
        this.flyToPlace(objDistrito.nombre);
      }
    }

    let tipoDire = this.dataDirecciones.codTipoDireccion;

    this.form.patchValue({
      tipoDomicilio: Number(tipoDire),
      tipoPrefijo: this.dataDirecciones.prefijo,
      dpto: dpto,
      provincia: prov,
      distrito: dist,
      tipovia: Number(this.dataDirecciones.tipoVia),
      nombreCalle: this.dataDirecciones.direccionNombre,
      referencia: this.dataDirecciones.referencia,
      lote: this.dataDirecciones.lt,
      manzana: this.dataDirecciones.mz,
      etapa: this.dataDirecciones.etapa,
      interior: this.dataDirecciones.interior,
      block: this.dataDirecciones.block,
      nombreUrb: this.dataDirecciones.urbanizacion,
      nroDireccion: this.dataDirecciones.numero,
      idDireccion: this.dataDirecciones.idDireccion,
      direccionMapa: this.direccionMapa.toString(),
    });

    if (
      (this.dataDirecciones.lat == '0' ||
        typeof this.dataDirecciones.lat == 'undefined') &&
      (this.dataDirecciones.lon == '0' ||
        typeof this.dataDirecciones.lon == 'undefined')
    ) {
      this.usarMapas = false;
      return;
    }

    var coordenas = latLng([
      Number(this.dataDirecciones.lat),
      Number(this.dataDirecciones.lon),
    ]);
    this.addMarkerToMap(coordenas);
  }

  ngOnChanges(changes: SimpleChanges) {}

  checkValue() {
    let estado = this.form.get('esMapa')!.value;
    if (typeof estado[0] == 'undefined') {
      this.usarMapas = false;
      return;
    }

    if (estado[0] == '1') {
      this.usarMapas = true;
    }
  }

  private flyToPlace(place: string, newFly: boolean = false): void {
    if (!this.loadingData) {
      this.geoService
        .searchPlace(place + ', ' + this.place[0])
        .subscribe((res: any) => {
          const { lat, lon } = res[0];
          if (newFly) {
            this.map.flyTo(
              [
                this.form.get('latitude')!.value,
                this.form.get('longitude')!.value,
              ],
              17
            );
            this.coordsRegistered = false;
            return;
          }
          this.map.flyTo([lat, lon], 17);
        });
    }
  }

  public getDireccion(latLng: LatLng): void {
    this.geoService.buscarDireccion(latLng.lat, latLng.lng).subscribe({
      next: (response) => {
        const resp: any = response;
        let numero = resp.address.house_number ?? '';
        this.form.controls['direccionMapa'].setValue(
          resp.address.road + ' ' + numero
        );
        this.direccionMapa = resp.address.road + ' ' + numero;
      },
    });
  }

  public addMarkerToMap(latLng: LatLng, address: string = '') {
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }
    this.currentMarker = new Marker(latLng).addTo(this.map);
    this.form.controls['latitude'].setValue(latLng.lat);
    this.form.controls['longitude'].setValue(latLng.lng);
    address !== ''
      ? this.form.controls['direccionMapa'].setValue(address)
      : this.getDireccion(latLng);
    this.getDireccion(latLng);
  }

  retornarNombreCombo(lista: any, itemBuscar: any) {
    if (itemBuscar == 0) return '';
    let rsta = '';
    lista.forEach((x: any) => {
      if (x.id == itemBuscar) {
        rsta = x.nombre;
      }
    });
    return rsta;
  }

  getLabelById(value: any, list: any[]): string {
    const selectedItem = list.find((item) => item.value === value);
    return selectedItem ? selectedItem.label : '';
  }

  getCodigoById(value: any, list: any[]): string {
    const selectedItem = list.find((item) => item.codigo === value);
    return selectedItem ? selectedItem.nombre : '';
  }

  getByIdNombre(value: any, list: any[]): string {
    const selectedItem = list.find((item) => item.id === value);
    return selectedItem ? selectedItem.nombre : '';
  }

  public registrarDireccion() {
    if (isNaN(this.form.get('tipovia')!.value)) {
      this.mensajeError('Aviso:', 'Tipo de via es requerido');
      return;
    }

    if (isNaN(this.form.get('tipoDomicilio')!.value)) {
      this.mensajeError('Aviso:', 'Tipo de documento');
      return;
    }

    if (this.form.get('distrito')!.value == null) {
      this.mensajeError('Aviso:', 'El ubigeo es requerido');
      return;
    }
    let requestDireccion = {
      idDireccion: this.form.get('idDireccion')!.value,
      tipoDireccion: [
        this.getByIdNombre(
          this.form.get('tipoDomicilio')!.value,
          this.lstTipoDomicilio
        ),
        this.form.get('tipoDomicilio')!.value,
      ],

      dpto: [
        this.getLabelById(this.form.get('dpto')!.value, this.lstDptos),
        this.form.get('dpto')!.value,
      ],

      provincia: [
        this.getLabelById(
          this.form.get('provincia')!.value,
          this.lstProvincias
        ),
        this.form.get('provincia')!.value,
      ],

      distrito: [
        this.getCodigoById(this.form.get('distrito')!.value, this.lstDistritos),
        this.form.get('distrito')!.value,
      ],
      cpoblado: '',
      tipoVia: [
        this.getByIdNombre(this.form.get('tipovia')!.value, this.lstTipoVia),
        this.form.get('tipovia')!.value,
      ],
      nombre: this.form.get('nombreCalle')!.value,
      numero: this.form.get('nroDireccion')!.value,
      prefijoUrb: [
        this.getLabelById(
          this.form.get('tipoPrefijo')!.value,
          this.lstPrefijos
        ),
        this.form.get('tipoPrefijo')!.value,
      ],
      nombreUrb: this.form.get('nombreUrb')!.value,
      block: this.form.get('block')!.value,
      interior: this.form.get('interior')!.value,
      etapa: this.form.get('etapa')!.value,
      mz: this.form.get('manzana')!.value,
      lote: this.form.get('lote')!.value,
      referencia: this.form.get('referencia')!.value,
    };

    if (requestDireccion.idDireccion) {
      //
    } else {
      requestDireccion.idDireccion = '';
    }
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `Confirmar ${this.nombreOpcion.toLowerCase()} dirección`,
        description: ``,
        confirmButtonText: 'Confirmar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.subscriptions.push(
            this.direService
              .registrarDireccion(requestDireccion, this.nombreOpcion)
              .subscribe({
                next: (resp) => {
                  if (resp.code == 200) {
                    let rsta = {
                      opcion: 'actualizar_lista',
                      data: resp,
                    };
                    this.dialogRef.close(JSON.stringify(rsta));
                  } else {
                    this.mensajeError(
                      'Error al intentar registrar la dirección',
                      resp.message
                    );
                  }
                },
              })
          );
        }
      },
    });
  }

  mensajeError(mensaje: any, submensaje: any) {
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

  actulizarDistritos(event: any) {
    this.codProvSeleccionado = event.value;

    if (
      this.codDptoSeleccionado.length == 0 ||
      this.codProvSeleccionado == null
    ) {
      return;
    }
    this.actualizarDistritosService(
      this.codDptoSeleccionado,
      this.codProvSeleccionado
    );
  }

  verMapa() {
    let objDistrito = this.lstDistritos.find(
      (x: any) => x.codigo === this.form.get('distrito')!.value
    );
    this.flyToPlace(objDistrito.nombre);
  }

  actualizarDistritosService(dpto: any, prov: any) {
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

  actualizarProvincias(event: any) {
    this.codDptoSeleccionado = event;
    if (this.codDptoSeleccionado == null) {
      return;
    }
    this.subscriptions.push(
      this.maestrosService
        .obtenerProvincias(this.codDptoSeleccionado)
        .subscribe({
          next: (resp) => {
            // this.lstProvincias = resp.data.map(item => ({value:item.codigo, label: item.nombre}))
            this.lstProvincias = resp.data.map((item: any) => ({
              value: item.codigo,
              label: item.nombre,
            }));
          },
        })
    );
  }

  obtenertipoVia() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenertipovia().subscribe({
          next: (resp) => {
            this.lstTipoVia = resp.data;
            resolve();
          },
        })
      );
    });
  }

  obtenerPrefijo() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenerPrefijo().subscribe({
          next: (resp) => {
            this.lstPrefijos = resp.data.map((item: any) => ({
              value: item.id,
              label: item.noDescripcion,
            }));
            resolve();
          },
        })
      );
    });
  }

  private obtenerDptos(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerDepartamentos().subscribe({
        next: (resp) => {
          this.lstDptos = resp.data.map((item: any) => ({
            value: item.codigo,
            label: item.nombre,
          }));
        },
      })
    );
  }

  obtenerTiposDomicilio() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenerTipoDomicilio().subscribe({
          next: (resp) => {
            this.lstTipoDomicilio = resp.data;
            resolve();
          },
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get isValidForm(): boolean {
    return this.razon!.value!.trim().length > 0;
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  close() {
    this.dialogRef.close();
  }
}
