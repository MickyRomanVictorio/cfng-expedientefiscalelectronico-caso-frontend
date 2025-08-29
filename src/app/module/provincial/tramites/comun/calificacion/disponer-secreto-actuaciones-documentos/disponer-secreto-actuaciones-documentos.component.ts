import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { DateMaskModule } from '@directives/date-mask.module';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';

import { obtenerCasoHtml } from '@utils/utils';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DOCUMENTOS_CASO, DOCUMENTOS_CUADERNOS_INCIDENTALES } from '@assets/data/mock';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentoTramite } from '@interfaces/provincial/administracion-casos/preliminar/documentoTramite';
import { Tab } from '@interfaces/comunes/tab';

@Component({
  standalone: true,
  selector: 'app-disponer-secreto-actuaciones-documentos',
  templateUrl: './disponer-secreto-actuaciones-documentos.component.html',
  styleUrls: ['./disponer-secreto-actuaciones-documentos.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    TabViewModule,
    CheckboxModule,
    InputTextModule,
    DateMaskModule,
    CalendarModule,
    TabsViewComponent,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DisponerSecretoActuacionesDocumentosComponent implements OnInit {

  private numeroCasoActual: string;

  public documentosCaso: DocumentoTramite[] = []
  public documentosCasoSeleccionados: DocumentoTramite[] = []
  public documentosCuadernosIncidentales: any[] /* DocumentoTramite[] TODO-V18 */ = []
  public cuadernosIncidentalesSeleccionados: String[] = []
  public estaTodosLosDocumentosDeCuadernosSeleccionados: boolean = false

  public tabs: Tab[] = [
    {
      titulo: 'Documento/Tramite',
      ancho: 250,
    },
    {
      titulo: 'Documento/Trámite de cuadernos incidentales',
      ancho: 450,
    },
  ];

  public indexActivo: number = 0

  public plazoMasivoControl = new FormControl('',[])
  public fechaFinMasivoControl = new FormControl(null,[])
  public plazoMasivoParaCuadernoControl = new FormControl('',[])
  public fechaFinMasivoParaCuadernoControl = new FormControl(null,[])

  selectedDocuments = []

  constructor(
    private sanitizer: DomSanitizer,
    public config: DynamicDialogConfig,
  ) {
    this.numeroCasoActual = this.config.data.caso;
  }

  ngOnInit() {
    this.obtenerListaDocumentosCaso()
    this.obtenerListaDocumentosCuadernosIncidentales()
    this.iniciarEscuchaDeEventosFiltradoMasivo()
  }

  public iniciarEscuchaDeEventosFiltradoMasivo(): void {

    this.plazoMasivoControl.valueChanges
      .subscribe(( plazo:any ) => this.actualizarPlazoSecretoDocumentosCaso( plazo ))

    this.fechaFinMasivoControl.valueChanges
      .subscribe(( fecha:any ) => this.actualizarFechaFinSecretoDocumentosCaso( fecha ))

    this.plazoMasivoParaCuadernoControl.valueChanges
      .subscribe(( plazo:any ) => this.actualizarPlazoSecretoDocumentosCuaderno( plazo ))

    this.fechaFinMasivoParaCuadernoControl.valueChanges
      .subscribe(( fecha:any ) => this.actualizarFechaFinSecretoDocumentosCuaderno( fecha ))

  }

  private obtenerListaDocumentosCaso(): void {
    this.documentosCaso = this.agregarCamposAdicionalesADocumentos( DOCUMENTOS_CASO )
  }

  private obtenerListaDocumentosCuadernosIncidentales(): void {
    this.documentosCuadernosIncidentales = this.agregarCamposAdicionalesADocumentos( DOCUMENTOS_CUADERNOS_INCIDENTALES )
  }

  public agregarCamposAdicionalesADocumentos( documentos: DocumentoTramite[] ): DocumentoTramite[] {
    return documentos.map( (documento:any) => ({ ...documento, seleccionado: false, plazo: '', fechaFin: null }) )
  }

  public estaDocumentoSeleccionado(item: DocumentoTramite): boolean {
    return this.documentosCasoSeleccionados.includes(item)
  }

  public obtenerTituloModal(): SafeHtml {
    const titulo: string = 'SELECCIONE LOS DOCUMENTOS QUE DESEA COLOCAR EN SECRETO - Caso: N° '
    return this.sanitizer.bypassSecurityTrustHtml(`${ titulo }${ obtenerCasoHtml(this.numeroCasoActual) }`)
  }

  public obtenerTituloCuadernoIncidental( cuadernoIncidental: string ): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(cuadernoIncidental))
  }

  public actualizarPlazoSecretoDocumentosCaso( plazo: string ): void {
    const documentos = [ ...this.documentosCaso ]
    documentos.forEach( documento => {
      if ( documento.seleccionado ) {
        documento.plazo = plazo
      }
    })
    this.documentosCaso = [ ...documentos ]
  }

  public actualizarFechaFinSecretoDocumentosCaso( fechaFin: Date ): void {
    const documentos = [ ...this.documentosCaso ]
    documentos.forEach( documento => {
      if ( documento.seleccionado ) {
        documento.fechaFin = fechaFin
      }
    })
    this.documentosCaso = [ ...documentos ]
  }

  public seleccionarDocumento( id: number, seleccionado: boolean ): void {
    const index = this.documentosCuadernosIncidentales.findIndex( documento => documento.id === id )
    if ( index !== -1 )
      setTimeout(() => {
        this.documentosCuadernosIncidentales[index].seleccionado = seleccionado
        this.verificarSiTodoElGrupoEstaSeleccionado( this.documentosCuadernosIncidentales[index].cuadernoIncidental! )
        this.verificarTodosDocumentosSeleccionados()
      }, 0);
  }

  public estaGrupoSeleccionado( cuadernoIncidental: string ): boolean {
    return this.cuadernosIncidentalesSeleccionados.findIndex( cuaderno => cuaderno === cuadernoIncidental) !== -1;
  }

  public verificarSiTodoElGrupoEstaSeleccionado( cuadernoIncidental: string ): void {

    const documentos = this.documentosCuadernosIncidentales.filter( documento => documento.cuadernoIncidental === cuadernoIncidental )
    let seleccionadoTrue: number = 0
    let seleccionadoFalse: number = 0

    documentos.forEach( documento => {
      if ( documento.seleccionado )
        seleccionadoTrue += 1
      else seleccionadoFalse += 1
    })

    if ( seleccionadoTrue === documentos.length ) {
      this.cuadernosIncidentalesSeleccionados.push( cuadernoIncidental )
      return;
    }

    let index = this.cuadernosIncidentalesSeleccionados.findIndex( cuaderno => cuaderno === cuadernoIncidental )
    index !== -1 && this.cuadernosIncidentalesSeleccionados.splice(index, 1)
  }

  public actualizarValorAtributoGrupoDocumentos( atributo: string, cuadernoIncidental: string, valor: boolean | string | Date ) {
    const documentos = this.documentosCuadernosIncidentales.filter( documento => documento.cuadernoIncidental === cuadernoIncidental )!
    documentos.forEach( (documento:any) => {
      const indexDocumento = this.documentosCuadernosIncidentales.findIndex( documentoCuaderno => documentoCuaderno.id === documento.id )!
      if ( indexDocumento !== -1 ) {
        setTimeout(() => {
          this.documentosCuadernosIncidentales[indexDocumento][atributo] = valor;
        }, 0);
      }
    })
  }

  public seleccionarGrupoDocumentos( cuadernoIncidental: string ): void {
    let index = this.cuadernosIncidentalesSeleccionados.findIndex( cuaderno => cuaderno === cuadernoIncidental )
    if ( index === -1 ) {
      this.cuadernosIncidentalesSeleccionados.push( cuadernoIncidental )
      this.actualizarValorAtributoGrupoDocumentos( 'seleccionado', cuadernoIncidental, true )
      setTimeout(() => {
        this.verificarTodosDocumentosSeleccionados()
      }, 0);
      return
    }
    this.cuadernosIncidentalesSeleccionados.splice(index, 1)
    this.actualizarValorAtributoGrupoDocumentos( 'seleccionado', cuadernoIncidental, false )
    setTimeout(() => {
      this.verificarTodosDocumentosSeleccionados()
    }, 0);
  }

  public establecerPlazoGrupoDocumento( cuadernoIncidental: string, e: Event ): void {
    const plazo = (e.target as HTMLInputElement).value;
    this.actualizarValorAtributoGrupoDocumentos( 'plazo', cuadernoIncidental, plazo )
  }

  public establecerFechaFinGrupoDocumento( cuadernoIncidental: string, fechaFin: Date ): void {
    this.actualizarValorAtributoGrupoDocumentos( 'fechaFin', cuadernoIncidental, fechaFin )
  }

  public verificarTodosDocumentosSeleccionados(): void {
    let cantidadSeleccionado: number = 0
    this.documentosCuadernosIncidentales.forEach( documento => {
      documento.seleccionado && cantidadSeleccionado++
    })
    this.estaTodosLosDocumentosDeCuadernosSeleccionados = this.documentosCuadernosIncidentales.length === cantidadSeleccionado
  }

  public seleccionarTodosLosDocumentos(): void {

    let cuadernosIncidentales:any[] = [];
    const nuevoValor: boolean = this.estaTodosLosDocumentosDeCuadernosSeleccionados

    this.documentosCuadernosIncidentales.forEach( documento => {
      nuevoValor && cuadernosIncidentales.push( documento.cuadernoIncidental )
      documento.seleccionado = nuevoValor
    })

    if ( !nuevoValor ) {
      this.cuadernosIncidentalesSeleccionados = []
      return
    }

    const listaUnicaCuadernosIncidentales = new Set(cuadernosIncidentales)
    this.cuadernosIncidentalesSeleccionados = [...Array.from(listaUnicaCuadernosIncidentales) ]

  }

  public actualizarPlazoSecretoDocumentosCuaderno( plazo: string ): void {
    this.documentosCuadernosIncidentales.forEach( documento => {
      documento.plazo = plazo
    })
  }

  public actualizarFechaFinSecretoDocumentosCuaderno( fechaFin: Date ): void {
    this.documentosCuadernosIncidentales.forEach( documento => {
      documento.fechaFin = fechaFin
    })
  }

}
