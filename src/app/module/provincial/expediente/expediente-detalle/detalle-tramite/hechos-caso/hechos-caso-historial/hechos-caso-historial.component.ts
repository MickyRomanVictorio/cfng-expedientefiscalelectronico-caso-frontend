import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from "primeng/dropdown";
import { CommonModule, DatePipe, Location } from '@angular/common';
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { MenuModule } from "primeng/menu";
import { TableModule } from "primeng/table";
import { CalendarModule } from "primeng/calendar";
import { DateMaskModule } from "@directives/date-mask.module";
import { InputTextModule } from "primeng/inputtext";
import { RadioButtonModule } from "primeng/radiobutton";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { MessageService } from "primeng/api";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ToastModule } from "primeng/toast";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { SelectButtonModule } from "primeng/selectbutton";
import { ReusablesHechosCasoService } from "@services/reusables/reusable-hechoscaso.service";
import { MaestroService } from "@services/shared/maestro.service";
import { catchError, of, Subscription } from "rxjs";
import { LatLng, Map, Marker, tileLayer, latLng } from "leaflet";
import { GeoService } from "@shared/geo.service";
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
@Component({
  standalone: true,
  selector: 'app-hechos-caso-historial',
  templateUrl: './hechos-caso-historial.component.html',
  styleUrls: ['./hechos-caso-historial.component.scss'],
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
    SelectButtonModule
  ],
  providers: [MessageService, DialogService, DatePipe]
})
export class HechosCasoHistorialComponent implements OnInit, AfterViewInit, OnDestroy {

  // @Input() numeroCaso: string = "";

  subscriptions: Subscription[] = [];

  public loadingData: boolean = false;

  // public ref: DynamicDialogRef;

  private idHechoHistorial: any;
  public fechaModificacion: any;

  public place: string[] = ['Perú'];
  usarMapas: boolean = true;
  public currentMarker!: Marker;
  private map!: Map;
  direccionMapa: String = "";

  public coordsRegistered: boolean = false;
  departamentos: any = [];
  provincias: any = [];
  distritos: any = [];

  codDptoSeleccionado: String = "";
  codProvSeleccionado: String = "";

  isDisabled = true;

  constructor(
    private formulario: FormBuilder,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private reusablesHechosCasoService: ReusablesHechosCasoService,
    private maestrosService: MaestroService,
    private geoService: GeoService,
    public config: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
  ) {
    this.idHechoHistorial = this.config.data.idHechoHistorial;
    /**this.fechaModificacion = this.config.data.fechaModificacion;**/
  }

  ngAfterViewInit(): void {
    this.map = new Map('mapa').setView([-12.05145781025591, -77.0280674167715], 17);
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.map.on('click', (event) => {
      const latLng: LatLng = event.latlng;
      this.addMarkerToMap(latLng);
    });
  }

  // form: FormGroup;

