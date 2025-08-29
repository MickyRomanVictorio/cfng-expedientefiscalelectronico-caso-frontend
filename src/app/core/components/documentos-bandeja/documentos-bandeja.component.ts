import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component';
import { PrevisualizarDocumentoModalComponent } from '@components/modals/previsualizar-documento-modal/previsualizar-documento-modal.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { TipoArchivoType } from '@core/types/exportar.type';
import { urlConsultaCasoFiscal, urlConsultaCuaderno, urlConsultaPestanaApelacion } from '@core/utils/utils';
import { BandejaTramite } from '@interfaces/provincial/bandeja-tramites/BandejaTramite';
import { TramiteCreadoPor } from '@interfaces/provincial/bandeja-tramites/TramiteCreadoPor';
import { DocumentoIngresadoNuevo } from '@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevo';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { ExportarService } from '@services/shared/exportar.service';
import { TokenService } from '@services/shared/token.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorComponent } from '../generales/paginator/paginator.component';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';

enum TabActivoEnum {
  NUEVOS = 0,
  RECIBIDOS = 1,
  OBSERVADOS = 2,
  NO_PRESENTADOS = 3,
}

@Component({
  standalone: true,
  selector: 'app-documentos-bandeja',
  templateUrl: './documentos-bandeja.component.html',
  styleUrls: ['./documentos-bandeja.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    DateFormatPipe,
    ButtonModule,
    TableModule,
    ToastModule,
    TooltipModule,
    PaginatorComponent,
    CapitalizePipe
  ],
  providers: [MessageService, DialogService, DatePipe],
})
export class DocumentosBandejaComponent implements OnInit {
  @Input() tabActivo: number = 0;
  @Input() titleDocumento: string = '';
  @Input() documentosBandeja!: DocumentoIngresadoNuevo[];

  @Input({ required: true })
  public paginacionCondicion: any;

  @Input({ required: true })
  public paginacionConfiguracion: any;

  @Input({ required: true })
  public paginacionReiniciar: boolean = false;

  @Input()
  public procesadoCriterioBusqueda: boolean = false;

  @Output()
  public cambiarPagina = new EventEmitter<PaginacionInterface>();

  protected pagina!: number;

