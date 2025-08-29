// import { JsonPipe, NgClass, NgStyle } from '@angular/common';
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
// import { EtiquetaClasesCss, PlazosLeyendaClasesCss, TipoElevacionId } from '@core/constants/superior';
// import { ElevacionActuadosService } from '@core/services/superior/elevacion-actuados/elevacion-actuados.service';
// import { NgxCfngCoreModalDialogService, NgxCfngCoreModalDialogModule } from '@ngx-cfng-core-modal/dialog';
// import { DateFormatPipe, MathUtil, obtenerCasoHtml, StringUtil } from 'ngx-cfng-core-lib';
// import { MenuItem } from 'primeng/api';
// import { CheckboxModule } from 'primeng/checkbox';
// import { MenuModule } from 'primeng/menu';
// import { ProgressBarModule } from 'primeng/progressbar';
// import { TableModule, TableService } from 'primeng/table';

// @Component({
//   selector: 'app-tabla',
//   standalone: true,
//   imports: [
//     TableModule,
//     NgClass,
//     DateFormatPipe,
//     ProgressBarModule,
//     MenuModule,
//     PaginatorComponent,
//     CheckboxModule,
//     FormsModule,
//     NgStyle,
//     NgxCfngCoreModalDialogModule
//   ],
//   templateUrl: './tabla.component.html',
//   styleUrl: './tabla.component.scss',
//   providers: [ TableService ]
// })
// export class TablaComponent {

//   @Input()
//   public listaCasos: any[] = [];

//   @Input()
//   public paginacionCondicion:any;

//   @Input()
//   public paginacionConfiguracion:any;

//   @Input()
//   public esCriterioBusquedaValido:boolean = false;

//   @Output()
//   public cambiarPagina = new EventEmitter<any>();

//   protected plazosLeyendaClasesCss = PlazosLeyendaClasesCss;
//   protected etiquetaClasesCss: { [key: string]: string } = EtiquetaClasesCss;
//   protected seleccionarTodosCasos:boolean = false;
//   protected obtenerCasoHtml = obtenerCasoHtml;
//   private casoSeleccionadoParaOpciones:any;
//   protected TipoElevacionId = TipoElevacionId;
//   protected opcionesCaso:MenuItem[] =  [
//     {
//       label: 'Visor documental', command: () => this.eventoVisorDocumental()
//     },
//     {
//       label: 'Ver historial de caso', command: () => this.eventoHistorialCaso()
//     },
//     {
//       label: 'Ver delitos y partes', command: () => this.eventoDelitosPartes()
//     }
//   ];

//   constructor(
//     protected readonly stringUtil: StringUtil,
//     protected readonly mathUtil: MathUtil,
//     private readonly elevacionActuadosService: ElevacionActuadosService,
//     private readonly modalDialogService: NgxCfngCoreModalDialogService
//   ) { }

//   protected eventoMostrarOpcionesCaso(event: Event, menu: any, caso:any){
//     this.casoSeleccionadoParaOpciones = caso;
//     event.stopPropagation();
//     menu.toggle(event);
//   }

//   protected eventoCambiarPagina(datos:any){
//     this.seleccionarTodosCasos = false;
//     this.cambiarPagina.emit(datos);
//     //Verificar si se seleccionaron todos los casos
//     setTimeout(() => {
//       this.seleccionarTodosCasos = !this.listaCasos.some(caso => caso.seleccionado === false);
//     }, 100);
//   }

//   private eventoVisorDocumental(){
//     console.log('Visor documental');
//   }

//   private eventoHistorialCaso(){
//     console.log('Historial de caso');
//   }

//   private eventoDelitosPartes(){
//     console.log('Delitos y partes');
//   }

//   protected eventoSeleccionarCaso(e:any, caso:any){
//     caso.seleccionado = e.checked;
//     if(e.checked===false){
//       this.seleccionarTodosCasos = false;
//     }
//   }
//   protected eventoSeleccionarTodosCasos(event: any){
//     this.listaCasos.forEach((caso:any) => {
//       caso.seleccionado = event.checked;
//     });
//   }
//   protected estiloTipoElevacion(cssText:string){
//     const cssColor = cssText.split('|');
//     return {
//       'background-color': `rgb(${cssColor[1]})`,
//       'color': `rgb(${cssColor[0]})`
//     };
//   }
//   public reiniciar(){
//     this.seleccionarTodosCasos = false;
//   }

//   protected eventoVerObservaciones(casoSeleccionado:any){
//     this.elevacionActuadosService.getInformacionDocumental(casoSeleccionado.idCaso, casoSeleccionado.idTipoElevacion, casoSeleccionado.idActoTramiteCaso).subscribe({
//       next: (response:any) => {
//         if (response.codigoCaso == null) {
//           this.modalDialogService.warning("", "No se encontraron datos del caso.");
//         } else {
//           this.mostrarVisorDocumental(response, casoSeleccionado);
//         }
//       },
//       error: (error) => {
//         this.modalDialogService.error(this.casoSeleccionado.codigoCaso, "Hubo un problema al intentar mostrar datos del caso.");
//       },
//     });
//   }

//   private mostrarVisorDocumental(informacion: any, caso: any): void {
//     this.referenciaModal = this.dialogService.open(PrevisualizarDocumentoModalComponent, {
//       width: '95%',
//       showHeader: false,
//       contentStyle: { 'padding':'0', 'border-radius': '15px' },
//       data: {
//         informacion: informacion,
//         caso: caso,
//         tipo: TipoVisor.VerObservacion,
//         observacion:{
//           descripcion: caso.observacion,
//           fecha: caso.fechaObservacion,
//           hora: caso.horaObservacion
//         }
//       }
//     });
//   }

// }
