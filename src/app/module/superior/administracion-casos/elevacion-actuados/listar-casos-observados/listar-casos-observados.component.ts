import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup,FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ExportarService } from "@services/shared/exportar.service";
import { TipoArchivoType } from "@core/types/exportar.type";
import { DateMaskModule } from "@directives/date-mask.module";
import { DateFormatPipe } from "@pipes/format-date.pipe";
import { cleanEmptyFields } from "@utils/utils";
import { MenuItem, MessageService } from "primeng/api";
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { MenuModule } from "primeng/menu";
import { MessagesModule } from "primeng/messages";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { obtenerIcono } from "@utils/icon";
import { DelitosYPartesModalComponent } from "@components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component";
import { MaestroService } from "@services/shared/maestro.service";
import { BuscarCasosElevacionActuadosRequest } from "@interfaces/provincial/tramites/elevacion-actuados/BuscarCasosElevacionActuadosRequest";
import { ElevacionActuadosService } from "@services/superior/elevacion-actuados/elevacion-actuados.service";
import { CasoElevacionActuado } from "@interfaces/provincial/tramites/elevacion-actuados/CasoElevacionActuado";
import { AlertaModalComponent } from "@components/modals/alerta-modal/alerta-modal.component";
import { AlertaData } from "@interfaces/comunes/alert";
import { PrevisualizarDocumentoModalComponent } from "@components/modals/previsualizar-documento-modal/previsualizar-documento-modal.component";
import { AsignarCasoRequest, CasoLeidoRequest } from "@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest";
import { AsuntoObservacionesComponent } from "@components/modals/asunto-observaciones/asunto-observaciones.component";
import { DescripcionModalComponent } from "@components/modals/descripcion-modal/descripcion-modal.component";
import { AsignacionTransaccionalService } from "@services/provincial/asignacion/asignacion-transaccional.service";
import { VisorEfeModalComponent } from "@components/modals/visor-efe-modal/visor-efe-modal.component";
import { VerObservacionCasoElevadoModalComponent } from "@components/modals/ver-observacion-caso-elevado-modal.component";
import { VisorEfeService } from "@services/visor/visor.service";
import { ElevacionActuadoObservadosService } from "@core/services/superior/elevacion-actuados/elevacion-actuado-observados.service";