  stateOptions: any[] = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' }
  ];

  async ngOnInit() {
    // ngOnInit() {
    // this.obtenerDepartamentos();
    await this.obtenerDepartamentos();
    this.formCargaDataInicio();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  form: FormGroup = new FormGroup({
    // this.form = this.formulario.group({
    nombreHecho: new FormControl({ value: '', disabled: true }),
    fechaHecho: new FormControl({ value: '', disabled: true }),
    horaHecho: new FormControl({ value: '', disabled: true }),
    ampm: new FormControl({ value: '', disabled: true }),
    descripcion: new FormControl({ value: '', disabled: true }),
    departamento: new FormControl({ value: '', disabled: true }),
    provincia: new FormControl({ value: '', disabled: true }),
    distrito: new FormControl({ value: '', disabled: true }),
    direccion: new FormControl({ value: '', disabled: true }),
    referenciaDireccion: new FormControl({ value: '', disabled: true }),
    direccionMapa: new FormControl({ value: '', disabled: true }),
    latitude: new FormControl(null, []),
    longitude: new FormControl(null, []),
  });

  private formCargaDataInicio(): void {

    this.reusablesHechosCasoService.getVersionAnterior(this.idHechoHistorial).subscribe(async response => {
      console.log('responseee = ', response)
      let dpto, prov, dist: any;
      if (typeof response.data.ubigeo !== "undefined") {
        if (response.data.ubigeo.length == 6) {
          dpto = response.data.ubigeo.substr(0, 2);
          prov = response.data.ubigeo.substr(2, 2);
          dist = response.data.ubigeo.substr(4, 2);
          this.actualizarProvincias(dpto);
          await this.actualizarDistritosService(dpto, prov);
          let objDistrito = this.distritos.find((x: any) => x.codigo === dist);
          this.flyToPlace(objDistrito.nombre, true, response.data.latitud, response.data.longitud);
        }
      }
      this.fechaModificacion = response.data.fechaModificacion;
      this.form.patchValue({
        // this.form = this.formulario.group({
        nombreHecho: response.data.nombre,
        fechaHecho: this.datePipe.transform(response.data.fecha, 'dd/MM/yyyy'),
        horaHecho: response.data.hora.split(" ")[0].substring(0, 5),
        ampm: response.data.hora.split(" ")[1],
        descripcion: response.data.descripcion,
        departamento: dpto,
        provincia: prov,
        distrito: response.data.ubigeo.substring(4, 6),
        direccion: response.data.direccion,
        referenciaDireccion: response.data.referenciaDireccion,
        latitude: new FormControl(null, []),
        longitude: new FormControl(null, []),
      });
    }
    )

  }

  private obtenerDepartamentos(): void {
    this.provincias = null;
    /*this.subscriptions.push(
      this.maestrosService.obtenerDepartamentos().subscribe({
        next: resp => {
          this.departamentos = resp.data;
        }
      })
    );*/

    this.maestrosService.obtenerDepartamentos().subscribe(resp => {
      this.departamentos = resp.data;
      // this.departamentos = resp.data.map(item => ({value: item.codigo, label: item.nombre}));
    });
  }

  actualizarProvincias(event: any) {
    this.provincias = null;
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
    )
  }

  actulizarDistritos(event: any) {
    this.distritos = null;
    this.codProvSeleccionado = event.value;

    if (this.codDptoSeleccionado.length == 0 || this.codProvSeleccionado == null) {
      return;
    }
    this.actualizarDistritosService(this.codDptoSeleccionado, this.codProvSeleccionado);
  }

  actualizarDistritosService(dpto: any, prov: any) {
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

  close() {
    this.dialogRef.close();
  }
  public closeAction(): void {
    this.dialogRef.close('closed')
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg'
  }

  private flyToPlace(place: string, getFly: boolean, lati: any, long: any): void {
    if (!this.loadingData) {
      this.geoService.searchPlace(place + ", " + this.place[0])
        .subscribe((res: any) => {
          const { lat, lon } = res[0]
          /**if (newFly) {
            this.map.flyTo([this.form.get('latitude')!.value, this.form.get('longitude')!.value], 17)
            this.coordsRegistered = false
            return
          }**/
          if (getFly) {
            this.map.flyTo([lati, long], 17)
            const coordenas = latLng([Number(lati), Number(long)]);
            this.addMarkerToMap(coordenas);
          } else {
            this.map.flyTo([lat, lon], 17)
            const coordenas = latLng([Number(lat), Number(lon)]);
            this.addMarkerToMap(coordenas);
          }

        })
    }
  }

  public addMarkerToMap(latLng: LatLng, address: string = '') {
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker)
    }
    this.currentMarker = new Marker(latLng).addTo(this.map);
    this.form.controls['latitude'].setValue(latLng.lat);
    this.form.controls['longitude'].setValue(latLng.lng);
    this.getDireccion(latLng);
  }

  /** validando ubigeo con el maps */
  protected getDireccion(latLng: LatLng): void {
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
        const direccion = ((resp.address.road ?? '') + " " + (resp.address.house_number ?? '')).trim();
        this.form.get('direccionMapa')!.setValue(direccion);
      }
    });
  }

}
