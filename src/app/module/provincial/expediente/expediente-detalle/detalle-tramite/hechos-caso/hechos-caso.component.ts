import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { AlertaModalComponent } from "@components/modals/alerta-modal/alerta-modal.component";
import { HistorialHechoCaso } from "@core/interfaces/comunes/HistorialHechoCaso";
import { DateMaskModule } from "@directives/date-mask.module";
import { AlertaData } from "@interfaces/comunes/alert";
import { HechosCasoRequest } from "@interfaces/reusables/hechos-caso/HechosCasoRequest";
import { ReusablesHechosCasoService } from "@services/reusables/reusable-hechoscaso.service";
import { MaestroService } from "@services/shared/maestro.service";
import { GeoService } from "@shared/geo.service";
import { obtenerIcono } from '@utils/icon';
import { LatLng, latLng, Map, Marker, tileLayer } from "leaflet";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { MessageService } from "primeng/api";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MenuModule } from "primeng/menu";
import { RadioButtonModule } from "primeng/radiobutton";
import { SelectButtonModule } from "primeng/selectbutton";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { catchError, lastValueFrom, of, Subscription } from "rxjs";
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { HechosCasoHistorialComponent } from './hechos-caso-historial/hechos-caso-historial.component';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { quitarTildes } from '@core/utils/string';
import { NgxSpinnerService } from 'ngx-spinner';
import { InputMask, InputMaskModule } from 'primeng/inputmask';
import { UbigeoInterface } from '@core/interfaces/mesa-unica-despacho/global/ubigeo.interface';
import { isAfter, isBefore, isSameDay, set } from 'date-fns';
import { CasosMonitoreadosService } from '@core/services/superior/casos-monitoreados/casos-monitoreados.service';
import { Expediente } from '@core/utils/expediente';

