import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertaData } from '@interfaces/comunes/alert';
import { Combo } from '@core/interfaces/comunes/combo';
import { DireccionSalida } from '@interfaces/provincial/administracion-casos/sujetos/DireccionSalida';
import {
  PAIS_PERU,
  TIPO_DIRECCION_RENIEC,
  TIPO_DIRECCION_SUNAT
} from '@interfaces/provincial/administracion-casos/sujetos/informaciongeneralsujeto/tipo-sujeto-procesal.type';
import { DireccionRequest } from '@interfaces/reusables/sujeto-procesal/direccionRequest';
import { MaestroService } from '@services/shared/maestro.service';
import { GeoService } from '@shared/geo.service';
import { LatLng, Map, Marker, tileLayer } from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { lastValueFrom, Subscription } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { UpperCaseInputModule } from '@core/directives/uppercase-input.module';
import { DigitOnlyModule } from '@core/directives/digit-only.module';
import { ValidationModule } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { valid, validString } from '@core/utils/string';

@Component({
  standalone: true,
  selector: 'app-direccion-sujeto-procesal-modal',
  templateUrl: './direccion-sujeto-procesal-modal.component.html',
  styleUrls: ['./direccion-sujeto-procesal-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    CheckboxModule,
    UpperCaseInputModule,
    DigitOnlyModule,
    ValidationModule
  ],
  providers: [NgxCfngCoreModalDialogService],
})
export class DireccionSujetoProcesalModalComponent
  implements OnInit {

  public razon = new FormControl('', [Validators.required]);
  public tipoAccion: string = ''; //R: registrar, E: editar
  public tipoPersona: string = ''; // 1: persona natural, 2: persona juridica
  public nacionalidad: string = '';
  public idSujeto: string = '';
  public direccionRequest!: DireccionRequest;
  public listaDirecciones: DireccionRequest[] = [];
  public tipoRegistro;
  public item;
  public subscriptions: Subscription[] = [];
  public currentMarker!: Marker;
  private map!: Map;
  public coordsRegistered: boolean = false;
  public place: string[] = ['Perú'];
  public loadingData: boolean = false;
  private valoresIniciales!: any;

  estadoBotonGuardar: boolean = false;
  lstPaises: any = [];
  lstTipoVia: any;
  lstTipoDomicilio: Combo[] = [];
  lstDptos: any;
  lstProvincias: any = [];
  lstDistritos: any = [];
  lstPrefijos: any = [];
  codDptoSeleccionado: string = '';
  codProvSeleccionado: string = '';
  direccionMapa: string = '';
  usarMapas: boolean = false;
  lstUbigeoPueblo: any;
  limpiar = 'true';
  form!: FormGroup;
  mapaInicializado = false;
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  constructor(
    public referenciaModal: DynamicDialogRef,
    private readonly dialogRef: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly maestrosService: MaestroService,
    private readonly dialogService: DialogService,
    private readonly fb: FormBuilder,
    private readonly geoService: GeoService,
  ) {
    this.tipoAccion = this.config.data.tipoAccion; //R: registrar, E: editar
    this.tipoPersona = this.config.data.tipoPersona; // 1: persona natural, 2: persona juridica
    this.nacionalidad = this.config.data.nacionalidad;
    this.idSujeto = this.config.data.sujeto;
    this.direccionRequest = this.config.data.direccion;
    this.listaDirecciones = this.config.data.direcciones;
    this.tipoRegistro = this.config.data.tipoRegistro;
    this.item = this.config.data.item;
  }


  async ngOnInit() {
    this.form = this.fb.group({
      tipoDomicilio: [null, Validators.required],
      dpto: [null, Validators.required],
      provincia: [null, Validators.required],
      distrito: [null, Validators.required],
      tipovia: [null, Validators.required],
      tipoPrefijo: [null],
      cpoblado: [null],
      nombreCalle: [null, Validators.required],
      referencia: '',
      lote: '',
      manzana: '',
      nombre: '',
      etapa: '',
      interior: '',
      block: '',
      nombreUrb: '',
      nroDireccion: '',
      idDireccion: '',
      latitude: new FormControl(null, []),
      longitude: new FormControl(null, []),
      direccionMapa: [{ value: '', disabled: true }],
      esMapa: new FormControl(null, []),
      pais: 0,
      registradoPor: [{ value: '', disabled: true }],
      actualizadoPor: [{ value: '', disabled: true }],
      fechaRegistro: [{ value: '', disabled: true }],
      fechaActualizacion: [{ value: '', disabled: true }],
    });
    await this.obtenerPrefijo();
    await this.obtenertipoVia();
    this.obtenerPaises();
    this.obtenerDptos();
    await this.obtenerTiposDomicilio();

    this.datosIniciales();

    if (this.tipoAccion === 'E') {
      this.setFormulario(this.direccionRequest);
    }
  }



  datosIniciales() {
    this.lstTipoDomicilio =
      this.tipoPersona === '1'
        ? this.lstTipoDomicilio.filter(
          (x) =>
            x.id !== TIPO_DIRECCION_RENIEC && x.id !== TIPO_DIRECCION_SUNAT && x.id !== 7 && x.id !== 8 && x.id !== 2
        )
        : (this.lstTipoDomicilio = this.lstTipoDomicilio.filter(
          (x) =>
            x.id !== TIPO_DIRECCION_RENIEC &&
            // x.id !== TIPO_DIRECCION_SUNAT &&
            x.id !== 4 &&
            x.id !== 7 &&
            x.id !== 8 &&
            x.id !== 2
        ));

    this.form.get('pais')!.setValue(PAIS_PERU);
    this.tipoPersona === '2' && this.form.get('pais')!.disable();

  }

  async setFormulario(direccion: DireccionRequest) {
    if (Number(direccion.pais) !== 102) {
      this.form.get('dpto')!.disable();
      this.form.get('dpto')!.setValue('');
      this.form.get('provincia')!.disable();
      this.form.get('provincia')!.setValue('');
      this.form.get('distrito')!.disable();
      this.form.get('distrito')!.setValue('');
      this.form.get('cpoblado')!.disable();
      this.form.get('cpoblado')!.setValue('');
    }
    this.form.patchValue({
      tipoDomicilio: Number(direccion.tipoDireccion),
      dpto: direccion.dpto,
      tipovia: Number(direccion.tipoVia),
      tipoPrefijo: Number(direccion.prefijoUrb),
      cpoblado: direccion.cpoblado,
      nombreCalle: direccion.nombre,
      referencia: direccion.referencia,
      lote: direccion.lote,
      manzana: direccion.mz,
      etapa: direccion.etapa,
      interior: direccion.interior,
      block: direccion.block,
      nombreUrb: direccion.nombreUrb,
      nroDireccion: direccion.nroDireccion,
      idDireccion: direccion.idDireccion,
      latitude: direccion.lat,
      longitude: direccion.lon,
      registradoPor: direccion.registradoPor,
      fechaRegistro: direccion.fechaRegistro,
      fechaActualizacion: direccion.fechaActualizacion,
      actualizadoPor: direccion.actualizadoPor,
      esMapa: false,
      pais: Number(direccion.pais),
    });
    await this.actualizarProvincias(direccion.dpto);
    await this.actualizarDistritosService(direccion.dpto, direccion.provincia);
    this.form.get('provincia')!.setValue(direccion.provincia);
    this.form.get('distrito')!.setValue(direccion.distrito);


    await this.obtenerUbigeoPueblo(direccion.dpto +  direccion.provincia + direccion.distrito);
    if (valid(direccion.cpoblado)) {
      this.form.get('cpoblado')!.setValue(direccion.cpoblado);
    }

    if (Number(direccion.tipoDireccion) === TIPO_DIRECCION_RENIEC) {
      this.form.disable();
      this.form.get('cpoblado')!.enable();
      this.form.get('referencia')!.enable();
    }
    this.valoresIniciales = this.form.getRawValue();
  }

  onchangePais(evento: any) {
    this.lstProvincias = [];
    this.lstDistritos = [];
    this.lstUbigeoPueblo = [];

    this.form.get('dpto')!.setValue('');
    this.form.get('provincia')!.setValue('');
    this.form.get('distrito')!.setValue('');
    this.form.get('cpoblado')!.setValue('');
    if (evento === 102) {
      this.form.get('cpoblado')!.enable();
      this.form.get('dpto')!.enable();
      this.form.get('provincia')!.enable();
      this.form.get('distrito')!.enable();
    } else {
      this.form.get('dpto')!.disable();
      this.form.get('provincia')!.disable();
      this.form.get('distrito')!.disable();
      this.form.get('cpoblado')!.disable();
    }
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

  private obtenerPaises(): void {
    this.subscriptions.push(
      this.maestrosService.listarNacionalidad().subscribe({
        next: (resp) => {
          this.lstPaises = resp;
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
            this.lstTipoDomicilio = resp?.data;
            resolve();
          },
        })
      );
    });
  }

  actualizarProvincias(event: any) {
    this.lstProvincias = [];
    this.form.get('provincia')!.setValue('');
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
              this.lstUbigeoPueblo = [];
              this.form.get('distrito')!.setValue('');
              this.form.get('cpoblado')!.setValue('');
              resolve();
            },
          })
      );
    });
  }

  async actulizarDistritos(event: any) {
    this.codProvSeleccionado = event.value;
    this.form.get('distrito')!.setValue('');
    this.lstUbigeoPueblo = [];
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

  async actualizarPoblados() {
    this.form.get('cpoblado')!.setValue('');
    const valor = this.form.get('esMapa')!.value;
    if(valor && valor.includes("1")){
      this.verMapa();
    }
  }
  public existeDireccionTipoHabilitada(tipo:string): boolean {
    return this.listaDirecciones.some(direccion => 
        direccion.tipoDireccionNombre === tipo && direccion.habilitado
    );
  }

  public validarDireccion() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    let pais = this.form.get('pais')!.value;
    let dpto = this.form.get('dpto')!.value;
    let prov = this.form.get('provincia')!.value;
    let dist = this.form.get('distrito')!.value;
    let cpoblado = this.form.get('cpoblado')!.value;

    const objPais = this.lstPaises.find(
      (item: any) => item.id === pais
    );
    
    let nombrePais = '';
    if (typeof objPais !== 'undefined' && objPais?.nombre) {
      nombrePais = objPais.nombre;
    }
    
    if (this.nacionalidad == '1') {
      dpto = dpto || '00';
      prov = prov || '00';
      dist = dist || '00';
      cpoblado = cpoblado || '0';
    }

    const objDpto = this.lstDptos.find(
      (item: any) => item.codigo === this.form.get('dpto')!.value
    );
    let nombreDpto = '';
    if (typeof objDpto !== 'undefined' && objDpto?.nombre) {
      nombreDpto = objDpto.nombre;
    }

    const objProvincia = this.lstProvincias.find(
      (item: any) => item.codigo === this.form.get('provincia')!.value
    );
    let nombreProvincia = '';
    if (typeof objProvincia !== 'undefined' && objProvincia?.nombre) {
      nombreProvincia = objProvincia.nombre;
    }

    const objDistrito = this.lstDistritos.find(
      (item: any) => item.codigo === this.form.get('distrito')!.value
    );
    let nombreDistrito = '';
    if (typeof objDistrito !== 'undefined' && objDistrito?.nombre) {
      nombreDistrito = objDistrito.nombre;
    }

    let _nombreCalle = this.form.get('nombreCalle')!.value;
    const obtTipoDireccion: any = this.lstTipoDomicilio.find(
      (item) => item.id === this.form.get('tipoDomicilio')!.value
    )


    if(this.tipoAccion === 'E' && !this.validarCambiosForm()){
      this.modalDialogService.info("Información",
        `No se ha realizado ningún cambio en la información de la dirección`,
        'Aceptar');
        return;
    }
    //VALIDA SI SE ESTA CAMBIANDO DE TIPO DE DOMICILIO
    //SI OCURRE ESTO SE DEBE VALIDAR SI HAY EXISTE OTRO DOMICILIO , SI NO EXISTE SE INSERTA UNO NUEVO
    //PERO SI EXISTE SE DEBE INFORMAR QUE SE VA A REMPLAZAR EL ANTIGUO Y SE PONDRA UNO NUEVO
    const insertarEditar:boolean= this.valoresIniciales?.tipoDomicilio !== Number(this.form.get('tipoDomicilio')!.value);

    //VALIDA SI YA EXISTE UN PROCESAL O REAL EN LA LISTA
    let tipoDireccionValidacion = ['PROCESAL', 'REAL'].find(tipo =>
      obtTipoDireccion?.nombre === tipo && this.existeDireccionTipoHabilitada(tipo)) ?? '';


    //VALIDA SI EXISTE OTRA DIRECCION PROCESAL
    //SOLO APARECERA SI:
    //SE ESTA REGISTRANDO 
    // SE ESTA EDITANDO Y SE CAMBIA EL TIPO DE DOMICILIO
    //CASO CONTRARIO SOLO INSERTA (O EDITA) SEGUN LO INDICADO

    if((this.tipoAccion === 'R' && tipoDireccionValidacion !== '') || (this.tipoAccion === 'E' && insertarEditar && tipoDireccionValidacion !== '')) {
      const dialog = this.modalDialogService.warning(
        `Ya existe una dirección ${tipoDireccionValidacion}`,
        `Esta acción desactivará la actual dirección ${tipoDireccionValidacion} y registrará la nueva dirección como “activa”. ¿Desea continuar?`,
        'Aceptar',
        true,
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.registrarDireccion({
              dpto,
              prov,
              dist,
              cpoblado,
              _nombreCalle,
              nombrePais,
              nombreDpto,
              nombreProvincia,
              nombreDistrito,
              obtTipoDireccion,
              insertarEditar
            });
          }
        },
      });
    }
    else{
      this.registrarDireccion({
        dpto,
        prov,
        dist,
        cpoblado,
        _nombreCalle,
        nombrePais,
        nombreDpto,
        nombreProvincia,
        nombreDistrito,
        obtTipoDireccion,
        insertarEditar
      });
    }
  }



  

  registrarDireccion(data: any) {
    const {
      dpto,
      prov,
      dist,
      cpoblado,
      _nombreCalle,
      nombrePais,
      nombreDpto,
      nombreProvincia,
      nombreDistrito,
      obtTipoDireccion,
      insertarEditar
    } = data;
    let pais = this.form.get('pais')!.value;

    let requestDireccion: DireccionSalida = {
      idDireccion: this.form.get('idDireccion')!.value,
      tipoDireccion: this.form.get('tipoDomicilio')!.value,
      dpto: dpto,
      provincia: prov,
      distrito: dist,
      cpoblado: cpoblado,
      codCentroPoblado:cpoblado,
      tipoVia: this.form.get('tipovia')!.value,
      nombre: _nombreCalle,
      nroDireccion: this.form.get('nroDireccion')!.value,
      prefijoUrb: this.form.get('tipoPrefijo')!.value,
      nombreUrb: this.form.get('nombreUrb')!.value,
      block: this.form.get('block')!.value == null ? '' : this.form.get('block')!.value,
      interior: this.form.get('interior')!.value == null ? '' : this.form.get('interior')!.value,
      etapa: this.form.get('etapa')!.value == null ? '' : this.form.get('etapa')!.value,
      mz: this.form.get('manzana')!.value == null ? '' : this.form.get('manzana')!.value,
      lote: this.form.get('lote')!.value == null ? '' : this.form.get('lote')!.value,
      sujeto: this.idSujeto,
      referencia: this.form.get('referencia')!.value == null ? '' : this.form.get('referencia')!.value,
      lat: this.form.get('latitude')!.value == null ? '0' : this.form.get('latitude')!.value,
      lon: this.form.get('longitude')!.value == null ? '0' : this.form.get('longitude')!.value,
      dptoNombre: nombreDpto,
      provinciaNombre: nombreProvincia,
      distritoNombre: nombreDistrito,
      tipoDireccionNombre: obtTipoDireccion?.nombre,
      item: this.uuidv4(),
      pais: pais,
      descripcionPrefijoBlock: '',
      descripcionPrefijoInterior: '',
      direccionDomicilio: '',
      origen: '',
      registradoPor: this.form.get('registradoPor')!.value,
      fechaRegistro: this.form.get('fechaRegistro')!.value,
      actualizadoPor: this.form.get('fechaRegistro')!.value,
      fechaActualizacion: this.form.get('fechaRegistro')!.value,
      insertarEditar:insertarEditar,
      paisNombre: nombrePais
    };


    const dialog = this.modalDialogService.success(
      'Agregar Dirección',
      `Confirmar ${this.tipoAccion === 'R' ? 'agregar' : 'editar'} dirección`,
      'Aceptar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.dialogRef.close(requestDireccion);
        }
      },
    });
  }

  uuidv4 = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c =>
      ((Math.random() * 16) | (c === 'x' ? 0 : 8)).toString(16)
    );

  close() {
    this.dialogRef.close();
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


  /***** GESTION DE MAPAS *****/

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

  private flyToPlace(place: string, newFly: boolean = false): void {
    if (!this.loadingData) {
      this.geoService
        .searchPlace(place + ', ' + this.place[0])
        .subscribe((res: any) => {
          const { lat, lon } = res[0];
          if (newFly) {
            this.map.flyTo([this.form.get('latitude')!.value, this.form.get('longitude')!.value], 17);
            this.coordsRegistered = false;
            return;
          }
          this.map.flyTo([lat, lon], 17);
        });
    }
  }

  checkValue() {
    let estado = this.form.get('esMapa')!.value;

    if (typeof estado[0] === 'undefined') {
      this.usarMapas = false;
      return;
    }

    if (estado[0] === '1') {
      this.usarMapas = true;

      if (this.mapaInicializado && this.map) {
        this.map.remove();
        this.mapaInicializado = false;
      }

      setTimeout(() => {
        this.initMap(this.form.get('latitude')!.value, this.form.get('longitude')!.value);
      }, 0);
    } else {
      this.usarMapas = false;

      if (this.map) {
        this.map.remove();
        this.mapaInicializado = false;
      }
    }
  }

  private initMap(latitudInicial: number, longitudInicial: number): void {
    latitudInicial = latitudInicial || -12.05145781025591;
    longitudInicial = longitudInicial || -77.0280674167715;

    this.map = new Map('map', { center: [latitudInicial, longitudInicial], zoom: 17 });

    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.currentMarker = new Marker([latitudInicial, longitudInicial]).addTo(this.map);

    this.map.on('click', (event) => {
      const latLng: LatLng = event.latlng;
      this.addMarkerToMap(latLng);
    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    this.mapaInicializado = true;
  }

  public addMarkerToMap(latLng: LatLng, address: string = '') {
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }
    this.currentMarker = new Marker(latLng).addTo(this.map);
    this.form.controls['latitude'].setValue(latLng.lat);
    this.form.controls['longitude'].setValue(latLng.lng);
    this.getDireccion(latLng);
  }

  public getDireccion(latLng: LatLng): void {
    this.geoService.buscarDireccion(latLng.lat, latLng.lng).subscribe({
      next: (response) => {
        const resp: any = response;
        const { road, house_number } = resp.address;
        const direccionMap = `${validString(road) ?? ''} ${validString(house_number) ?? ''}`.trim();
        this.form.controls['direccionMapa'].setValue(direccionMap);
        this.direccionMapa = direccionMap;
        this.loadcontrols(resp);
      },
    });
  }

  async loadcontrols({ address, display_name }: any) {
    const desDep = address.region?.toUpperCase() === 'CALLAO' ? 'CALLAO' : address.state.toUpperCase();
    const codDep = this.lstDptos.find((e: any) => e.nombre === this.quitarTildes(desDep)) ?? {
      codigo: '',
      nombre: ''
    };
    const desProv = address.region.toUpperCase().replace(' ', '');

    let desDis = address.city_district || address.suburb || address.city || address.town || address.village;
    desDis = desDis.replaceAll('-', '').replaceAll(' ', '');
    this.form.get('dpto')!.setValue(codDep.codigo);


    let tipoViaMapa;
    if (codDep) {
      const provincias = await lastValueFrom(this.maestrosService.provincia(codDep.codigo))
      this.lstProvincias = provincias.data;

      const codProv = this.lstProvincias.find((e: any) => e.nombre.replace(' ', '') === this.quitarTildes(desProv)) ?? {
        codigo: '',
        nombre: ''
      };
      this.form.get('provincia')!.setValue(codProv.codigo);

      const distritos = await lastValueFrom(this.maestrosService.distrito(codDep.codigo, codProv.codigo));
      this.lstDistritos = distritos.data;
      const codDis = this.lstDistritos.find((e: any) => e.nombre.replaceAll(' ', '') === this.quitarTildes(desDis?.toUpperCase())) ?? {
        codigo: '',
        nombre: ''
      };
      this.form.get('distrito')!.setValue(codDis.codigo);
      tipoViaMapa = this.obtenerTipViaMapa(address.road);
      this.form.get('tipovia')!.setValue(tipoViaMapa.idTipoVia);
      this.form.controls['nombreCalle'].setValue(validString(tipoViaMapa.direccion) ?? '');
      this.form.controls['nroDireccion'].setValue(address.house_number ?? '');
    }
  }

  obtenerTipViaMapa(texto: string): any {
    const palabras = texto.split(' ');
    const primeraPalabra = palabras[0].toUpperCase();
    const coincidencia = this.lstTipoVia.find((item: any) => item.nombre === primeraPalabra);

    if (coincidencia) {
      return { idTipoVia: coincidencia.id, direccion: palabras.slice(1).join(' ') };
    } else {
      return { idTipoVia: null, direccion: texto };
    }
  }

  quitarTildes = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  counterReportChar(input: string): number {
    return this.form.get(input)!.value !== null
      ? this.form.get(input)!.value.length
      : 0;
  }
  validarCambiosForm(): boolean {
    return JSON.stringify(this.valoresIniciales) !== JSON.stringify(this.form.getRawValue());
  }

}
