import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { ReusablesConsultaService } from '@services/reusables/reusables-consulta.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AlertaData } from '@interfaces/comunes/alert';
import { RespuestaCasoRequest } from '@core/interfaces/comunes/RespuestaCasoRequest';
import {
  HistorialCaso,
  InformacionCaso,
} from '@interfaces/reusables/informacion-caso/InformacionCaso';
import { SujetoProcesal } from '@interfaces/visor/visor-interface';
import { InformacionCasoService } from '@services/provincial/bandeja-derivaciones/informacion-caso/informacion-caso.service';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { RespuestaCasoService } from '@services/reusables/reusable-respuesta-caso.service';
import { HechosCasoComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/hechos-caso/hechos-caso.component';
import { AcumulacionAsociarCasoModalComponent } from '@modules/provincial/tramites/comun/calificacion/acumulacion-asociar-caso/acumulacion-asociar-caso-modal/acumulacion-asociar-caso-modal.component';
import { MessageService } from 'primeng/api';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { Expediente } from '@core/utils/expediente';
import { AcumulacionAsociarCasoService } from '@core/services/provincial/tramites/comun/calificacion/acumulacion-asociar-caso/acumulacion-asociar-caso.service';
import { Router } from '@angular/router';
import { PreviewDocModalComponent } from '../preview-doc-modal/preview-doc-modal.component';
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { TokenService } from '@core/services/shared/token.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants';

@Component({
  standalone: true,
  selector: 'app-informacion-caso',
  templateUrl: './informacion-caso.component.html',
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
    TabViewModule,
    CalendarModule,
    RadioButtonModule,
    TableModule,
    SelectButtonModule,
    HechosCasoComponent,
  ],
  providers: [MessageService],
})
export class InformacionCasoComponent implements OnInit {
  suscripciones: Subscription[] = [];

  numeroCaso = '';
  idCaso = '';
  bandeja = '';
  idBandejaDerivacion = '';
  idCasoAcumulado = '';
  idActoTramiteCaso = '';

  informacionCaso: InformacionCaso | null = null;
  listDelitosYPartes: SujetoProcesal[] = [];
  listHistorialCaso: HistorialCaso[] = [];
  listHistorialDerivacion: any[] = [];
  public pdfTramiteUrl: SafeResourceUrl = '';
  protected soloLectura: boolean = false;
  public casoFiscal!: Expediente;
  public idTipoElevacion = '';
  private readonly desuscribir$ = new Subject<void>();

  constructor(
    private dialogService: DialogService,
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer,
    private reusablesConsultaService: ReusablesConsultaService,
    private informacionCasoService: InformacionCasoService,
    private casoService: Casos,
    private respuestaCasoService: RespuestaCasoService,
    private messageService: MessageService,
    public acumulacionAsociarCasoService: AcumulacionAsociarCasoService,
    private router: Router,
    private readonly tokenService: TokenService,
    private readonly alertaService: AlertaService,
  ) {
    this.idCaso = config.data.idCaso;
    this.numeroCaso = config.data.numeroCaso;
    this.bandeja = config.data.bandeja;
    this.idBandejaDerivacion = config.data.idBandejaDerivacion;
    this.idCasoAcumulado = config.data.idCasoAcumulado;
    this.idTipoElevacion = config.data.idTipoElevacion;
    this.soloLectura = config.data.soloLectura;
    /**this.idActoTramiteCaso = config.data.idActoTramiteCaso;**/
  }

