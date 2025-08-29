import {CommonModule, DatePipe} from "@angular/common";
import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {ExportarService} from "@services/shared/exportar.service";
import {MaestroService} from "@services/shared/maestro.service";
import {TipoArchivoType} from "@core/types/exportar.type";
import {DateMaskModule} from "@directives/date-mask.module";
import {cleanEmptyFields} from "@utils/utils";
import {MenuItem, MessageService} from "primeng/api";
import {RadioButtonModule} from 'primeng/radiobutton';
import {CalendarModule} from "primeng/calendar";
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from "primeng/dialog";
import {DividerModule} from "primeng/divider";
import {DropdownModule} from "primeng/dropdown";
import {DialogService, DynamicDialogModule, DynamicDialogRef} from "primeng/dynamicdialog";
import {InputTextModule} from "primeng/inputtext";
import {MenuModule} from "primeng/menu";
import {MessagesModule} from "primeng/messages";
import {TableModule} from "primeng/table";
import {ToastModule} from "primeng/toast";
import {Subscription} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {obtenerIcono} from "@utils/icon";
import {ActivatedRoute} from "@angular/router";
import {CasoResuelto} from "@interfaces/provincial/administracion-casos/casos-resueltos/CasoResuelto";
import {CasosResueltosService} from "@services/superior/casos-resueltos/casos-resueltos.service";
import {
  BuscarCasosResueltosRequest
} from "@interfaces/provincial/administracion-casos/casos-resueltos/BuscarCasoResueltoRequest";
import { EscenarioUno } from '@interfaces/maestros/escenarios.interface';

@Component({
  selector: 'app-listar-casos-resueltos',
  standalone: true,
  imports: [
    CalendarModule,
        CheckboxModule,
        CmpLibModule,
        CommonModule,
        DateMaskModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        DynamicDialogModule,
        FormsModule,
        FormsModule,
        InputTextModule,
        MenuModule,
        MessagesModule,
        RadioButtonModule,
        ReactiveFormsModule,
        TableModule,
        ToastModule,
  ],
  templateUrl: './listar-casos-resueltos.component.html',
  styleUrls: ['./listar-casos-resueltos.component.scss'],
  providers: [ MessageService, DialogService, DatePipe ],
})
export class ListarCasosResueltosComponent implements OnInit {
  public fiscalesPorAsignar = []
  public fiscalias = []
  public despachos = []
  public origen: EscenarioUno[] = []
  public casoResuelto: CasoResuelto[] = []
  public casoResueltosFiltrados: CasoResuelto[] = []
  public casosSeleccionados: CasoResuelto[] = []
  public mostrarFiltros = false

  public formularioFiltrarCasos!: FormGroup
  public fiscalPorAsignar = new FormControl( null )

  public referenciaModal!: DynamicDialogRef
  public subscriptions: Subscription[] = []
  public nombreFiscal!: String
  public nombreFiscalia!: String

  public nombreOrigen: any = '*';
  public nombreDespacho: any = '*';
  public nombrePlazo: any = '*';
  public nombreRemitente: any = '*';
  public fechaOrigenSeleccionada: any = '*';
  public fechaFinSeleccionada: any = '*';
  public formReseteado: boolean = false;
  leido: any = 1;
  public tipoElevacion : number = 0;

  opcionesMenu: ( data: any ) => MenuItem[] = ()=>[];

  constructor(
      private formulario: FormBuilder,
      private sanitizer: DomSanitizer,
      private spinner: NgxSpinnerService,
      private maestrosService: MaestroService,
      private dialogService: DialogService,
      private messageService: MessageService,
      private exportarService: ExportarService,
      private datePipe: DatePipe,
      private casosResueltosService: CasosResueltosService ,
      public maestroService: MaestroService,
      private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    this.tipoElevacion = this.route.snapshot.params['idTipoElevacion'];
      console.log("id tipo elevacion caso resuleto ",this.route.snapshot.params['idTipoElevacion']);
      this.formBuild()
      this.obtenerOrigen()
      this.getDependenciaFiscal()
     // this.obtenerFiscales()

  this.obtenerCasosResueltos()
    this.opcionesMenu = (data: any) => [];
}

