import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren, ViewContainerRef
} from '@angular/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DatosArchivo, DatosArchivoSeleccionado, Etapas } from '@interfaces/visor/visor-interface';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import {
  ClasificadorDocumentoEnum,
  EtapasArchivoEnum
} from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import {
  ItemArchivoComponent
} from '@components/modals/visor-efe-modal/carpeta-principal/item-archivo/item-archivo.component';
import { obtenerIcono } from '@utils/icon';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { IconAsset } from 'ngx-cfng-core-lib';
import { ClasificadorExpedienteEnum } from '@core/constants/constants';
import { VisorEfeService } from '@services/visor/visor.service';
import { VisorStateService } from '@services/visor/visor.state.service';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import {
  TipoArchivo,
  VisorArchivoComponent
} from '@components/modals/visor-efe-modal/visor-archivo/visor-archivo/visor-archivo.component';
import { VisorUtilService } from '@services/visor/visor-util.service';

@Component({
  selector: 'app-cuaderno-incidental',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    ReactiveFormsModule,
    CheckboxModule,
    CmpLibModule,
    SelectButtonModule,
    ItemArchivoComponent,
  ],
  templateUrl: './cuaderno-incidental.component.html',
  styleUrls: ['./cuaderno-incidental.component.scss'],
})
export class CuadernoIncidentalComponent implements OnChanges {

  @Input()
  public datoEtapaOriginal: Etapas[] = [];

  @ViewChildren('filaArchivoRef', { read: ElementRef })
  protected filaArchivoRef!: QueryList<ElementRef>;

  @ViewChild('visorArchivoContainer', { read: ViewContainerRef })
  protected visorArchivoContainerRef!: ViewContainerRef;

  @ViewChild('inputBuscarRef')
  protected inputBuscarRef!: ElementRef;

  protected readonly EtapasArchivoEnum = EtapasArchivoEnum;
  protected readonly obtenerIcono = obtenerIcono;

  protected tipoDocumentoFiltroSeleccionado: string = '0';
  protected encontrados: number = 0;
  protected datoArchivoActualIndex:number = 0;
  private busquedaTiempo: any = null;
  protected readonly TipoArchivo = TipoArchivo;
  protected visor:VisorArchivoComponent | null = null;
  protected visorTipoArchivo: TipoArchivo= TipoArchivo.Ninguno;
  protected datoEtapaFiltro: Etapas[] = [];
  protected datoArchivo:DatosArchivo[] = [];
  protected datoArchivoSeleccionado:DatosArchivo | null = null;
  protected datoArchivoSeleccionados:DatosArchivoSeleccionado[] = [];

  protected tipoDocumentoFiltro: any[] = [
    { name: 'Todos', value: '0' },
    { name: 'Disposiciones', value: '01' },
    { name: 'Requerimientos', value: '02' },
    { name: 'Genéricos', value: '00' },
  ];