  ngOnInit() {
    this.suscripciones.push(
      this.acumulacionAsociarCasoService.eventoActual.subscribe((valor: Boolean) => {
        if (valor) { //EXCLUSIVO PARA ASOCIAR CASO (ACCIONES SI SE FIRMA)
          this.closeAction();
        }
      })
    );
    this.obtenerDelitosYPartes();
    this.obtenerInformacionCaso();
    this.obtenerHistorialCaso();
    this.obtenerHistorialDerivaciones();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  public obtenerNumeroCaso(): SafeHtml {
    const caso = this.numeroCaso.split('-');
    const casoHtml = `<div class="cfe-caso">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</div>`;
    return this.sanitizer.bypassSecurityTrustHtml(casoHtml);
  }

  public obtenerDelitosYPartes() {
    this.suscripciones.push(
      this.reusablesConsultaService
        .obtenerDelitosYPartes(this.numeroCaso)
        .subscribe({
          next: (resp) => {
            this.listDelitosYPartes = resp;
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  public obtenerInformacionCaso() {
    this.spinner.show();
    this.suscripciones.push(
      this.informacionCasoService
        .obtenerInformacionCaso(this.idCaso)
        .subscribe({
          next: (resp) => {
            this.spinner.hide();
            this.informacionCaso = resp[0];
          },
          error: (error) => {
            console.log(error);
            this.spinner.hide();
          },
        })
    );
  }

  public obtenerHistorialCaso() {
    this.suscripciones.push(
      this.informacionCasoService.obtenerHistorialCaso(this.idCaso).subscribe({
        next: (resp) => {
          this.listHistorialCaso = resp;
        },
        error: (error) => {
          console.log(error);
        },
      })
    );
  }

  public obtenerHistorialDerivaciones() {
    this.suscripciones.push(
      this.informacionCasoService
        .obtenerHistorialDerivaciones(this.idCaso)
        .subscribe({
          next: (resp) => {
            this.listHistorialDerivacion = resp;
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  public closeAction(): void {
    this.dialogRef.close('closed');
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  verDocumento(idDocumento: string) {
    this.dialogService.open(PreviewDocModalComponent, {
      showHeader: false,
      width: '1000px',
      height: '95%',
      contentStyle: {
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      },
      data: idDocumento,
    });
  }

  private mensajeError(mensaje: string, submensaje: string) {
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

  abrirAceptarCaso() {
    const dialogRef = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `ACEPTAR CASO DERIVADO`,
        confirmButtonText: 'Confirmar',
        confirm: true,
        description: `Al aceptar el caso derivado, este se moverá a la bandeja de <b>"Por asignar"</b>. Por favor confirme la acción, ya que ésta <b>no podrá ser revertida</b>`,
      }
    } as DynamicDialogConfig<AlertaData>)

    dialogRef.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.aceptarCaso(false);
         
          setTimeout(() => {
            this.resolverAlertas();
            /**const request: AlertaGeneralRequestDTO = {
              idCaso: this.idCaso,
              numeroCaso: this.numeroCaso,
              idActoTramiteCaso: this.idActoTramiteCaso,
              codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_DA1,
              idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
              destino: CodigoDestinoAlertaTramiteEnum.PROV_ENTIDAD_DESPACHO_ORIGEN_DERIVACION,
              data: [{}]
            };
            this.registrarAlertas(request);**/
          }, 0);

        }
      }
    })
  }

  resolverAlertas(): void {
    const alerta: Alerta = {
      codigoCaso: this.numeroCaso,
      codigoDespacho: this.tokenService.getDecoded().usuario.codDespacho,
      fechaCreacion: '',
      codigoUsuarioDestino: this.tokenService.getDecoded().usuario.usuario,
      texto: '',
      idAsignado: this.tokenService.getDecoded().usuario.usuario
    }
    this.alertaService
      .solucionarAlerta(alerta)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  registrarAlertas(request: AlertaGeneralRequestDTO): void {
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  protected obtenerUrlDerivadoBase() {
    return '/app/administracion-casos/asignacion/listar-casos-por-asignar';
  }

  async aceptarCaso(esDerivadoAcumulado:boolean) {
    await this.obtenerCasoFiscal(this.idCaso);
    let request: RespuestaCasoRequest = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.casoFiscal.idActoTramiteCasoUltimo!,
      idTipoElevacion: 724,
      observacion: '',
    };
    this.respuestaCasoService.aceptarCaso(request).subscribe({
      next: (resp) => {
        /**this.messageService.addAll([
          {
            severity: 'success',
            summary: 'AVISO',
            detail: 'SE RESPONDIO EL CASO CORRECTAMENTE',
          },
        ]);**/ 
        this.closeAction();
        if (!esDerivadoAcumulado) {
          const urlBase = this.obtenerUrlDerivadoBase();
          this.router.navigate([`${urlBase}`])
            .then((success) => {
              if (success) {
                setTimeout(() => window.location.reload(), 100);
              } else {
                console.error('Falló la navegación');
              }
            });
        }
        
      },
      error: (error) => {
        console.log('error registrar caso leido', error);
        /**this.messageService.addAll([
          {
            severity: 'error',
            summary: 'AVISO',
            detail: 'NO SE LOGRO RESPONDER EL CASO - ' + error,
          },
        ]);**/
      },
    });
  }

  async abrirAsociarCaso() {
    await this.obtenerCasoFiscal(this.idCaso);
    const dialogRef = this.dialogService.open(AcumulacionAsociarCasoModalComponent,{
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
        data: {
          idCaso: this.casoFiscal.idCaso,
          numeroCaso: this.casoFiscal.numeroCaso,
          idEtapa: this.casoFiscal.idEtapa,
          idBandejaDerivacion: this.idBandejaDerivacion,
          idCasoAcumulado: this.idCasoAcumulado,
        },
      }
    );
    dialogRef.onClose.subscribe({
      next: resp => {
        if (resp === 'derivado') {
          this.aceptarCaso(true);

          setTimeout(() => {
            this.resolverAlertas();
            /**const request: AlertaGeneralRequestDTO = {
              idCaso: this.idCaso,
              numeroCaso: this.numeroCaso,
              idActoTramiteCaso: this.idActoTramiteCaso,
              codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_DA2,
              idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
              destino: CodigoDestinoAlertaTramiteEnum.PROV_ENTIDAD_DESPACHO_ORIGEN_DERIVACION,
              data: [{}]
            };
            this.registrarAlertas(request);**/
          }, 0);

        }
      }
    })
  }

  private async obtenerCasoFiscal(idCaso: string) {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.suscripciones.push(
        this.casoService.obtenerCasoFiscal(idCaso).subscribe({
          next: (resp) => {
            this.casoFiscal = resp;
            this.spinner.hide();
            resolve();
          },
          error: (error) => {
            this.spinner.hide();
            console.log(error);
          },
        })
      );
    });
  }
  copiarAlPortapapeles(valor:string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valor).then(() => {
      }).catch(err => {
        console.error('Error al copiar al portapapeles:', err);
      });
    }else {
      const textArea = document.createElement('textarea');
      textArea.value = valor;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
      document.body.removeChild(textArea);
    }
  }
}
