import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertaData } from '@interfaces/comunes/alert';
import { Tab } from '@interfaces/comunes/tab';
import {
  AsuntoObservaciones,
  DocumentoAdjunto,
  DocumentoIngresadoNuevo,
  VisorDocumentoResponse
} from '@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevo';
import { BandejaDocumentosVisorService } from '@services/provincial/documentos-ingresados/bandeja-documentos.service';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { valid } from '@utils/string';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabViewModule } from 'primeng/tabview';
import { Subscription } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { AtenderDocumentoComponent } from './atender-documento/atender-documento.component';
import { IconAsset, StringUtil } from 'ngx-cfng-core-lib';
import { FuentesInvestigacionComponent } from "@components/modals/previsualizar-documento-modal/fuentes-investigacion/fuentes-investigacion.component";
import { ReusableArchivoService } from '@core/services/reusables/reusable-archivos.service';
import { SkeletonModule } from 'primeng/skeleton';
import { PersonaService } from '@services/mesa-unica-despacho/persona.service';
import { MaestroService } from '@services/shared/maestro.service';
import { ConsultaReniec } from '@interfaces/mesa-unica-despacho/denuncia/datos-denuncia.interface';
import { PARAMETRO_CONSULTA_RENIEC } from '@constants/mesa-unica-despacho';
import { TokenService } from '@services/shared/token.service';
import { TokenSession } from '@interfaces/shared/session.interface';
@Component({
  standalone: true,
  selector: 'previsualizar-documento-modal',
  templateUrl: './previsualizar-documento-modal.component.html',
  styleUrls: ['./previsualizar-documento-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    CheckboxModule,
    CommonModule,
    ButtonModule,
    TabsViewComponent,
    TabViewModule,
    CalendarModule,
    RadioButtonModule,
    AtenderDocumentoComponent,
    FuentesInvestigacionComponent,
    SkeletonModule
  ],
})
export class PrevisualizarDocumentoModalComponent implements OnInit, OnDestroy {
  razon = new FormControl('', [Validators.required]);
  documento: DocumentoIngresadoNuevo;
  visorDocumento!: VisorDocumentoResponse;
  documentoSeleccionado!: DocumentoAdjunto;
  asuntosObs!: AsuntoObservaciones;
  subscriptions: Subscription[] = [];
  numeroCaso: string = '';
  caso: string = "";
  listaDocumentos: any = [];
  form!: FormGroup;
  usuario!: TokenSession;

  constructor(private readonly fb: FormBuilder,
              protected readonly iconAsset: IconAsset,
              private readonly sanitizer: DomSanitizer,
              protected readonly stringUtil: StringUtil,
              private readonly spiner: NgxSpinnerService,
              protected readonly _sanitizer: DomSanitizer,
              public readonly config: DynamicDialogConfig,
              private readonly tokenService: TokenService,
              private readonly dialogRef: DynamicDialogRef,
              private readonly dialogService: DialogService,
              private readonly maestroService: MaestroService,
              private readonly personaService: PersonaService,
              protected readonly referenciaModal: DynamicDialogRef,
              private readonly reusableArchivo: ReusableArchivoService,
              private readonly bandejaDocumentosVisorService: BandejaDocumentosVisorService) {
    this.documento = this.config.data.documentoIngresadoNuevo;
    this.caso = this.documento.idCaso
    this.numeroCaso = this.documento.numeroCaso
    this.usuario = this.tokenService.getDecoded();
  }

  public tabs: Tab[] = [
    {
      titulo: 'Previsualización',
      ancho: 187,
    },
    {
      titulo: 'Asuntos y observaciones',
      ancho: 255,
    },
    {
      titulo: 'Fuentes de investigacion',
      ancho: 240,
    },
    {
      titulo: 'Atender documento',
      ancho: 235,
    },
  ];
  public indexActivo: number = 0;
  public pdfUrl: any;

  items: (data: any) => MenuItem[] = (data: any) => [];