  private formBuild(): void {
    const fechaHasta = new Date();
    const fechaDesde = new Date(fechaHasta.getFullYear(), fechaHasta.getMonth() - 1, fechaHasta.getDate());
      this.formularioFiltrarCasos = this.formulario.group({
          buscar: [ '' ],
          fiscalia: [null],
          despacho: [null],
          remitente:[null],
          fechaDesde: [ fechaDesde],
          fechaHasta: [ fechaHasta ],
          tipoElevacion :[this.tipoElevacion], //724//
          origen: [ null ],
      })

  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public icono( nombre: string ): any {
      return obtenerIcono( nombre )
  }

 /*  private obtenerFiscales(): void {
      this.subscriptions.push(
          this.elevacionActuadosService.obtenerFiscales().subscribe({
            next: resp => {
                this.fiscalesPorAsignar = resp
            },
            error: error => {
              console.log( error )
            }
          })
      )
  } */

  getDependenciaFiscal():void {
      // this.subscriptions.push(
      //   this.elevacionActuadosService.getFiscalias().subscribe({
      //       next: resp => {
      //         this.fiscalias = resp
      //       },
      //       error: ( error ) => {
      //         this.fiscalias = []
      //     }})
      //   )
  }

  getDespacho():void {
    if ( this.formularioFiltrarCasos.get('fiscalia')!.value === null ) {
      this.despachos = []
    } else {
      this.subscriptions.push(
        this.maestroService.getDespacho( this.formularioFiltrarCasos.get('fiscalia')!.value ).subscribe({
            next: resp => {
              this.despachos = resp.data
            },
          error: () => {
              this.despachos = []
          }})
        )
    }
  }

  private obtenerOrigen(): void {
      this.subscriptions.push(
          this.maestrosService.obtenerOrigen().subscribe({
              next: resp => [
                  this.origen = resp.data
              ]
          })
      )
  }

  seleccionarFechaInicio(event:any) {
      let d = new Date(Date.parse(event));
      this.fechaOrigenSeleccionada = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  }

  seleccionarFechaFin(event:any) {
      let d = new Date(Date.parse(event));
      this.fechaFinSeleccionada = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  changeFiscalia(event:any) {
      this.getDespacho();
      this.nombreFiscalia = event.originalEvent.srcElement.innerText
  }

  changeDespacho(event:any) {
      this.nombreDespacho = event.originalEvent.srcElement.innerText
  }

  changeOrigen(event:any) {
      this.nombreOrigen = event.originalEvent.srcElement.innerText
  }

  DateToNumber(fecha: String) {
      let arrayFecha: any = fecha.split("/");
      return (arrayFecha[0] * 1) + (arrayFecha[1] * 1) * 30 + (arrayFecha[2] * 1) * 360;
  }


  obtenerCasosResueltosGrilla(): void {
    if (this.formReseteado) {
          this.casoResueltosFiltrados = this.casoResuelto;
          this.formReseteado = false;
          return
      }

      const criterioBusqueda = this.formularioFiltrarCasos.get('buscar')!.value
      this.casoResueltosFiltrados = [];
      let casosSeleccionados: any = []

      this.casoResueltosFiltrados = this.casoResuelto.filter(item =>
          Object.values(item).some(
              (fieldValue: any) =>
                  (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                  fieldValue?.toString()?.toLowerCase().includes(criterioBusqueda?.toLowerCase())
          )
      );

      const criterioBusqueda2 = this.formularioFiltrarCasos.get('remitente')!.value
      this.casoResueltosFiltrados = this.casoResuelto.filter(item =>
          Object.values(item).some(
              (fieldValue: any) =>
                  (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                  fieldValue?.toString()?.toLowerCase().includes(criterioBusqueda2?.toLowerCase())
          )
      );
      /*         console.log(this.nombrePlazo);

      if (this.nombrePlazo !== '*' && (typeof this.nombrePlazo !== "undefined")) {
          this.casoResueltosFiltrados = casosSeleccionados
          this.casoResueltosFiltrados = this.casoResuelto.filter(item =>
              Object.values(item).some(
                  (fieldValue: any) =>
                      (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                      fieldValue?.toString()?.toLowerCase().includes(this.nombrePlazo?.toLowerCase())
              )
          );
      } */

      if (this.nombreFiscalia !== '*' && (typeof this.nombreFiscalia !== "undefined")) {
          this.casoResueltosFiltrados = casosSeleccionados
          this.casoResueltosFiltrados = this.casoResuelto.filter(item =>
              Object.values(item).some(
                  (fieldValue: any) =>
                      (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                      fieldValue?.toString()?.toLowerCase().includes(this.nombreFiscalia?.toLowerCase())
              )
          );
      }

      if (this.nombreOrigen !== '*' && (typeof this.nombreOrigen !== "undefined")) {
          this.casoResueltosFiltrados = casosSeleccionados
          this.casoResueltosFiltrados = this.casoResuelto.filter(item =>
              Object.values(item).some(
                  (fieldValue: any) =>
                      (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                      fieldValue?.toString()?.toLowerCase().includes(this.nombreOrigen?.toLowerCase())
              )
          );
      }
      if (this.nombreDespacho !== '*' && (typeof this.nombreDespacho !== "undefined")) {
          this.casoResueltosFiltrados = casosSeleccionados
          this.casoResueltosFiltrados = this.casoResuelto.filter(item =>
              Object.values(item).some(
                  (fieldValue: any) =>
                      (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                      fieldValue?.toString()?.toLowerCase().includes(this.nombreDespacho?.toLowerCase())
              )
          );
      }

      if (this.fechaOrigenSeleccionada !== '*' && this.fechaFinSeleccionada !== '*') {
          let fechaSeleccionadoNumerosOrigen = this.DateToNumber(this.fechaOrigenSeleccionada)
          let fechaSeleccionadoNumerosDestino = this.DateToNumber(this.fechaFinSeleccionada)
          this.casoResueltosFiltrados.forEach(caso => {
              if ((this.DateToNumber(caso.fechaElevacion!)) >= fechaSeleccionadoNumerosOrigen &&
                  (this.DateToNumber(caso.fechaElevacion!)) <= fechaSeleccionadoNumerosDestino) {
                  casosSeleccionados.push(caso)
              }
          })
          this.casoResueltosFiltrados = casosSeleccionados
      }

      if (this.fechaOrigenSeleccionada !== '*' && (this.fechaFinSeleccionada == "*")) {
          let fechaSeleccionadoNumerosOrigen = this.DateToNumber(this.fechaOrigenSeleccionada)
          this.casoResueltosFiltrados.forEach(caso => {
              if ((this.DateToNumber(caso.fechaElevacion!)) >= fechaSeleccionadoNumerosOrigen) {
                  casosSeleccionados.push(caso)
              }
          })
          this.casoResueltosFiltrados = casosSeleccionados
      }

      if (this.fechaOrigenSeleccionada == '*' && (this.fechaFinSeleccionada != "*")) {
          let fechaSeleccionadoNumerosDestino = this.DateToNumber(this.fechaFinSeleccionada)
          this.casoResueltosFiltrados.forEach(caso => {
              if ((this.DateToNumber(caso.fechaElevacion!)) <= fechaSeleccionadoNumerosDestino) {
                  casosSeleccionados.push(caso)
              }
          })
          this.casoResueltosFiltrados = casosSeleccionados
      }
      this.formReseteado = false;

  }
  private timeout?: number;

  onInput(value: string): void {
      window.clearTimeout(this.timeout);

      this.timeout = window.setTimeout(() => {
          this.obtenerCasosResueltosGrilla();
      }, 700);
  }

  onInputRemitente(value: string): void {
      window.clearTimeout(this.timeout);

      this.timeout = window.setTimeout(() => {
          this.obtenerCasosResueltosGrilla();
      }, 700);
  }

  private obtenerCasosResueltos(): void {

      const form = this.formularioFiltrarCasos.getRawValue()

      const request: BuscarCasosResueltosRequest = {
          fechaDesde: form.fechaDesde ? this.datePipe.transform(form.fechaDesde, 'dd/MM/yyyy') : null,
          fechaHasta: form.fechaHasta ? this.datePipe.transform(form.fechaHasta, 'dd/MM/yyyy') : null,
          tipoElevacion:form.tipoElevacion,
          tipoFiscalia: form.tipoFiscalia,
          tipoDespacho: form.tipoDespacho,
          tipoResultado: form.tipoResultado,
          tipoFiscalDespacho : form.tipoFiscalDespacho
      }

      const payload = cleanEmptyFields(request)

      this.spinner.show()

      this.subscriptions.push(
          this.casosResueltosService.listarCasosResueltosSuperior( payload ).subscribe({
              next: resp => {
                  this.spinner.hide()
                  //if (resp.code === 1) {
                      this.casoResuelto = resp.map( (caso:any)  => ({ ...caso, seleccionado: false }))
                      console.log("casoResuelto: " + this.casoResuelto);
                      this.casoResueltosFiltrados = [...this.casoResuelto]
                      this.casosSeleccionados = []
                      const criterioBusqueda = this.formularioFiltrarCasos.get('buscar')!.value
                      criterioBusqueda && this.filtrarCasos( criterioBusqueda )
                  //}
              },
              error: error => {
                  this.spinner.hide()
                  console.error( error )
              }
          })
      )
  }

  public eventoMostrarOcultarFiltros(): void {
      this.mostrarFiltros = !this.mostrarFiltros
      //this.mostrarFiltros && this.formularioFiltrarCasos.get('tiempoAFiltrar').setValue('ultimosMeses')
  }

  public filtrarCasos( value: string ): void {
      this.casoResueltosFiltrados = this.casoResuelto.filter(item =>
          Object.values(item).some(
              (fieldValue: any) =>
              (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
              fieldValue?.toString()?.toLowerCase().includes(value?.toLowerCase())
          )
      );
      this.casosSeleccionados = []
  }

  public limpiarFiltros(): void {
      this.fechaOrigenSeleccionada = '*';
      this.fechaFinSeleccionada = '*';
      this.formReseteado = true
      this.formularioFiltrarCasos.reset()
      this.obtenerCasosResueltos()
  }

  ref!: DynamicDialogRef;
  public exportarPdfExcel(exportType: TipoArchivoType): void {
      if (this.casoResueltosFiltrados.length > 0) {

          const headers = ['Número de caso','Despacho de procedencia','Fiscal Asignado','Etapa / Tipo de apelación','Acto procesal','Resolución / Fecha de notificación','Fecha de devolución F. Provincial']
          const data:any[] = [];

          this.casoResueltosFiltrados.forEach( ( caso: CasoResuelto ) => {
              const row = {
                  'Número de caso': caso.numeroCaso,
                  'Despacho de procedencia': caso.despacho + " Entidad : " +caso.entidad,
                  'Fiscal Asignado': caso.fiscalAsignado,
                  'Etapa / Tipo de apelación': caso.etapa,
                  'Acto procesal': caso.actoProcesal,
                  'Resolución / Fecha de notificación': caso.resolucion,
                  'Fecha de devolución F. Provincial': caso.fechaDevolucion
              }
              data.push(row)
          })

          exportType === 'PDF'
              ?   this.exportarService.exportarAPdf(data, headers, 'Casos resueltos')
              :   this.exportarService.exportarAExcel(data, headers, 'Casos resueltos')
          return;
      }

      this.messageService.add({ severity: 'warn', detail: `No se encontraron registros para ser exportados a ${ exportType }` })

  }

  public obtenerNumeroCaso( numeroCaso: string, plazo: string ): SafeHtml {
      const caso = numeroCaso.split('-')
      const casoHtml = `<div class="cfe-caso">${ caso[0] }-<span>${ caso[1] }-${ caso[2] }</span>-${ caso[3] }</div>`
      return this.sanitizer.bypassSecurityTrustHtml(casoHtml);
  }
}