  public referenciaModal!: DynamicDialogRef;
  public todoSeleccionado: boolean = false;
  // private caso: Expediente;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private exportarService: ExportarService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService // private gestionCasoService: GestionCasoService
  ) {
    // this.caso = this.gestionCasoService.casoActual;
    // console.log('caso: ', this.caso);
  }

  ngOnInit(): void {
    this.pagina = this.paginacionCondicion.page;
  }

  protected eventoCambiarPagina(paginacion: PaginacionInterface) {
    this.pagina = paginacion.page;
    this.cambiarPagina.emit(paginacion);
  }

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  onHeaderCheckboxToggle(event: any) {
    this.todoSeleccionado = !!event.checked;
  }

  public obtenerNumeroCaso(numeroCaso: string): any {
    const caso = numeroCaso.split('-');
    const casoHtml = `<div class="cfe-caso"><p><span class="color-caso">${caso[0]}-</span><span>${caso[1]}-${caso[2]}</span><span class="color-caso">-${caso[3]}</span></p></div>`;
    return this.sanitizer.bypassSecurityTrustHtml(casoHtml);
  }

  public obtenerClaseDeOrigen(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase();
  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.documentosBandeja.length > 0) {
      const headers = [
        'Número de caso',
        'Número de documento',
        'Origen',
        'Remitente',
        'Contacto de remitente',
        'Fecha ingreso',
      ];
      const data: any[] = [];

      this.documentosBandeja.forEach(
        (documentoIngresadoNuevo: DocumentoIngresadoNuevo) => {
          // Validar teléfono y correo para evitar mostrar '-'
          const telefonoValido = documentoIngresadoNuevo.telefono !== '-' ? documentoIngresadoNuevo.telefono : null;
          const correoValido = documentoIngresadoNuevo.correo !== '-' ? documentoIngresadoNuevo.correo : null;

          // Si ambos están disponibles, se combinan, de lo contrario, mostramos uno o ninguno
          const contactoRemitente = telefonoValido && correoValido
            ? `${telefonoValido} / ${correoValido}`
            : telefonoValido || correoValido || '';

          const row = {
            'Número de caso': documentoIngresadoNuevo.numeroCaso,
            'Número de documento': documentoIngresadoNuevo.numeroDocumento,
            'Origen': documentoIngresadoNuevo.origen,
            'Remitente': documentoIngresadoNuevo.remitente,
            'Contacto de remitente': contactoRemitente,
            'Fecha ingreso': documentoIngresadoNuevo.fechaIngreso,
          };
          data.push(row);
        }
      );

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(
          data,
          headers,
          'documentos-ingresados_nuevos'
          , 'landscape'
        )
        : this.exportarService.exportarAExcel(
          data,
          headers,
          'documentos-ingresados_nuevos'
        );
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }
  preVisulizarDocumentos(documentoIngresadoNuevo: DocumentoIngresadoNuevo) {
    this.referenciaModal = this.dialogService.open(
      PrevisualizarDocumentoModalComponent,
      {
        width: '1650px',
        showHeader: false,
        contentStyle: { padding: '5', 'border-radius': '15px', 'background-color': '#f5f2e0' },
        data: {
          documentoIngresadoNuevo: documentoIngresadoNuevo,
        },
      }
    );
  }

  public verHistorialTramite(tramite: BandejaTramite): void {
    this.referenciaModal = this.dialogService.open(
      HistorialTramiteModalComponent,
      {
        // width: '70%',
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
        data: {
          idCaso: tramite.idCaso,
          numeroCaso: tramite.coCaso,
          idTramite: tramite.idActoTramiteCaso,
          titulo: tramite.noTramite,
        },
      }
    );
  }

  public esMiTramite(tramiteCreadoPor: TramiteCreadoPor): boolean {
    if (!tramiteCreadoPor) return false;
    return (
      this.tokenService.getDecoded().usuario.usuario ===
      tramiteCreadoPor.coUsername
    );
  }

  protected get esTabRecibido(): boolean {
    return this.tabActivo === TabActivoEnum.RECIBIDOS;
  }

  protected eventoIrATramite1(item: DocumentoIngresadoNuevo): void {
    const urlEtapa = urlConsultaCasoFiscal({
      idEtapa: item.idEtapaInicial,
      idCaso: item.idCaso,
      flgConcluido: item.flConcluido,
    });
    const ruta = urlEtapa + `/acto-procesal/${item.idActoTramiteCaso}` + (item.pendienteCompletarDatos ? `/editar` : ``);
    this.router.navigate([`${ruta}`]);
  }

  protected eventoIrATramite(item: DocumentoIngresadoNuevo): void {
    const idClasificadorExpediente = item.idClasificadorExpedienteTramite;
    const idTipoClasificadorExpediente = item.idTipoClasificadorExpedienteTramite;
    console.log('idClasificadorExpediente = ', idClasificadorExpediente);

    let urlEtapa;
    let isPestana : boolean = false;

    if (idClasificadorExpediente === '2') {
      urlEtapa = urlConsultaCuaderno(
        'incidental',
        {
        idEtapa: item.idEtapaInicial,
        idCaso: item.idCasoTramite,
        flgConcluido: item.flConcluidoTramite,
      });
      /**} else if(idClasificadorExpediente === '3'){
        urlEtapa = urlConsultaCuadernoEjecucion({
          idEtapa: item.idEtapaInicial,
          idCaso: item.idCasoTramite,
          flgConcluido: item.flConcluidoTramite,
        });**/
    } else if (idClasificadorExpediente === '4') {
      urlEtapa = urlConsultaCuaderno(
        'extremo',
        {
        idEtapa: item.idEtapaInicial,
        idCaso: item.idCasoTramite,
        flgConcluido: item.flConcluidoTramite,
      });
    } else if (idClasificadorExpediente === '5') {
      isPestana = true;
      urlEtapa = urlConsultaPestanaApelacion(idTipoClasificadorExpediente, item.idCasoTramite);
    } else {
      urlEtapa = urlConsultaCasoFiscal({
        idEtapa: item.idEtapaInicial,
        idCaso: item.idCaso,
        flgConcluido: item.flConcluido
      });
    }

    this.obtenerCasoYRedirigir(urlEtapa, item.idCaso, item.idActoTramiteCaso, item.pendienteCompletarDatos, idClasificadorExpediente, isPestana);
  }

  private obtenerCasoYRedirigir(urlBase: string, idCaso: string, idActoTramiteCaso: string, pendienteCompletarDatos: boolean, idClasificadorExpediente: string, isPestana: boolean) {
    let ruta;

    if(isPestana){
      ruta = `${urlBase}/apelaciones`;
    }else{
      ruta = `${urlBase}/acto-procesal/${idActoTramiteCaso}` + (pendienteCompletarDatos ? `/editar` : ``);
    }

    //this.router.navigate([`${ruta}`]);
      window.location.href = `${ruta}`;


  }

}