@Component({
  selector: 'app-listar-casos-anulados',
  standalone: true,
  imports: [
    CalendarModule,
    CheckboxModule,
    CmpLibModule,
    CommonModule,
    DateFormatPipe,
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
  templateUrl: './listar-casos-observados.component.html',
  styleUrls: ['./listar-casos-observados.component.scss'],
  providers: [ MessageService, DialogService, DatePipe ],
})
export class ListarCasosObservadosComponent implements OnInit {

  public fiscalesPorAsignar:any[] = [];
    public fiscalias:any[] = [];
    public despachos:any[] = [];
    public origen:any[] = [];
    public leyenda:any[] = [];
    public casoElevacionActuado: CasoElevacionActuado[] = [];
    public casoElevacionActuadoFiltrados: CasoElevacionActuado[] = [];
    public casosSeleccionados: CasoElevacionActuado[] = [];
    public mostrarFiltros = false;

    public formularioFiltrarCasos!: FormGroup;
    public fiscalPorAsignar = new FormControl( null );

    public referenciaModal!: DynamicDialogRef;
    public subscriptions: Subscription[] = [];
    public nombreFiscal!: String;
    public nombreFiscalia!: String;

    public nombreOrigen: any = '*';
    public nombreDespacho: any = '*';
    public nombrePlazo: any = '*';
    public nombreRemitente: any = '*';
    public fechaOrigenSeleccionada: any = '*';
    public fechaFinSeleccionada: any = '*';
    public formReseteado: boolean = false;
    leido: any = 1;

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
        private elevacionActuadosService: ElevacionActuadosService,
        private asignacionTransaccionalService: AsignacionTransaccionalService,
        private dataService: VisorEfeService,
        public maestroService: MaestroService,
        private elevadosActuadosObservadosService: ElevacionActuadoObservadosService
    ){}

    ngOnInit(): void {

        this.formBuild()
        //this.obtenerPlazos()
        this.obtenerOrigen()
        this.getDependenciaFiscal()
       // this.obtenerFiscales()
       this.obtenerCasosObservados();
    //this.obtenerCasosElevacionActuados()
    this.opcionesMenu = (data: any) => [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          // console.log("data: ", data);
          // //data.id = "0FB5FD1CF763B38CE0650250569D508A"
          // this.dataService.getData(data.id).subscribe(response => {
          //   console.log("response1: ", response);
          //   if(response.data==null){
          //     this.mensajeInfo(""/*data.idCaso*/, "No se encontraron resultados");
          //   }else{
          //     this.mostrarVisorDocumental(data.id, data.numeroCaso);
          //     this.registarCasoLeido(data.id, data.leido);
          //   }
          // },
          // error => {
          //   this.mensajeInfo(""/*data.idCaso*/, "Identificador de caso nulo");
          // },
          // )
        }
      },
      {
        label: 'Ver historial de caso',
        icon: 'file-search-icon',
        command: () => {
          //this.mostrarAsuntoObservaciones(data.id, data.numeroCaso)
          //this.registarCasoLeido(data.id, data.leido)
        }
      },
      {
        label: 'Ver observaciones',
        icon: 'trash-icon',
        command: () => {
          this.verObservacion(data,data.codigoCaso, data.idBandejaElevacion, data.idCaso)
        }
      },
    ];
    // this.verDelitosPartes("506014501-2021-590-0")
  }

    private formBuild(): void {

        this.formularioFiltrarCasos = this.formulario.group({
            buscar: [ '' ],
            fiscalia: [null],
            despacho: [null],
            remitente:[null],
            //tiempoAFiltrar: [ 'ultimosMeses' ],
            fechaDesde: [ null ],
            fechaHasta: [ null ],
            //plazo: [ null ],
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
        this.subscriptions.push(
          this.elevacionActuadosService.getFiscalias().subscribe({
              next: resp => {
                this.fiscalias = resp
              },
              error: ( error ) => {
                this.fiscalias = []
            }})
          )
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
                error: ( error ) => {
                  this.despachos = []
              }})
            )
        }
      }

    private obtenerPlazos(): void {
        this.subscriptions.push(
            this.maestrosService.getTipoPlazo().subscribe({

                next: resp => {

                    this.despachos = resp.data
                }


            })
        )
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

    private obtenerLeyenda(casoElevacionActuadoFiltrados:any): void {
        var nroCasosDentroPlazo = 0;
        var nroCasosPorVencer = 0;
        var nroCasosFueraplazo = 0;

        casoElevacionActuadoFiltrados.forEach( (caso:any) => {
            if ((caso.semaforoNro == "1")) {
                nroCasosDentroPlazo += 1;
            } else if ((caso.semaforoNro == "2")) {
                nroCasosPorVencer += 1;
            } else if ((caso.semaforoNro == "3")) {
                nroCasosFueraplazo += 1;
            }
            })

        let respuesta = [];
        let leyenda = { "nombrePlazo": "Dentro del plazo", "cantidad": nroCasosDentroPlazo };
        respuesta.push(leyenda);
        leyenda = { "nombrePlazo": "Plazo por vencer", "cantidad": nroCasosPorVencer };
        respuesta.push(leyenda);
        leyenda = { "nombrePlazo": "Plazo vencido", "cantidad": nroCasosFueraplazo };
        respuesta.push(leyenda);
        this.leyenda = respuesta;
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

    changePlazos(event:any) {
        this.nombrePlazo = event.originalEvent.srcElement.innerText
    }

    DateToNumber(fecha: String) {
        let arrayFecha: any = fecha.split("/");
        return (arrayFecha[0] * 1) + (arrayFecha[1] * 1) * 30 + (arrayFecha[2] * 1) * 360;
    }


    obtenerCasosElevacionActuadosGrilla(): void {
        if (this.formReseteado === true) {
            this.casoElevacionActuadoFiltrados = this.casoElevacionActuado;
            this.formReseteado = false;
            return
        }

        const criterioBusqueda = this.formularioFiltrarCasos.get('buscar')!.value
        this.casoElevacionActuadoFiltrados = [];
        let casosSeleccionados: any = []

        this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
            Object.values(item).some(
                (fieldValue: any) =>
                    (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                    fieldValue?.toString()?.toLowerCase().includes(criterioBusqueda?.toLowerCase())
            )
        );

        const criterioBusqueda2 = this.formularioFiltrarCasos.get('remitente')!.value
        this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
            Object.values(item).some(
                (fieldValue: any) =>
                    (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                    fieldValue?.toString()?.toLowerCase().includes(criterioBusqueda2?.toLowerCase())
            )
        );
        /*         console.log(this.nombrePlazo);

        if (this.nombrePlazo !== '*' && (typeof this.nombrePlazo !== "undefined")) {
            this.casoElevacionActuadoFiltrados = casosSeleccionados
            this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
                Object.values(item).some(
                    (fieldValue: any) =>
                        (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                        fieldValue?.toString()?.toLowerCase().includes(this.nombrePlazo?.toLowerCase())
                )
            );
        } */

        if (this.nombreFiscalia !== '*' && (typeof this.nombreFiscalia !== "undefined")) {
            this.casoElevacionActuadoFiltrados = casosSeleccionados
            this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
                Object.values(item).some(
                    (fieldValue: any) =>
                        (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                        fieldValue?.toString()?.toLowerCase().includes(this.nombreFiscalia?.toLowerCase())
                )
            );
        }

        if (this.nombreOrigen !== '*' && (typeof this.nombreOrigen !== "undefined")) {
            this.casoElevacionActuadoFiltrados = casosSeleccionados
            this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
                Object.values(item).some(
                    (fieldValue: any) =>
                        (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
                        fieldValue?.toString()?.toLowerCase().includes(this.nombreOrigen?.toLowerCase())
                )
            );
        }
        if (this.nombreDespacho !== '*' && (typeof this.nombreDespacho !== "undefined")) {
            this.casoElevacionActuadoFiltrados = casosSeleccionados
            this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
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
            this.casoElevacionActuadoFiltrados.forEach(caso => {
                if ((this.DateToNumber(caso.fechaElevacion)) >= fechaSeleccionadoNumerosOrigen &&
                    (this.DateToNumber(caso.fechaElevacion)) <= fechaSeleccionadoNumerosDestino) {
                    casosSeleccionados.push(caso)
                }
            })
            this.casoElevacionActuadoFiltrados = casosSeleccionados
        }

        if (this.fechaOrigenSeleccionada !== '*' && (this.fechaFinSeleccionada == "*")) {
            let fechaSeleccionadoNumerosOrigen = this.DateToNumber(this.fechaOrigenSeleccionada)
            this.casoElevacionActuadoFiltrados.forEach(caso => {
                if ((this.DateToNumber(caso.fechaElevacion)) >= fechaSeleccionadoNumerosOrigen) {
                    casosSeleccionados.push(caso)
                }
            })
            this.casoElevacionActuadoFiltrados = casosSeleccionados
        }

        if (this.fechaOrigenSeleccionada == '*' && (this.fechaFinSeleccionada != "*")) {
            let fechaSeleccionadoNumerosDestino = this.DateToNumber(this.fechaFinSeleccionada)
            this.casoElevacionActuadoFiltrados.forEach(caso => {
                if ((this.DateToNumber(caso.fechaElevacion)) <= fechaSeleccionadoNumerosDestino) {
                    casosSeleccionados.push(caso)
                }
            })
            this.casoElevacionActuadoFiltrados = casosSeleccionados
        }
        this.obtenerLeyenda(this.casoElevacionActuadoFiltrados)
        this.formReseteado = false;

    }
    private timeout?: number;

    onInput(value: string): void {
        window.clearTimeout(this.timeout);

        this.timeout = window.setTimeout(() => {
            this.obtenerCasosElevacionActuadosGrilla();
        }, 700);
    }

    onInputRemitente(value: string): void {
        window.clearTimeout(this.timeout);

        this.timeout = window.setTimeout(() => {
            this.obtenerCasosElevacionActuadosGrilla();
        }, 700);
    }

    private obtenerCasosElevacionActuados(): void {

        const form = this.formularioFiltrarCasos.getRawValue()

        const request: BuscarCasosElevacionActuadosRequest = {
            fechaDesde: form.fechaDesde ? this.datePipe.transform(form.fechaDesde, 'dd/MM/yyyy') : null,
            fechaHasta: form.fechaHasta ? this.datePipe.transform(form.fechaHasta, 'dd/MM/yyyy') : null,
            fiscalia: form.fiscalia,
            despacho: form.despacho,
            remitente: form.remitente,
            origen: form.origen,
        }

        const payload = cleanEmptyFields(request)

        this.spinner.show()

        this.subscriptions.push(
            this.elevacionActuadosService.elevacionActuadosList( payload ).subscribe({
                next: resp => {
                    this.spinner.hide()
                    //if (resp.code === 1) {
                        this.casoElevacionActuado = resp.map( (caso:any)  => ({ ...caso, seleccionado: false })).filter( (x:any)=>x.respuesta=='O');
                        this.casoElevacionActuadoFiltrados = [...this.casoElevacionActuado];
                        //this.casoElevacionActuadoFiltrados = this.casoElevacionActuadoFiltrados.filter(x=>x.respuesta=='O');
                        console.log("filtro",this.casoElevacionActuadoFiltrados);
                        this.casosSeleccionados = []
                        const criterioBusqueda = this.formularioFiltrarCasos.get('buscar')!.value
                        criterioBusqueda && this.filtrarCasos( criterioBusqueda )
                    //}
                    this.obtenerLeyenda(this.casoElevacionActuadoFiltrados)
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
        this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
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
        this.obtenerCasosElevacionActuados()
    }


    public verDelitosPartes(numeroCaso: string, idCaso: string, leido: string): void {
        this.registarCasoLeido(idCaso, leido);
        const verDelitosPartesRef = this.dialogService.open( DelitosYPartesModalComponent, {
            showHeader: false,
            data: {
                numeroCaso,
            }
        })
        verDelitosPartesRef.onClose.subscribe({
            next: () => this.obtenerCasosElevacionActuados(),
            error: error => console.error( error )
        })
    }

    public clasificacionCaso(numeroCaso: string, idCaso: string, leido: string, clasificacion: string): void {
      this.registarCasoLeido(idCaso, leido);
      this.referenciaModal = this.dialogService.open(DescripcionModalComponent, {
        showHeader: false,
        data: {
          tipo: 'clasificacion',
          idCaso: idCaso,
          caso: numeroCaso,
          titulo: 'Clasificación de caso (Opcional)',
          descripcion: 'Ingrese la clasificación del caso',
          contenido: clasificacion,
        }
      });

      this.referenciaModal.onClose.subscribe({
        next: () => this.obtenerCasosElevacionActuados(),
        error: error => console.error(error)
      })
    }

    private anularCaso( idCaso:string , numeroCaso: string ): void {
       const anularCasoRef = this.dialogService.open( DescripcionModalComponent, {
            showHeader: false,
            data: {
                caso: numeroCaso,
                idCaso: idCaso,
                titulo: 'Motivo de anulación del caso',
                descripcion: 'Ingrese motivo de anulación',
            }
        })
        anularCasoRef.onClose.subscribe({
            next: () => this.obtenerCasosElevacionActuados(),
            error: error => console.error( error )
        })
    }

  private mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      //   contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {
        caso: idCaso,
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Visor documental del caso:',
        description: 'Hechos del caso',
      }
    })
  }

    private mostrarAsuntoObservaciones(idCaso:string , numeroCaso : string):void{
        this.referenciaModal = this.dialogService.open( AsuntoObservacionesComponent, {
            showHeader: false,
         //   contentStyle: { 'padding':'0', 'border-radius': '15px' },
            data: {
              numeroCaso: numeroCaso,
              idCaso:idCaso,
              title: 'Asunto Observaciones',
              description: 'Hechos del caso',
            }
          })

    }

    private verObservacion(observacion:any, numeroCaso : any,idBandejaElevacion : any, idCaso : any):void{
      this.referenciaModal = this.dialogService.open( VerObservacionCasoElevadoModalComponent, {
          showHeader: false,
       //   contentStyle: { 'padding':'0', 'border-radius': '15px' },
          data: {
            numeroCaso: numeroCaso,
            observacion:observacion,
            idBandejaElevacion : idBandejaElevacion,
            idCaso :idCaso,
            title: 'Ver Observación',
          }
        })

    }



    eventChangeFiscal(event:any) {
        this.nombreFiscal = event.originalEvent.srcElement.innerText;
    }



    private asignarCaso( request: AsignarCasoRequest, nombreFiscal: string, casos: string ): void {

        // this.subscriptions.push(
            this.asignacionTransaccionalService.asignarCaso( request ).subscribe({
                next: resp => {
                    console.log("respuestas")
                    console.log(resp);

                    this.spinner.hide()
                    if (resp.code === 1) {
                        this.limpiarFiltros()
                       // this.obtenerFiscales();
                        const sText = request.casos.length === 1 ? '' : 's'
                        const asignacionText = request.casos.length === 1 ? 'asignó el' : 'asignaron los'
                        this.referenciaModal = this.dialogService.open( AlertaModalComponent, {
                            width: '600px',
                            showHeader: false,
                            data: {
                                icon: 'success',
                                title: `Caso${ sText } asignado${ sText } correctamente`,
                                description: `Se ${ asignacionText } caso${ sText } <span class='bold'>${ casos }</span> al fiscal <span class='bold'>"${ nombreFiscal }"</span>.`,
                                confirmButtonText: 'OK',
                            }
                        } as DynamicDialogConfig<AlertaData>)
                    }
                },
                error: ( error ) => {
                    console.log(error)

                    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
                        width: '600px',
                        showHeader: false,
                        data: {
                            icon: 'error',
                            title: `Error al intentar realizar la asignación`,
                            description: `${error.error.message}`,
                            confirmButtonText: 'OK',
                        }
                    } as DynamicDialogConfig<AlertaData>)


                    this.spinner.hide()
                    this.messageService.add({ severity: 'error', detail: `Ha ocurrido un error inesperado` })

                }
            })
        // )

    }



    private registarCasoLeido(idCaso: String, leido: string): void {
        if (leido == "1") {
            return;
        }
        let request: CasoLeidoRequest = {
            numeroCaso: idCaso,
            idEstadoCaso: 1, //1 por asignar
        }
        this.asignacionTransaccionalService.registrarCasoLeido(request).subscribe({
            next: resp => {
                this.spinner.hide()
                if (resp.code === 0) {
                    this.obtenerCasosElevacionActuados()
                }
            },
            error: (error) => {
                console.log("error registrar caso leido")
                console.log(error)
            }
        })
    }
    ref!: DynamicDialogRef;
    public exportarPdfExcel(exportType: TipoArchivoType): void {


        this.ref = this.referenciaModal = this.dialogService.open(PrevisualizarDocumentoModalComponent, {
            showHeader: false,
            data: { idDocumentoEscrito: '0F19278C0D40CF1BE0650250569D508A' }
        });
        this.ref.onClose.subscribe((respuesta) => {

        });


     /*   if (this.casosPorAsignar.length > 0) {

            const headers = ['Número de caso','Origen','Tipo Remitente','Remitente','Teléfono Remitente','Correo Remitente','Fecha Ingreso','Hora Ingreso']
            const data = []

            this.casosPorAsignar.forEach( ( caso: CasoPorAsignar ) => {
                const row = {
                    'Número de caso': caso.numeroCaso,
                    'Origen': caso.origen,
                    'Tipo Remitente': caso.tipoRemitente,
                    'Remitente': caso.remitente,
                    'Teléfono Remitente': caso.telefono,
                    'Correo Remitente': caso.correo,
                    'Fecha Ingreso': caso.fechaIngreso,
                    'Hora Ingreso': caso.horaIngreso,
                }
                data.push(row)
            })

            exportType === 'PDF'
                ?   this.exportarService.exportarAPdf(data, headers, 'Casos por asignar')
                :   this.exportarService.exportarAExcel(data, headers, 'Casos por asignar')
            return;
        }

        this.messageService.add({ severity: 'warn', detail: `No se encontraron registros para ser exportados a ${ exportType }` })
*/

    }

    public obtenerClaseDeOrigen( name: string ): string {
        let semaforo = 'dentro-del-plazo';
        if (name == "2") {
            semaforo = 'plazo-por-vencer';
        } else if (name == "3") {
            semaforo = 'plazo-vencido';
        }
        return semaforo;
    }

    public obtenerClaseDeOrigen2(name: string): string {
        return name.replaceAll(' ','-').toLowerCase()
    }

    public obtenerNumeroCaso( numeroCaso: string, plazo: string ): SafeHtml {
        const caso = numeroCaso.split('-')
        const plazoHtml = `<span class="plazo-item ${ this.obtenerClaseDeOrigen(plazo) }"></span>`
        const casoHtml = `<div class="cfe-caso">${ caso[0] }-<span>${ caso[1] }-${ caso[2] }</span>-${ caso[3] }</div>`
        return this.sanitizer.bypassSecurityTrustHtml(plazoHtml + casoHtml);
    }

      mensajeInfo(mensaje:any, submensaje:any) {
        this.dialogService.open(AlertaModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'info',
            title: mensaje,
            description: submensaje,
            confirmButtonText: 'OK',
          }
        } as DynamicDialogConfig<AlertaData>)
      }

      exportarArchivoPDF() {
        const tableColumns = ['Número de caso', 'Origen', 'Remitente', 'Teléfono remitente','Correo remitente','Fecha ingreso', 'Hora ingreso', 'Fecha anulación', 'Hora anulación'];
        //this.archivoExportService.generatePDF(this.casosAnulados, tableColumns, 'casos-anulados', 'landscape');
      }

      generateExcel() {
        const tableColumns = ['Número de caso', 'Origen', 'Remitente', 'Teléfono remitente','Correo remitente','Fecha ingreso', 'Hora ingreso', 'Fecha anulación', 'Hora anulación'];
        //this.archivoExportService.generateExcel(this.casosAnulados, tableColumns, 'casos-anulados');
      }
obtenerCasosObservados() {
    const form = this.formularioFiltrarCasos.getRawValue()

    const request: BuscarCasosElevacionActuadosRequest = {
        fechaDesde: form.fechaDesde ? this.datePipe.transform(form.fechaDesde, 'dd/MM/yyyy') : null,
        fechaHasta: form.fechaHasta ? this.datePipe.transform(form.fechaHasta, 'dd/MM/yyyy') : null,
        fiscalia: form.fiscalia,
        despacho: form.despacho,
        remitente: form.remitente,
        origen: form.origen,
    }

    const payload = cleanEmptyFields(request)
    this.subscriptions.push(
        this.elevadosActuadosObservadosService.obtenerCasosObservados(payload).subscribe({
            next: resp => {
                this.casoElevacionActuado = resp.map( (caso:any)  => ({ ...caso, seleccionado: false }))
                this.casoElevacionActuadoFiltrados = [...this.casoElevacionActuado]
            },
            error: error => {
                console.error( error )
            }
        })
    )
}
}