  async ngOnInit() {
    this.form = this.fb.group({});

    if (
      this.documento.estadoDocuIngresado === '585' ||
      this.documento.estadoDocuIngresado === '664'
    ) {
      this.cambioTab(3);
    }

    await this.obtenerDocumentoVisor(this.documento.idDocumentoEscrito);
    this.consultarDocumentoIdentidad();

    let _idDocA = this.visorDocumento.idDocumentoA;
    let _idDocB = this.visorDocumento.idDocumentoB;

    let _nombreDocA = this.visorDocumento.nombreDocumentoA;
    let _nombreDocB = this.visorDocumento.nombreDocumentoB;

    let _nombreDocOriA = this.visorDocumento.nombreDocumentoOrigenA;
    let _nombreDocOriB = this.visorDocumento.nombreDocumentoOrigenB;

    let _nroDocA = this.visorDocumento.numeroDocumentoA;
    let _nroDocB = this.visorDocumento.numeroDocumentoB;
    this.documento.numeroDocumentoPdf = _nroDocB;

    let _fechaRegistroA = this.visorDocumento.fechaRegistroA;
    let _fechaRegistroB = this.visorDocumento.fechaRegistroB;

    let _tamanoA = this.visorDocumento.tamanoArchivoA;
    let _tamanoB = this.visorDocumento.tamanoArchivoB;

    let documento1: DocumentoAdjunto = {
      id: 1,
      idDocumento: _idDocA,
      nombreDocumento: _nombreDocA,
      numeroDocumento: _nroDocA,
      fechaRegistro: _fechaRegistroA,
      tamanoArchivo: _tamanoA,
      ideDocumento: this.visorDocumento.ideDocumento,
      nombreOrigenDocumento: _nombreDocOriA
    };
    let documentoCargo: DocumentoAdjunto = {
      id: 2,
      idDocumento: _idDocB,
      nombreDocumento: _nombreDocB,
      numeroDocumento: _nroDocB,
      fechaRegistro: _fechaRegistroB,
      tamanoArchivo: _tamanoB,
      ideDocumento: this.visorDocumento.ideDocumento,
      nombreOrigenDocumento: _nombreDocOriB
    };

    valid(_nombreDocB) &&
      valid(_nroDocB) &&
      this.listaDocumentos.push(documentoCargo);
    valid(_nombreDocA) &&
      valid(_nroDocA) &&
      this.listaDocumentos.push(documento1);

    this.documentoSeleccionado = documentoCargo;
    this.verDocumentopdf(documentoCargo);
    await this.obtenerAsuntosObs(this.documento.idDocumentoEscrito);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get closeIcon(): string {
    return this.iconAsset.obtenerRutaIcono('close').toString();
  }

  cambioTab(value: any) {
    this.indexActivo = value;
  }

  public obtenerNumeroCaso(): string {
    return this.stringUtil.obtenerNumeroCaso(this.numeroCaso);
  }

  protected consultarDocumentoIdentidad() {
    this.personaService.buscarPersonaSujetoPerYExtr(
      this.visorDocumento.tipoDocumentoPresentante,
      this.visorDocumento.numeroDocumentoPresentante,
      this.caso
    ).subscribe({
      next: resp => {
        this.setearPersonaRemitente(resp.registros[0], false);
      },
      error: (error) => {
        if (error.status === 422)
          this.consultaReniec();

      }
    })
  }

  private consultaReniec(): void {
    let requestPnatu: ConsultaReniec = {
      numeroDocumento: this.visorDocumento.numeroDocumentoPresentante,
      ip: PARAMETRO_CONSULTA_RENIEC.IP_RENIEC,
      usuarioConsulta: this.usuario.usuario.usuario,
      dniFiscal: this.usuario.usuario.dniFiscal
    };

    this.maestroService.consultaReniecApiMup(requestPnatu).subscribe({
      next: resp => {
        this.setearPersonaRemitente(resp, true);
      },
      error: (error) => {
        this.visorDocumento.tipoParte = 'NINGUNO';
      }
    })
  }

  private setearPersonaRemitente(data: any, esReniec: boolean): void {
    this.visorDocumento.tipoParte = esReniec ? 'NINGUNO' : data.descripcionTipoParteSujeto;
  }

  obtenerDocumentoVisor(idDocumento: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.bandejaDocumentosVisorService
          .obtenerInfoDocumento(idDocumento)
          .subscribe({
            next: (resp) => {
              console.log('ObtenerDocumentoVisor resp: ', resp);
              this.visorDocumento = resp.data[0];
              resolve();
            },
          })
      );
    });
  }


  obtenerAsuntosObs(idDocumento: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.bandejaDocumentosVisorService
          .obtenerAsuntosObs(idDocumento)
          .subscribe({
            next: (resp) => {
              if (resp.data[0] != undefined && resp.data[0] != null) {
                this.asuntosObs = resp.data[0];
              } else {
                this.asuntosObs = {
                  asunto: '',
                  observaciones: '',
                };
              }

              resolve();
            },
          })
      );
    });
  }

  verDocumentopdf(item: DocumentoAdjunto) {
    this.documentoSeleccionado = item;
    this.spiner.show();
    this.reusableArchivo.verArchivo(item.idDocumento, "documento.pdf").subscribe({
      next: (resp: Blob) => {
        this.spiner.hide();
        if (resp.size > 0) {
          const fileUrl = window.URL.createObjectURL(resp);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl+ "#toolbar=0");
        } else {
          this.mensajeError('Aviso', 'Documento sin contenido');
        }
      },
      error: () => {
        this.mensajeError('Aviso', 'No se encontro el documento');
        this.spiner.hide();
      },
    });
  }

  descargarDocumentoPdf(item: DocumentoAdjunto) {
    this.documentoSeleccionado = item;
    this.spiner.show();
    this.reusableArchivo.verArchivo(item.idDocumento, "documento.pdf").subscribe({
      next: (resp: Blob) => {
        this.spiner.hide();
        if (resp.size > 0) {
          const fileUrl = window.URL.createObjectURL(resp);
          const a = document.createElement('a');
          a.href = fileUrl;
          a.download = item.nombreOrigenDocumento;
          a.click();
        } else {
          this.mensajeError('Aviso', 'Documento sin contenido');
        }
      },
      error: () => {
        this.mensajeError('Aviso', 'No se encontro el documento');
        this.spiner.hide();
      },
    });
  }

  getLabelById(value: any, list: any[]): string {
    const selectedItem = list.find((item) => item.value === value);
    return selectedItem ? selectedItem.label : '';
  }

  datosSujeto: any;

  mensajeCorrecto(mensaje: any, submensaje: any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
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

  close() {
    this.dialogRef.close();
  }
}