  constructor(protected iconAsset: IconAsset,
              private readonly dataService: VisorEfeService,
              private readonly visorUtilService: VisorUtilService,
              private readonly visorStateService: VisorStateService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datoEtapaOriginal']) {
      this.datoEtapaFiltro = [...this.datoEtapaOriginal];
      this.seleccionarArchivoInicio();
    }
  }

  protected eventoBuscar(e: Event) {
    clearTimeout(this.busquedaTiempo); //Evitar búsquedas continuas
    const valor = (e.currentTarget as HTMLInputElement).value.toLowerCase();
    if (valor === '') {
      this.seleccionarArchivoInicio();
      return;
    }
    this.busquedaTiempo = setTimeout(() => {
      this.tipoDocumentoFiltroSeleccionado = '0';
      this.buscarXTexto(valor);
    }, 500);
  }

  private seleccionarArchivoInicio(){
    this.datoArchivo = this.visorUtilService.soloCuadernos(this.datoEtapaFiltro);
    if(this.datoArchivo.length > 0){
      this.seleccionarArchivo( this.datoArchivo[0], false);
    }else{
      this.consultarArchivo( undefined , true);
    }
    //
    // Contar resultados
    this.encontrados = this.datoArchivo.length;
  }

  protected eventoSeleccionarArchivo(datosArchivo:DatosArchivo) {
    this.datoArchivoActualIndex = this.datoArchivo.findIndex( elm => elm.correlativo===datosArchivo.correlativo );
    this.seleccionarArchivo(datosArchivo);
  }
  protected colorFondoFilaArchivo( datosArchivo:DatosArchivo) {
    if(this.datoArchivoSeleccionado!==null && this.datoArchivoSeleccionado.correlativo === datosArchivo.correlativo){
      return '#F7EED4';
    }
    return '';
  }

  private seleccionarArchivo(doc:DatosArchivo, sinContenido: boolean = false) {
    this.datoArchivoSeleccionado = doc;
    this.visorStateService.archivoSeleccionado = doc;

    //#region - Validar para expandir la sección
    const etapa = this.datoEtapaFiltro.find( elm => elm.id === doc.idEtapa )!;
    etapa.mostrarContenido = true;

    if( doc.idClasificadorExpediente === ClasificadorExpedienteEnum.CuadernoIncidental &&
      etapa.cuadernoIncidental &&
      etapa.cuadernoIncidental.length > 0
    ){
      const cuadernoInci = etapa.cuadernoIncidental.find( elm => elm.idCaso === doc.idCaso )!;
      cuadernoInci.mostrarContenido = true;
      //
      if(doc.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion){
        const datoArchivo = cuadernoInci.datosArchivo.find(elm => elm.correlativo === doc.correlativoPadre)!;
        datoArchivo.mostrarContenido = true;
      }
    }else if(doc.idClasificadorExpediente === ClasificadorExpedienteEnum.Principal){
      if(doc.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion){
        const datoArchivo = etapa.datosArchivo.find(elm => elm.correlativo === doc.correlativoPadre)!;
        datoArchivo.mostrarContenido = true;
      }
    }
    //#endregion

    this.posicionarScrollbarListaArchivos(doc.correlativo);
    this.consultarArchivo(doc, sinContenido);
  }

  protected eventoDeseleccionarTodo() {
    this.visorUtilService.eventoDeseleccionarTodo(this.datoArchivoSeleccionados, this.datoEtapaFiltro);
  }

  protected descargarArchivosSeleccionados(): void {
    const codigos = this.visorUtilService.codigoArchjosSeleccionados(this.datoArchivoSeleccionados, this.datoArchivo);
    if(codigos!==''){
      this.visorUtilService.descargarArchivosZip( codigos );
    }
  }




  protected eventoSeleccionarArchivoSiguiente() {
    if (this.datoArchivoActualIndex < this.datoArchivo.length - 1) {
      this.datoArchivoActualIndex++;
    }else{
      this.datoArchivoActualIndex = 0;
    }
    this.seleccionarArchivo( this.datoArchivo[this.datoArchivoActualIndex] );
  }

  protected eventoSeleccionarArchivoAnterior() {
    if (this.datoArchivoActualIndex > 0) {
      this.datoArchivoActualIndex--;
    }else{
      this.datoArchivoActualIndex = this.datoArchivo.length - 1;
    }
    this.seleccionarArchivo(this.datoArchivo[this.datoArchivoActualIndex]);
  }

  protected eventoDescargarArchivo(datosArchivo:DatosArchivo) {
    this.dataService.getDescargarArchivo(this.visorUtilService.codigoArchivoEnviar(datosArchivo.idNode, datosArchivo.nombre)).subscribe({
      next:(rs:Blob)=>{
        this.visorUtilService.forzarDescarga(rs, datosArchivo.nombre);
      }
    });
  }

  protected eventoDescargarTodo():void {
    const codigos = this.visorUtilService.codigoArchjosSeleccionados(this.datoArchivoSeleccionados, this.datoArchivo);

    if(codigos!=='' && this.soloPdfSeleccionados()){
      this.dataService.getDescargarPdfTodo(codigos).subscribe({
        next:(rs)=>{
          this.visorUtilService.forzarDescarga(rs, 'todos.pdf');
        }
      });
    }
  }

  protected soloPdfSeleccionados():boolean{
    return this.visorUtilService.soloPdfSeleccionados(this.datoArchivoSeleccionados, this.datoArchivo)
  }

  private async consultarArchivo(datosArchivo:DatosArchivo | undefined, sinArchivo:boolean = false) {
    if(datosArchivo){
      this.visorTipoArchivo=datosArchivo.nombreTipoArchivo.toLowerCase() as TipoArchivo;
    }
    if(this.visor===null){
      const { VisorArchivoComponent } = await import('../visor-archivo/visor-archivo/visor-archivo.component');
      this.visor = this.visorArchivoContainerRef.createComponent(VisorArchivoComponent).instance;
    }
    if(!sinArchivo && datosArchivo){
      this.visor.inicializar(datosArchivo.nombreTipoArchivo.toLowerCase() as TipoArchivo, this.dataService.getArchivoUrl(datosArchivo.idNode, datosArchivo.nombre),datosArchivo.idNode,datosArchivo.nombre);
    }else{
      this.visor.inicializar(TipoArchivo.Ninguno, "");
    }
  }

  private buscarXTexto(v: string) {
    //
    this.datoEtapaFiltro = this.datoEtapaOriginal.map(elemento => {
      const elementoFiltrado = { ...elemento };
      return this.visorUtilService.filtratElemento(elementoFiltrado, v);
    }).filter(elemento => elemento !== null); // Eliminar elementos que no tienen datos relevantes
    //
    this.seleccionarArchivoInicio();
  }

  protected eventoBuscarTipoDocumento(seleccionado: any) {
    const tipoSeleccionado = seleccionado.value;
    (this.inputBuscarRef.nativeElement as HTMLInputElement).value = '';
    if(tipoSeleccionado==='0'){
      this.datoEtapaFiltro = [...this.datoEtapaOriginal];
      this.seleccionarArchivoInicio();
      return;
    }
    //
    this.datoEtapaFiltro = this.datoEtapaOriginal.map(elemento => {
      const elementoFiltrado = { ...elemento };
      // Filtrar datosArchivo en la raíz del objeto
      return this.visorUtilService.filtrarTipoElemento(elementoFiltrado, tipoSeleccionado);
    }).filter(elemento => elemento !== null); // Eliminar elementos que no tienen datos relevantes
    //
    this.seleccionarArchivoInicio();
  }

  private posicionarScrollbarListaArchivos(id: number):void {
    if(this.filaArchivoRef===undefined){
      return;
    }
    const selectedElement = this.filaArchivoRef.find((element) => {
      const elId = element.nativeElement.getAttribute('id');
      return elId && elId === 'fila-' + id;
    });

    if (selectedElement) {
      selectedElement.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'start',
      });
    }
  }

  protected eventoSeleccionarFila(datosArchivo:DatosArchivo, event: any){
    if (event && event.originalEvent) {
      event.originalEvent.stopPropagation();
    }

    if(event.checked===false){
      const etapa = this.datoEtapaFiltro.find( elm => elm.id === datosArchivo.idEtapa )!;
      if(datosArchivo.idClasificadorExpediente === ClasificadorExpedienteEnum.CuadernoIncidental){
        const cuadernoInc = etapa.cuadernoIncidental!.find( elm => elm.idCaso === datosArchivo.idCaso );
        cuadernoInc!.seleccionado = false;
        if(datosArchivo.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion){
          cuadernoInc!.datosArchivo.find(elm => elm.correlativo === datosArchivo.correlativoPadre)!.seleccionado = false;
        }
      }else if(datosArchivo.idClasificadorExpediente === ClasificadorExpedienteEnum.Principal){
        if(datosArchivo.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion){
          etapa.datosArchivo.find(elm => elm.correlativo === datosArchivo.correlativoPadre)!.seleccionado = false;
        }
      }
    }

    //Agregar o eliminar archivos seleccionados
    this.seleccionarFila(datosArchivo, event.checked);
  }

  private seleccionarFila(datosArchivo:DatosArchivo, checked:boolean){
    const seleccionadoIndex = this.datoArchivoSeleccionados.findIndex( elm=>elm.correlativo=== datosArchivo.correlativo);

    if(checked === true ){
      if(seleccionadoIndex < 0){
        this.datoArchivoSeleccionados.push({
          idEtapa: datosArchivo.idEtapa,
          correlativo: datosArchivo.correlativo,
          correlativoPadre: datosArchivo.correlativoPadre,
          codigoClasificador: datosArchivo.codigoClasificador,
          idClasificadorExpediente: datosArchivo.idClasificadorExpediente,
          idCaso : datosArchivo.idCaso
        });
      }
    }else{
      if(seleccionadoIndex > -1){
        this.datoArchivoSeleccionados.splice(seleccionadoIndex, 1);
      }
    }
  }
}