@Component({
  standalone: true,
  selector: 'app-hechos-caso',
  templateUrl: './hechos-caso.component.html',
  styleUrls: ['./hechos-caso.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    MenuModule,
    TableModule,
    CalendarModule,
    DateMaskModule,
    InputTextModule,
    RadioButtonModule,
    InputTextareaModule,
    ToastModule,
    SelectButtonModule,
    InputMaskModule,
  ],
  providers: [MessageService, DialogService, DatePipe, NgxCfngCoreModalDialogService]
})
export class HechosCasoComponent implements OnInit, AfterViewInit, OnDestroy, OnInit {
  @Input() tipo: string = '';
  @Input() idCaso: string = '';
  @Input() soloLectura: boolean = false;
  @ViewChild(InputMask) horaHechoMask!: InputMask;
  private caso!: Expediente;
  private readonly subscriptions: Subscription[] = [];
  public loadingData: boolean = false;
  public referenciaModal!: DynamicDialogRef;
  public dialogRef!: DynamicDialogRef;
  private idHecho: string = '';
  public place: string[] = ['Perú'];
  protected usarMapas: boolean = true;
  public currentMarker!: Marker;
  private map!: Map;
  protected direccionMapa: String = "";
  public coordsRegistered: boolean = false;
  protected departamentos: any = [];
  protected provincias: any = [];
  protected distritos: any = [];
  protected codDptoSeleccionado: string = "";
  protected codProvSeleccionado: string = "";
  protected form: FormGroup;
  private tiempoSalidaMapa: number | null = null;
  protected historialHechoCaso: HistorialHechoCaso[] = [];
  protected stateOptions: any[] = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' }
  ];
  protected nombreCount = 30;
  protected wordCount = 4000;
  protected ubigeoInfo: UbigeoInterface = { department: '', province: '', district: '' }
  protected maxDate: Date = new Date();
  minDate: Date;
  isCalendarDisabled: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private reusablesHechosCasoService: ReusablesHechosCasoService,
    private maestrosService: MaestroService,
    private geoService: GeoService,
    private dialogService: DialogService,
    private gestionCasoService: GestionCasoService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly spinner: NgxSpinnerService,
    private readonly casosMonitoreadosService: CasosMonitoreadosService,
  ) {

    this.form = new FormGroup({
      nombreHecho: new FormControl(null),
      fechaHecho: new FormControl(null, [Validators.required]),
      horaHecho: new FormControl(null, [Validators.required]),
      ampm: new FormControl(null),
      descripcion: new FormControl(null, [Validators.required]),
      departamento: new FormControl(null, [Validators.required]),
      provincia: new FormControl(null, [Validators.required]),
      distrito: new FormControl(null, [Validators.required]),
      direccion: new FormControl(null, [Validators.required]),
      referenciaDireccion: new FormControl(null),
      latitude: new FormControl(null, []),
      longitude: new FormControl(null, []),
      direccionMapa: new FormControl(null)
    });

    // Obtener la fecha actual
    const currentDate = new Date();
    
     // Calcular la fecha mínima (80 años atrás)
     this.minDate = new Date();
     this.minDate.setFullYear(currentDate.getFullYear() - 80);
     
     // Aquí puedes realizar alguna lógica adicional si necesitas deshabilitar el calendario en algún momento
     // Por ejemplo, si el valor ya seleccionado es mayor que la fecha actual, se puede deshabilitar:
     const selectedDate = this.form.get('fechaHecho')?.value;
     if (selectedDate && new Date(selectedDate) < this.minDate) {
       this.isCalendarDisabled = true;
     }
  }

  protected limpiarHora() {
    this.form.controls['horaHecho'].reset();
  }

  protected alCambiarHoraHecho(): void {
    const fechaHecho = this.form.controls['fechaHecho'].value; // Fecha sin hora
    const horaHecho = this.form.controls['horaHecho'].value; // Hora seleccionada (sin fecha)
    const fechaActual = new Date();

    // Obtener el componente de la hora actual
    const horaActual = new Date(); // La hora actual del sistema
    horaActual.setHours(horaActual.getHours(), horaActual.getMinutes(), 0, 0); // Restablecer los minutos y segundos para comparación

    // Construir la fecha con la hora seleccionada para comparación
    const fechaHoraHecho = set(fechaHecho, { hours: horaHecho.getHours(), minutes: horaHecho.getMinutes() });

    const sonIguales = isSameDay(fechaHecho, fechaActual); // Verificar si la fecha seleccionada es igual a la actual
    const esFechaMenor = isBefore(fechaHecho, fechaActual); // Verificar si la fecha seleccionada es menor a la fecha actual

    if (sonIguales) {
      // Si la fecha es igual a la fecha actual, verificar la hora
      if (isAfter(fechaHoraHecho, horaActual)) {
        // Si la hora seleccionada es mayor que la hora actual, resetear la hora
        this.form.get('horaHecho')?.setValue(null);
      } else {
        // Si la hora seleccionada es menor o igual, mantenerla
        this.form.get('horaHecho')?.setValue(horaHecho);
      }
    } else if (esFechaMenor) {
      // Si la fecha es menor a la fecha actual, permitir cualquier hora
      this.form.get('horaHecho')?.setValue(horaHecho);
    } else {
      // Si la fecha es mayor a la fecha actual, resetear la hora
      this.form.get('horaHecho')?.setValue(null);
    }
  }

  ngAfterViewInit(): void {
     // Accede directamente al 'nativeElement' del componente InputMask
     /**const inputElement = this.horaHechoMask?.el.nativeElement;
**/
     // Asegurarnos de que el inputElement está disponible antes de agregar los eventos
   /**    inputElement.addEventListener('keypress', (event: KeyboardEvent) => this.validarFormatoHora(event));
       inputElement.addEventListener('onblur', () => this.validarHoraFinal());
**/
    const latitudInicial: number = this.form.get('latitude')?.value ?? -12.05145781025591;
    const longitudInicial: number = this.form.get('longitude')?.value ?? -77.0280674167715;

    this.tiempoSalidaMapa = window.setTimeout(() => {
      this.map = new Map('map').setView([latitudInicial, longitudInicial], 17);
      tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      /**setTimeout(() => {
        if (latitudInicial && longitudInicial) this.currentMarker = new Marker([latitudInicial, longitudInicial]).addTo(this.map);
      }, 500)**/

      this.map.on('click', (event) => {
        const latLng: LatLng = event.latlng;
        this.addMarkerToMap(latLng, false);
      });
    }, 500);
  }

  async ngOnInit() {
    this.obtenerDepartamentos();
    if (!this.idCaso) {
      console.log('idCaso != null')
      this.idCaso = this.gestionCasoService.casoActual.idCaso;
    }
    this.formCargaDataInicio();

    if (this.soloLectura) {
      this.form.disable();
    } else {
      this.caso = this.gestionCasoService.casoActual;
      this.soloLectura = (this.caso && (this.caso.flgLectura.toString() === '1' || this.caso.flgConcluido === '1'))
      if (this.esModoLecturaMonitoreado()) {
        this.soloLectura = this.esModoLecturaMonitoreado();
        this.form.disable();
      }
    }
  }

  private formCargaDataInicio(): void {
    this.reusablesHechosCasoService.getVersionActual(this.idCaso).subscribe(async response => {
      if (response.data !== "undefined" && response.data !== null) {
        this.idHecho = response.data.idHecho;
        this.loadListaHistorialModificaciones(this.idHecho);
        let dpto, prov, dist: any;
        //
        let ubig = '';
        if (typeof response.data.ubigeo !== "undefined" && response.data.ubigeo !== null) {
          ubig = response.data.ubigeo;
          if (response.data.ubigeo.length == 6) {
            dpto = response.data.ubigeo.substr(0, 2);
            prov = response.data.ubigeo.substr(2, 2);
            dist = response.data.ubigeo.substr(4, 2);
            this.actualizarProvincias(dpto, false);
            await this.actualizarDistritosService(dpto, prov);
            let objDistrito = this.distritos.find((x: any) => x.codigo === dist);
            //volando al punto seleccionado
            this.flyToPlace(objDistrito.nombre, true, response.data.latitud, response.data.longitud);
          }
        }

        //
        this.form.patchValue({
          nombreHecho: response.data.nombre,
          fechaHecho: this.datePipe.transform(response.data.fecha, 'dd/MM/yyyy'),
          horaHecho: response.data.hora.split(" ")[0].substring(0, 5),
          ampm: response.data.hora.split(" ")[1],
          descripcion: response.data.descripcion,
          departamento: dpto,
          provincia: prov,
          distrito: ubig.substring(4, 6),
          direccion: response.data.direccion,
          referenciaDireccion: response.data.referenciaDireccion,
          latitude: new FormControl(null, []),
          longitude: new FormControl(null, []),
          direccionMapa: response.data.direccionMapa
        });
        this.countNombre();
        this.countWords();
      }
      // TODO: Verificar las coordenadas
      /*var coordenas = latLng([Number(response.data.latitud), Number(response.data.longitud)]);
      this.addMarkerToMap(coordenas);*/
    });

    // Si necesitas que la validación se dispare cada vez que cambie el valor
    this.form.get('horaHecho')?.valueChanges.subscribe(() => {
      this.validarHoraFinal();
    });
  }

  protected actualizarHecho() {
    /**this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `ACTUALIZAR HECHO DEL CASO`,
        description: `Por favor confirme la acción de actualizar el Hecho.`,
        confirmButtonText: 'Actualizar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>);**/
    //
    /**this.referenciaModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {**/
          const ubigeo = `${this.form.get('departamento')!.value}${this.form.get('provincia')!.value}${this.form.get('distrito')!.value}`;
          const hora = `${this.form.get('horaHecho')!.value} ${this.form.get('ampm')!.value}`;
          /**const fechaHora = `${this.form.get('fechaHecho')!.value} ${hora}`;**/
          const latitud = this.form.get('latitude')!.value;
          const longitud = this.form.get('longitude')!.value;

          // Convertir la hora al formato de 24 horas si es necesario
          const horaConvertida = this.convertirAHora24Horas(this.form.get('horaHecho')?.value, this.form.get('ampm')?.value);

          let request: HechosCasoRequest = {
            idHecho: this.idHecho,
            nombre: this.form.get('nombreHecho')!.value,
            fecha: this.form.get('fechaHecho')!.value,
            descripcion: this.form.get('descripcion')!.value,
            ubigeo: ubigeo,
            latitud: latitud,
            longitud: longitud,
            direccion: this.form.get('direccion')!.value,
            referenciaDireccion: this.form.get('referenciaDireccion')!.value,
            hora: horaConvertida,
            idHechoHistorial: null,
            usuarioModificacion: null,
            idCaso: null
          }
          this.reusablesHechosCasoService.actualizarHechosCaso(request).subscribe(data => {
            this.loadListaHistorialModificaciones(this.idHecho);
            // this.dialogRef.close(data);
            this.modalDialogService.info(
              'Datos guardado correctamente',
              'Se actualizó correctamente el hecho',
              'Aceptar'
            );
          });
          // this.loadListaHistorialModificaciones(this.idHecho);
        /** }
      }
    });**/

  }
  
  protected verHechoCasoAnterior(historialHechoCaso: HistorialHechoCaso): void {
    this.referenciaModal = this.dialogService.open(HechosCasoHistorialComponent, {
      width: '90%',
      showHeader: false,
      data: {
        idHechoHistorial: historialHechoCaso.idHechoHistorial,
        fechaModificacion: historialHechoCaso.fechaModificacion,
      }
    });
    this.referenciaModal.onClose.subscribe((respuesta) => {
      if (respuesta !== undefined) {
        if (respuesta.code === 200) {
        }
      }
    });
  }

  protected loadListaHistorialModificaciones(idHecho: string) {
    this.reusablesHechosCasoService.getListaHistorial(idHecho)
      .subscribe((result: any) => {
        this.historialHechoCaso = result.data;
      }
      );
  }

  private obtenerDepartamentos(): void {
    /**this.provincias = null;**/
    /**this.subscriptions.push(
      this.maestrosService.obtenerDepartamentos().subscribe({
        next: resp => {
          this.departamentos = resp.data;
        }
      })
    );**/

    /**this.maestrosService.obtenerDepartamentos().subscribe(resp => {
      this.departamentos = resp.data;
      // this.departamentos = resp.data.map(item => ({value: item.codigo, label: item.nombre}));
    });**/

    this.departamentos = [];
    this.subscriptions.push(
      this.maestrosService.obtenerDepartamentos().subscribe({
        next: (resp) => { 
          if (resp.code && resp.code === 200) {
            this.departamentos = resp.data;
            /**if (this.tracingService.currentAttchmentFormHechos.department) {
              this.changeDepartmentAuto(this.tracingService.currentAttchmentFormHechos.department);
            }**/
          }
        },
      })
    );
  }

  protected actualizarProvincias(event: any, animacion: boolean) {
    /**this.provincias = null;
    this.codDptoSeleccionado = event;
    if (this.codDptoSeleccionado == null) {
      return;
    }

    this.subscriptions.push(
      this.maestrosService.obtenerProvincias(this.codDptoSeleccionado).subscribe({
        next: resp => {
          this.provincias = resp.data;
          // this.provincias = resp.data.map(item => ({value: item.codigo, label: item.nombre}));
          this.distritos = [];
        }
      })
    )**/
    this.currentMarker && this.map.removeLayer(this.currentMarker);

    this.codDptoSeleccionado = event;

    if (this.codDptoSeleccionado !== null) {
      const timeout = this.loadingData ? 500 : 0;

      setTimeout(() => {
        const department = this.departamentos.find((x: any) => x.codigo === this.codDptoSeleccionado);
        if (department) {
          this.form.controls['provincia'].reset();
          this.form.controls['provincia'].enable();
          this.form.controls['distrito'].reset();
          this.form.controls['distrito'].disable();
          this.form.controls['direccionMapa'].reset();
          this.place = ['Perú'];

          if (animacion) {
            this.flyToPlace(department['nombre'], false, null, null);
          }

          this.getProvinces(department['codigo']);
        }
      }, timeout);
    }
  }
  
  protected getProvinces(departmentId: string): void {
    this.provincias = [];
    this.subscriptions.push(
      this.maestrosService.obtenerProvincias(departmentId).subscribe({
        next: (resp) => {
          if (resp.code && resp.code === 200) {
            this.provincias = resp.data;
            /**this.loadingData &&  this.form.get('provincia')!.setValue(this.getUbigeo(2));**/
            this.distritos = [];
          }
        },
      })
    );
  }

  protected actulizarDistritos(event: any, animacion: boolean) {
    /**this.distritos = null;
    this.codProvSeleccionado = event.value;
    if (this.codDptoSeleccionado.length == 0 || this.codProvSeleccionado == null) {
      return;
    }
    this.actualizarDistritosService(this.codDptoSeleccionado, this.codProvSeleccionado);**/

    this.currentMarker && this.map.removeLayer(this.currentMarker);

    /**const departmentId = this.form.controls['departamento'].value;**/
    const provinceId = event.value;

    if (provinceId !== null) {
      const province: any = this.provincias.find((x: any) => x.codigo === provinceId);
      
      this.form.controls['distrito'].reset();
      this.form.controls['distrito'].enable();
      this.place = this.place.slice(-2);

      if (animacion) {
        this.flyToPlace(province?.nombre, false, null, null);
      }
      
      /**this.getDistricts(departmentId, provinceId);**/
      this.actualizarDistritosService(this.codDptoSeleccionado, provinceId);
    }

  }
  
  protected actualizarDistritosService(dpto: any, prov: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenerDistritos(dpto, prov).subscribe({
          next: resp => {
            this.distritos = resp.data;
            resolve();
          }
        })
      )
    });
  }

  /**protected getDistricts(departmentId: string, provinceId: string): void {
    this.distritos = [];
    this.subscriptions.push(
      this.maestrosService.obtenerDistritos(departmentId, provinceId).subscribe({
        next: (resp) => {
          if (resp.code && resp.code === 200) {
            this.distritos = resp.data;
            //if (this.loadingData) {
              //this.form.get('distrito')!.setValue(this.getUbigeo(3));
              //this.changeDistrict(this.getUbigeo(3), true);
              //this.loadingData = false;
            //}
          }
        },
      })
    );
  }**/

  /**async verMapa($event: any) {
    let objDistrito = this.distritos.find((x: any) => x.codigo === this.form.get('distrito')!.value);
    this.flyToPlace(objDistrito.nombre, false, null, null)
  }**/

  protected changeDistrict(value: any, animacion: boolean) {
    this.currentMarker && this.map.removeLayer(this.currentMarker);

    let id = value.value
    if (id !== null) {
      const district: any = this.distritos.find((x: any) => x.codigo === id);

      this.place = this.place.slice(-3);

      if (animacion) {
        this.flyToPlace(district?.nombre,  false, null, null);
      }
    }
  }

  public obtenerTituloModal(): SafeHtml {
    let titulo: string = 'Versión Actual del hecho:';
    return this.sanitizer.bypassSecurityTrustHtml(`${titulo}`)
  }

  public obtenerIcono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  

  private flyToPlace(place: string, addMarkerToMap: boolean, lati: any, long: any): void {
    this.place.unshift(place);
    if (!this.loadingData) {
      this.geoService.searchPlace(this.place.join(', '))
        .subscribe((res: any) => {
          if (!res[0]) {
            return;
          }
          const { lat, lon } = res[0];
          /**if (newFly) {
            this.map.flyTo([this.form.get('latitude')!.value, this.form.get('longitude')!.value], 17)
            this.coordsRegistered = false
            return
          }**/
          if (addMarkerToMap) {
            this.map.flyTo([lati, long], 17)
            const coordenas = latLng([Number(lati), Number(long)]);
            this.addMarkerToMap(coordenas, addMarkerToMap);
          } else {
            this.map.flyTo([lat, lon], 17)
          }
        });
    }
  }

  public addMarkerToMap(latLng: LatLng, setearDireccion: boolean, address: string = '') {
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker)
    }

    this.currentMarker = new Marker(latLng).addTo(this.map)
    this.form.controls['latitude'].setValue(latLng.lat)
    this.form.controls['longitude'].setValue(latLng.lng)
    /**address !== '' ? this.form.controls['direccionMapa'].setValue(address) : this.getDireccion(latLng)**/
    this.getDireccion(latLng, setearDireccion);
  }

  /**public getDireccion(latLng: LatLng): void {
    this.geoService.buscarDireccion(latLng.lat, latLng.lng).subscribe({
      next: response => {
        const resp: any = response;
        let numero = resp.address.house_number ?? '';
        this.form.controls['direccionMapa'].setValue(resp.address.road + " " + numero)
        this.direccionMapa = resp.address.road + " " + numero;
      }
    })
  }**/

  /** validando ubigeo con el maps */
  protected getDireccion(latLng: LatLng, setearDireccion: boolean): void {
    this.geoService.buscarDireccion(latLng.lat, latLng.lng).pipe(
      catchError((error) => {
        // En caso de error en la solicitud, mostramos una advertencia
        this.modalDialogService.warning('ERROR AL OBTENER LA DIRECCIÓN', 'Hubo un error al obtener la dirección, intente nuevamente.', 'Aceptar');
        return of(null); // Devolvemos un observable vacío para continuar el flujo
      })
    ).subscribe({
      next: response => {
        if (!response) return; // Si la respuesta es null debido al error, no hacer nada

        const resp: any = response;

        if (resp.address.country_code !== 'pe') {
          this.modalDialogService.warning('UBICACIÓN NO PERMITIDA', 'Elija otra ubicación en el mapa', 'Aceptar');
          this.resetearComboDepartamento();
          return;
        }

        const direccion = ((resp.address.road ?? '') + " " + (resp.address.house_number ?? '')).trim();
        /**if (!direccion) {
          this.modalDialogService.warning('DIRECCIÓN INCOMPLETA', 'La dirección no contiene la calle o el número de casa.', 'Aceptar');
          this.resetearComboDepartamento();
          return;
        }**/

        this.form.get('direccionMapa')!.setValue(direccion);
        if(!setearDireccion){
          this.form.get('direccion')!.setValue(direccion);
        }
        this.direccionMapa = direccion;

        this.loadcontrols(resp);
      }
    });
  }

  async loadcontrols({ address, display_name }: any) {
    const desDep = (address.region?.toUpperCase() ?? '') === 'CALLAO' ? 'CALLAO' : (address.state?.toUpperCase() ?? '');

    // Buscar departamento
    const codDep: any = this.departamentos
      .find((e: any) => e.nombre === quitarTildes(desDep)) ?? { codigo: '', nombre: '' };

    const desProv = (address.region?.toUpperCase().replace(' ', '') ?? '');

    let desDis = (address.city_district || address.suburb || address.city || address.town || address.village);
    desDis = (desDis ?? '').replaceAll('-', '').replaceAll(' ', '');

    // Establecer el departamento
    this.form.get('departamento')!.setValue(codDep.codigo);

    this.enableAndResetProvDist();
    this.spinner.show();

    if (codDep) {
      try {
        const prov = await lastValueFrom(this.maestrosService.provincia(codDep.codigo));
        this.provincias = prov.data;

        const codProv: any = this.provincias
          .find((e: any) => e.nombre.replace(' ', '') === quitarTildes(desProv)) ?? { codigo: '', nombre: '' };

        this.form.get('provincia')!.setValue(codProv.codigo);
        this.enableAndResetDist();

        const dist = await lastValueFrom(this.maestrosService.distrito(codDep.codigo, codProv.codigo));
        this.distritos = dist.data;

        const codDis: any = this.distritos
          .find((e: any) => e.nombre.replaceAll(' ', '') === quitarTildes(desDis?.toUpperCase())) ?? { codigo: '', nombre: '' };

        this.form.get('distrito')!.setValue(codDis.codigo);
        this.form.controls['distrito'].enable();

      } catch (error) {
        this.modalDialogService.warning('ERROR AL OBTENER LA INFORMACIÓN', 'Hubo un error al obtener los datos del departamento, provincia o distrito.', 'Aceptar');
      }
    }

    this.spinner.hide();
  }

  enableAndResetProvDist(): void {
    this.form.controls['provincia'].reset()
    this.form.controls['provincia'].enable()
    this.form.controls['distrito'].reset()
    this.form.controls['distrito'].disable()
  }

  enableAndResetDist(): void {
    this.form.controls['distrito'].reset()
    this.form.controls['distrito'].disable()
  }

  private resetearComboDepartamento(): void {
    this.form.controls['departamento'].reset();
    this.form.controls['provincia'].reset();
    this.form.controls['distrito'].reset();
    this.form.controls['direccionMapa'].reset();
  }

  countNombre() {
    const words = this.form.get('nombreHecho')!.value ?? '';
    this.nombreCount = 30 - words.length;
    // Disable textarea input if the word limit is reached
    if (this.nombreCount >= 30) {
      const currentValue = words;
      const newValue = currentValue.substring(0, 30);
      this.form.get('nombreHecho')!.setValue(newValue);
    }
  }

  countWords() {
    const words = this.form.get('descripcion')!.value ?? '';
    this.wordCount = 4000 - words.length;
    // Disable textarea input if the word limit is reached
    if (this.wordCount >= 4000) {
      const currentValue = words;
      const newValue = currentValue.substring(0, 4000);
      this.form.get('descripcion')!.setValue(newValue);
    }
  }

  validarFormatoHora(event: KeyboardEvent): boolean {
    const code = event.key; // Usamos `event.key` para obtener el carácter presionado directamente.

    // Permitir el backspace (código 8) y el dos puntos (:) (código 58)
    if (code === 'Backspace' || code === ':') {
      return true;
    }

    // Permitir solo números del 0 al 9
    if (code >= '0' && code <= '9') {
      return true;
    }

    // Si no es ninguno de los caracteres permitidos, bloqueamos la tecla
    return false;
  }

  validarHoraFinal(): void {
    const value = this.form.get('horaHecho')?.value;

    if (!value) {
      this.form.get('horaHecho')?.setErrors({ required: true });
      return;
    }

    const horaMinutos = value.split(':');
    if (horaMinutos.length !== 2) {
      this.form.get('horaHecho')?.setErrors({ invalidFormat: true });
      return;
    }

    const [hours, minutes] = horaMinutos;

    if (parseInt(hours) < 1 || parseInt(hours) > 12 || isNaN(parseInt(hours))) {
      this.form.get('horaHecho')?.setErrors({ invalidHour: true });
      return;
    }

    if (parseInt(minutes) < 0 || parseInt(minutes) > 59 || isNaN(parseInt(minutes))) {
      this.form.get('horaHecho')?.setErrors({ invalidMinute: true });
      return;
    }

    this.form.get('horaHecho')?.setErrors(null);
  }

  convertirAHora24Horas(hora: string, amPm: string): string {
    const [hours, minutes] = hora.split(':').map((str) => parseInt(str, 10));

    let hours24 = hours;

    if (amPm === 'PM' && hours !== 12) {
      hours24 += 12;
    } else if (amPm === 'AM' && hours === 12) {
      hours24 = 0;
    }

    // Devolver la hora en formato 24 horas
    return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /** */

  ngOnDestroy(): void {
    if (this.tiempoSalidaMapa !== null) {
      clearTimeout(this.tiempoSalidaMapa);
    }
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private esModoLecturaMonitoreado(): boolean {
    const esMonitoreado = this.casosMonitoreadosService.getEsMonitoreado(); 
    return esMonitoreado === '1';
  }

}
