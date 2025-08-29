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
import { DireccionSalida } from '@interfaces/provincial/administracion-casos/sujetos/DireccionSalida';
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
  selector: 'app-direcion-bd-modal',
  templateUrl: './direccion-bd-modal.component.html',
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
export class DireccionBDModalComponent
  implements OnInit, AfterViewInit, OnDestroy {
  public razon = new FormControl('', [Validators.required]);

  public tipoEjecucion;
  public dataDirecciones;
  public dataDirecciones2;
  public origen;
  public idSujeto;
  public tipoRegistro;
  public inputListaDirecciones;
  public tipoPersona;
  public nacionalidad;
  public item;

  public subscriptions: Subscription[] = [];
  public currentMarker!: Marker;
  private map!: Map;
  public coordsRegistered: boolean = false;
  public esreniec: boolean = false;
  protected form!: FormGroup;

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
    this.dataDirecciones2 = this.config.data.data2;
    this.origen = this.config.data.origen;
    this.idSujeto = this.config.data.sujeto;
    this.tipoRegistro = this.config.data.tipoRegistro;
    this.inputListaDirecciones = this.config.data.inputListaDirecciones;
    this.tipoPersona = this.config.data.tipoPersona;
    this.nacionalidad = this.config.data.nacionalidad;
    this.item = this.config.data.item;
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
  prefijoNombre: String = '';
  codDptoSeleccionado: String = '';
  codProvSeleccionado: String = '';
  public etiqueta = ['VER', 'EDITAR', '', 'AGREGAR'];
  nombreOpcion: String = '';
  lectura: any;
  direccionMapa: String = '';
  usarMapas: boolean = false;
  listaCentroPoblados: any = [];
  lstUbigeoPueblo: any;
  limpiar = 'true';

  async ngOnInit() {
    //
    this.form = this.fb.group({
      tipoDomicilio: [null],
      dpto: [null],
      provincia: [null],
      distrito: [null],
      tipovia: [null],
      tipoPrefijo: [null],
      cpoblado: [null],
      nombreCalle: '',
      referencia: '',
      lote: '',
      manzana: '',
      etapa: '',
      interior: '',
      block: '',
      nombreUrb: '',
      nroDireccion: '',
      idDireccion: '',
      latitude: new FormControl(null, []),
      longitude: new FormControl(null, []),
      direccionMapa: '',
      esMapa: new FormControl(null, []),
      pais: 0,
    });
    //
    await this.obtenerPrefijo();
    await this.obtenertipoVia();
    await this.obtenerPaises();
    await this.obtenerDptos();
    await this.obtenerTiposDomicilio();

    this.nombreOpcion = this.etiqueta[this.tipoEjecucion];
    this.lectura = this.tipoEjecucion == 0 ? true : false;
    let tipoDire =
      this.origen == 'Form'
        ? this.dataDirecciones2.tipoDireccion
        : this.dataDirecciones.codTipoDireccion;

    if (this.tipoEjecucion == 0 || this.tipoEjecucion == 1) {
      this.direccion.dpto =
        this.origen == 'Form'
          ? this.dataDirecciones2.dptoNombre
          : this.dataDirecciones.departamento;
      this.direccion.provincia =
        this.origen == 'Form'
          ? this.dataDirecciones2.provinciaNombre
          : this.dataDirecciones.provincia;
      this.direccion.distrito =
        this.origen == 'Form'
          ? this.dataDirecciones2.distritoNombre
          : this.dataDirecciones.distrito;
      this.direccion.tipoDireccion =
        this.origen == 'Form'
          ? this.dataDirecciones2.tipoDireccionNombre
          : this.dataDirecciones.tipoDireccion;
      let tipovia =
        this.origen == 'Form'
          ? this.dataDirecciones2.tipoVia
          : this.dataDirecciones.tipoVia;
      this.direccion.tipovia = this.retornarNombreCombo(
        this.lstTipoVia,
        tipovia
      );
      if (tipoDire == 5) {
        this.esreniec = true;
        this.limpiar = 'false';
      }
    }

    var dpto = '';
    var prov = '';
    var dist = '';

    if (this.origen == 'Form') {
      dpto = this.dataDirecciones2.dpto;
      prov = this.dataDirecciones2.provincia;
      dist = this.dataDirecciones2.distrito;

      this.actualizarProvincias(dpto);
      await this.actualizarDistritosService(dpto, prov);
      let objDistrito = this.lstDistritos.find((x: any) => x.codigo === dist);

      console.log('nombre distrito ==>' + objDistrito.nombre);

      this.flyToPlace(objDistrito.nombre);
    } else {
      if (typeof this.dataDirecciones.ubigeo !== 'undefined') {
        if (this.dataDirecciones.ubigeo.length == 6) {
          dpto = this.dataDirecciones.ubigeo.substr(0, 2);
          prov = this.dataDirecciones.ubigeo.substr(2, 2);
          dist = this.dataDirecciones.ubigeo.substr(4, 2);
          await this.actualizarProvincias(prov);
          await this.actualizarDistritosService(dpto, prov);
          let objDistrito = this.lstDistritos.find(
            (x: any) => x.codigo === dist
          );
          this.flyToPlace(objDistrito.nombre);
        }
      }
    }

    let idPrefijo =
      this.origen == 'Form'
        ? this.dataDirecciones2.prefijoUrb
        : this.dataDirecciones.prefijo;

    const objPrefijo = this.lstPrefijos.find(
      (item: any) => item.id === idPrefijo
    );
    if (typeof objPrefijo !== 'undefined') {
      this.prefijoNombre = objPrefijo.noDescripcion;
    }
    let ubigeo = dpto + prov + dist;
    await this.obtenerUbigeoPueblo(ubigeo);

    let cpoblado =
      this.origen == 'Form'
        ? this.dataDirecciones2.centroPoblado
        : this.dataDirecciones.centroPoblado;

    let objCentroPoblado = this.lstUbigeoPueblo.find(
      (item: any) => item.codigo === cpoblado
    );

    let centroPoblado = '0';
    if (typeof objCentroPoblado !== 'undefined') {
      centroPoblado = objCentroPoblado!.codigo;
    }

    let paisDefault = 0;
    if (this.nacionalidad == 0) {
      paisDefault = 102;
    }

    this.form.patchValue({
      tipoDomicilio: Number(tipoDire),
      tipoPrefijo: idPrefijo,
      dpto: dpto,
      provincia: prov,
      distrito: dist,
      tipovia:
        this.origen == 'Form'
          ? Number(this.dataDirecciones2.tipoVia)
          : Number(this.dataDirecciones.tipoVia),
      nombreCalle:
        this.origen == 'Form'
          ? this.dataDirecciones2.nombre
          : this.dataDirecciones.direccionNombre,
      referencia:
        this.origen == 'Form'
          ? this.dataDirecciones2.referencia
          : this.dataDirecciones.referencia,
      lote:
        this.origen == 'Form'
          ? this.dataDirecciones2.lote
          : this.dataDirecciones.lt,
      manzana:
        this.origen == 'Form'
          ? this.dataDirecciones2.mz
          : this.dataDirecciones.mz,
      etapa:
        this.origen == 'Form'
          ? this.dataDirecciones2.etapa
          : this.dataDirecciones.etapa,
      interior:
        this.origen == 'Form'
          ? this.dataDirecciones2.interior
          : this.dataDirecciones.interior,
      block:
        this.origen == 'Form'
          ? this.dataDirecciones2.block
          : this.dataDirecciones.block,
      nombreUrb:
        this.origen == 'Form'
          ? this.dataDirecciones2.nombreUrb
          : this.dataDirecciones.urbanizacion,
      nroDireccion:
        this.origen == 'Form'
          ? this.dataDirecciones2.nroDireccion
          : this.dataDirecciones.numero,
      idDireccion:
        this.origen == 'Form'
          ? this.dataDirecciones2.idDireccion
          : this.dataDirecciones.idDireccion,
      direccionMapa: this.direccionMapa.toString(),
      cpoblado: cpoblado,
      pais: paisDefault,
    });
    if (this.origen == 'Form') {
      if (
        (this.dataDirecciones2.lat == '0' ||
          typeof this.dataDirecciones2.lat == 'undefined') &&
        (this.dataDirecciones2.lon == '0' ||
          typeof this.dataDirecciones2.lon == 'undefined')
      ) {
        this.usarMapas = false;
        return;
      }
    } else {
      if (
        (this.dataDirecciones.lat == '0' ||
          typeof this.dataDirecciones.lat == 'undefined') &&
        (this.dataDirecciones.lon == '0' ||
          typeof this.dataDirecciones.lon == 'undefined')
      ) {
        this.usarMapas = false;
        return;
      }
    }

    if (this.origen == 'Form') {
      if (this.dataDirecciones2.lat.trim().length == 0) {
      } else {
        var coordenas = latLng([
          Number(this.dataDirecciones2.lat),
          Number(this.dataDirecciones2.lon),
        ]);
        this.addMarkerToMap(coordenas);
      }
    } else {
      var coordenas = latLng([
        Number(this.dataDirecciones.lat),
        Number(this.dataDirecciones.lon),
      ]);
      this.addMarkerToMap(coordenas);
    }
  }

  ngOnChanges(changes: SimpleChanges) { }

  estadoBotonGuardar: boolean = false;
  documentoSeleccionado: any = '';

  validartipoDocumento(event: any) {
    this.documentoSeleccionado = event;
    if (this.documentoSeleccionado == 5 && this.tipoRegistro == 0) {
      this.estadoBotonGuardar = true;
      this.mensajeError(
        'Aviso:',
        'Se encuentra en registro manual y no es posible seleccinar el tipo de dirección RENIEC'
      );
    } else {
      this.estadoBotonGuardar = false;
    }

    if (
      typeof this.inputListaDirecciones === 'undefined' ||
      this.inputListaDirecciones == null
    ) {
      this.estadoBotonGuardar = false;
      return;
    }
  }

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

  lstPaises: any = [];
  private obtenerPaises(): void {
    this.subscriptions.push(
      this.maestrosService.listarNacionalidad().subscribe({
        next: (resp) => {
          this.lstPaises = resp;
        },
      })
    );
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

  uuidv4() {
    var d = new Date().getTime(); //Timestamp
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
          //Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          //Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
  }

  public registrarDireccion() {
    let dpto = this.form.get('dpto')!.value;
    let prov = this.form.get('provincia')!.value;
    let dist = this.form.get('distrito')!.value;
    let cpoblado = this.form.get('cpoblado')!.value;

    if (isNaN(this.form.get('tipovia')!.value)) {
      this.mensajeError('Aviso:', 'Tipo de via es requerido');
      return;
    }

    if (isNaN(this.form.get('tipoDomicilio')!.value)) {
      this.mensajeError('Aviso:', 'Seleccione tipo de dirección');
      return;
    }

    if (this.nacionalidad == null) {
      this.mensajeError('Aviso:', 'Debe indicarse la nacionaldiad');
      return;
    }

    if (this.form.get('distrito')!.value == null && this.nacionalidad == 0) {
      this.mensajeError('Aviso:', 'El ubigeo es requerido');
      return;
    }

    if (this.form.get('distrito')!.value == '' && this.nacionalidad == 0) {
      this.mensajeError('Aviso:', 'El ubigeo es requerido');
      return;
    }

    if (this.nacionalidad == 1) {
      dpto = dpto || '00';
      prov = prov || '00';
      dist = dist || '00';
      cpoblado = cpoblado || '0';
    }

    if (this.form.get('nombreCalle')!.value == null) {
      this.mensajeError('Aviso:', 'El nombre de la calle es requerido');
      return;
    }
    if (this.form.get('nombreCalle')!.value.length == 0) {
      this.mensajeError('Aviso:', 'El nombre de la calle es requerido');
      return;
    }
    if (this.form.get('nroDireccion')!.value == null) {
      this.mensajeError('Aviso:', 'El nro de la calle es requerido');
      return;
    }

    const objDpto = this.lstDptos.find(
      (item: any) => item.codigo === this.form.get('dpto')!.value
    );
    let nombreDpto = '';
    if (typeof objDpto !== 'undefined') {
      nombreDpto = objDpto.nombre;
    }

    const objProvincia = this.lstProvincias.find(
      (item: any) => item.codigo === this.form.get('provincia')!.value
    );
    let nombreProvincia = '';
    if (typeof objProvincia !== 'undefined') {
      nombreProvincia = objProvincia.nombre;
    }

    const objDistrito = this.lstDistritos.find(
      (item: any) => item.codigo === this.form.get('distrito')!.value
    );
    let nombreDistrito = '';
    if (typeof objDistrito !== 'undefined') {
      nombreDistrito = objDistrito.nombre;
    }

    const obtTipoDireccion = this.lstTipoDomicilio.find(
      (item: any) => item.id === this.form.get('tipoDomicilio')!.value
    );

    const objvia = this.lstTipoVia.find(
      (item: any) => item.id === this.form.get('tipovia')!.value
    );

    let _nombreCalle = this.form.get('nombreCalle')!.value;

    if (
      obtTipoDireccion.nombre === 'REAL' ||
      obtTipoDireccion.nombre === 'PROCESAL'
    ) {
      _nombreCalle = objvia.nombre + ' ' + _nombreCalle;
    }

    let pais = this.form.get('pais')!.value;

    let requestDireccion: DireccionSalida = {
      idDireccion: this.form.get('idDireccion')!.value,
      tipoDireccion: this.form.get('tipoDomicilio')!.value,
      dpto: dpto,
      provincia: prov,
      distrito: dist,
      cpoblado: cpoblado,
      tipoVia: this.form.get('tipovia')!.value,
      nombre: _nombreCalle,
      nroDireccion: this.form.get('nroDireccion')!.value,
      prefijoUrb: this.form.get('tipoPrefijo')!.value,
      nombreUrb: this.form.get('nombreUrb')!.value,
      block:
        this.form.get('block')!.value == null
          ? ''
          : this.form.get('block')!.value,
      interior:
        this.form.get('interior')!.value == null
          ? ''
          : this.form.get('interior')!.value,
      etapa:
        this.form.get('etapa')!.value == null
          ? ''
          : this.form.get('etapa')!.value,
      mz:
        this.form.get('manzana')!.value == null
          ? ''
          : this.form.get('manzana')!.value,
      lote:
        this.form.get('lote')!.value == null
          ? ''
          : this.form.get('lote')!.value,
      sujeto: this.idSujeto,
      referencia:
        this.form.get('referencia')!.value == null
          ? ''
          : this.form.get('referencia')!.value,
      lat:
        this.form.get('latitude')!.value == null
          ? '0'
          : this.form.get('latitude')!.value,
      lon:
        this.form.get('longitude')!.value == null
          ? '0'
          : this.form.get('longitude')!.value,
      dptoNombre: nombreDpto,
      provinciaNombre: nombreProvincia,
      distritoNombre: nombreDistrito,
      tipoDireccionNombre: obtTipoDireccion.nombre,
      item: this.uuidv4(),
      pais: pais,
      descripcionPrefijoBlock: '',
      descripcionPrefijoInterior: '',
      direccionDomicilio: '',
      origen: '',
      registradoPor: '',
      fechaRegistro: '',
      actualizadoPor: '',
      fechaActualizacion: '',
    };

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
          if (this.idSujeto == '0') {
            var opcion;
            if (this.nombreOpcion.toLowerCase() === 'editar') {
              opcion = 'actualizar_lista2';
            } else {
              opcion = 'actualizar_lista';
            }
            let rsta = {
              opcion,
              data: requestDireccion,
              origen: 'Form',
            };
            this.dialogRef.close(JSON.stringify(rsta));
          } else {
            this.subscriptions.push(
              this.direService
                .registrarDireccionBD(requestDireccion, this.nombreOpcion)
                .subscribe({
                  next: (resp) => {
                    if (resp.code == 200) {
                      let rsta = {
                        opcion: 'actualizar_lista',
                        data: requestDireccion,
                        origen: 'BD',
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

  validarPais(event: any) {
    let codigoPais = event.value;
    this.nacionalidad = 1;
    if (codigoPais == 102) {
      this.nacionalidad = 0;
    }
  }

  async actulizarDistritos(event: any) {
    this.codProvSeleccionado = event.value;
    if (
      this.codDptoSeleccionado.length == 0 ||
      this.codProvSeleccionado == null
    ) {
      return;
    }
    await this.actualizarDistritosService(
      this.codDptoSeleccionado,
      this.codProvSeleccionado
    );
  }

  async verMapa() {
    let dpto = this.form.get('dpto')!.value;
    let prov = this.form.get('provincia')!.value;
    let dist = this.form.get('distrito')!.value;
    let Ubigeo = dpto + prov + dist;
    await this.obtenerUbigeoPueblo(Ubigeo);
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
    this.lstProvincias = [];
    this.codDptoSeleccionado = event;
    if (this.codDptoSeleccionado == null) {
      return new Promise<void>((resolve, reject) => {
        resolve();
      });
    }

    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService
          .obtenerProvincias(this.codDptoSeleccionado)
          .subscribe({
            next: (resp) => {
              this.lstProvincias = resp.data;
              this.lstDistritos = [];
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
            this.lstTipoVia = resp.data;
            resolve();
          },
        })
      );
    });
  }

  obtenerUbigeoPueblo(ubigeo: any) {
    this.lstUbigeoPueblo = [];

    if (typeof ubigeo == 'undefined' || ubigeo == null || ubigeo.length === 0) {
      this.lstUbigeoPueblo = [];
      return new Promise<void>((resolve, reject) => {
        resolve();
      });
    }
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenerUbigeoPueblo(ubigeo).subscribe({
          next: (resp) => {
            this.lstUbigeoPueblo = resp.data;
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
            this.lstPrefijos = resp.data;
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
          this.lstDptos = resp.data;
        },
      })
    );
  }

  obtenerTiposDomicilio() {
    this.lstTipoDomicilio = [];
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenerTipoDomicilio().subscribe({
          next: (resp) => {
            let tipoDomicilioPersonalizado: any[] = [];
            console.log('tipo de persona');
            console.log(this.tipoPersona);
            resp.data.forEach((x: any) => {
              if (this.tipoPersona == 1) {
                //natural o juridica
                if (this.tipoEjecucion == '3') {
                  // cuando se presiona el botón NUEVO

                  if (x.nombre === 'RENIEC' || x.nombre === 'SUNAT') {
                  } else {
                    tipoDomicilioPersonalizado.push(x);
                  }
                } else {
                  // Cuando el botón es Editar o Ver

                  if (this.dataDirecciones2.tipoDireccionNombre == 'RENIEC') {
                    // si es reniec agregar elementos
                    tipoDomicilioPersonalizado.push(x);
                  } else {
                    // si no es RENIEC - PROCEDER A VALIDAR QUE EL ITEM AGREGAR SEA DIFENTE A RENIEC
                    if (x.nombre !== 'RENIEC') {
                      tipoDomicilioPersonalizado.push(x);
                    }
                  }
                }
              } else {
                if (this.tipoEjecucion == '3') {
                  // cuando se presiona el botón NUEVO
                  if (
                    x.nombre === 'RENIEC' ||
                    x.nombre === 'LABORAL' ||
                    x.nombre === 'LEGAL' ||
                    x.nombre === 'SUNAT'
                  ) {
                  } else {
                    tipoDomicilioPersonalizado.push(x);
                  }
                } else {
                  if (this.dataDirecciones2.tipoDireccionNombre == 'SUNAT') {
                    tipoDomicilioPersonalizado.push(x);
                  } else {
                    if (x.nombre !== 'SUNAT') {
                      tipoDomicilioPersonalizado.push(x);
                    }
                  }
                }
              }
            });

            this.lstTipoDomicilio = tipoDomicilioPersonalizado;
            resolve();
          },
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  close() {
    this.dialogRef.close();
  }
}
