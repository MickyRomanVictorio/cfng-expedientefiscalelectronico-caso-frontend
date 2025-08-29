import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Catalogo } from '@core/interfaces/comunes/catalogo';
import { GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import { ResuelveContienda } from '@core/interfaces/provincial/tramites/comun/calificacion/contienda-competencia/resuelve-contienda.interface';
import { DatosPronunciamiento } from '@core/interfaces/provincial/tramites/elevacion-actuados/DisposicionResuelveElevacionActuados';
import { ContiendaCompetenciaService } from '@core/services/provincial/tramites/comun/calificacion/contienda-competencia/contienda-competencia.service';
import { ElevacionActuadosSuperiorService } from '@core/services/reusables/superior/emitir-pronunciamiento/elevacion-actuados-superior-service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { VisorEfeService } from '@core/services/visor/visor.service';
import { obtenerIcono } from '@core/utils/icon';
import { BandejaTramitesService } from '@services/provincial/bandeja-tramites/bandeja-tramites.service';
import {
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import {
  IconAsset,
  IconUtil,
  StringUtil,
} from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import {
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

enum ACCION_ESTADO_TRAMITE {
  ELEVAR_TRAMITE = 28,
  EMITIR_PRONUNCIAMIENTO = 166,
}

enum TRAMITE {
  DISPOSICION_RESUELVE_CONTIENDA_COMPENTENCIA = '000032',
}
enum TRAMITE_ESTADO {
  DISPOSICION_RESUELVE_CONTIENDA_COMPENTENCIA_PROVINCIAL = '00000510100111010100003201000',
  DISPOSICION_RESUELVE_CONTIENDA_COMPENTENCIA_SUPERIOR = '00000510100121010100003201000',
}

@Component({
  standalone: true,
  selector: 'app-preview-elevacion-modal',
  templateUrl: './preview-elevacion-modal.html',
  imports: [
    CmpLibModule,
    SharedModule,
    TableModule,
    ButtonModule,
    NgxCfngCoreModalDialogModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
  ],

  providers: [NgxCfngCoreModalDialogService],
})
export class PreviewElevacionModalComponent {
  public readonly subscriptions: Subscription[] = [];
  protected documentoRuta: SafeResourceUrl | null | string = '';
  protected datos: any;
  protected obtenerIcono = obtenerIcono;
  protected tipoResultado: Catalogo[] = [];
  protected motivos: Catalogo[] = [];
  public formularioPronunciamiento!: FormGroup;
  protected datosPronunciamiento: DatosPronunciamiento | null = null;
  protected datosResuelveContienda: ResuelveContienda | null = null;

  constructor(
    public sanitizer: DomSanitizer,
    protected iconAsset: IconAsset,
    protected referenciaModal: DynamicDialogRef,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    private readonly dataService: VisorEfeService,
    private readonly bandejaTramitesService: BandejaTramitesService,
    protected readonly config: DynamicDialogConfig,
    private readonly maestroService: MaestroService,
    private readonly elevacionActuadosSuperiorService: ElevacionActuadosSuperiorService,
    private readonly formulario: FormBuilder,
    private readonly contiendaCompetenciaService: ContiendaCompetenciaService,
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  ngOnInit() {
    this.crearFomulario();
    this.cargarTiposResultado();
    this.obtenerDatosGenerales();
    const idActoTramiteCaso = this.config.data.idActoTramiteCaso;
    this.formularioPronunciamiento.disable();
    if(this.esDisposicionContiendaSuperior()){
      this.cargarDatosResuelveContiendaSuperior(idActoTramiteCaso);
    }
    if(this.esDisposicionContiendaProvincial()){
      this.cargarDatosResuelveContiendaProvincial(idActoTramiteCaso);
    }
  }

  private crearFomulario(): void {
    this.formularioPronunciamiento = this.formulario.group({
      tipoResultado: [''],
      fechaDisposicion: new Date,
      excluirFiscal: [false],
      motivo: [null],
      descripcion: [null],
      observaciones: [null],
    });
  }

  public esDisposicionContiendaSuperior():boolean{
    return TRAMITE_ESTADO.DISPOSICION_RESUELVE_CONTIENDA_COMPENTENCIA_SUPERIOR === this.config.data.idActoTramiteEstado;
  }

  public esDisposicionContiendaProvincial():boolean{
    return TRAMITE_ESTADO.DISPOSICION_RESUELVE_CONTIENDA_COMPENTENCIA_PROVINCIAL === this.config.data.idActoTramiteEstado;
  }

  private cargarDatosResuelveContiendaSuperior(idActoTramiteCaso: string): void {
    this.obtenerDisposicionResuelveContienda(idActoTramiteCaso);
  }

  private cargarDatosResuelveContiendaProvincial(idActoTramiteCaso: string): void {
    this.cargarMotivoCompetencia();
    this.obtenerDisposicionResuelveContiendaProvincial(idActoTramiteCaso);
  }

  public cargarTiposResultado() {
    this.maestroService.obtenerCatalogo('ID_N_TIPO_RESULTADO').subscribe({
      next: (resp) => {
        /**this.tipoResultado = resp.data.filter( (el:any)=> (el.id == 763 || el.id===765) );//Solo mostrar Fundado e Infundo**/
        this.tipoResultado = resp.data.filter((el: any) => (el.id == 1105 || el.id === 1106));//Solo mostrar Fundado e Infundo
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  public cargarMotivoCompetencia() {
    const nombreGrupo = "IN_N_MOTIVO_COMPETENCIA";
    this.subscriptions.push(
      this.maestroService.obtenerCatalogo(nombreGrupo).subscribe({
        next: resp => {
          this.motivos = resp.data;
        },
        error: (error) => {
          console.log(error);
        }
      })
    );
  }

  //Obtener datos del pronuncioamiento por fiscal superior
  protected obtenerDisposicionResuelveContienda(idActoTramiteCaso: string) {
    this.subscriptions.push(
      this.elevacionActuadosSuperiorService
        .obtenerDatosPronunciamientoContiendacompetencia(idActoTramiteCaso)
        .subscribe({
          next: (datos: GenericResponseModel<DatosPronunciamiento>) => {
            if (datos.data === undefined || datos.data === null) {
              return;
            }
            this.datosPronunciamiento = datos.data;
            if (datos.code === 200) {
              this.formularioPronunciamiento.patchValue({
                tipoResultado: this.datosPronunciamiento.tipoResultado,
                fechaDisposicion: this.datosPronunciamiento.fechaDisposicion
                  ? new Date(this.datosPronunciamiento.fechaDisposicion)
                  : null,
                excluirFiscal: this.datosPronunciamiento.excluirFiscal === '1'
              });
            }
          },
          error: (err) => {
            console.error('Error al obtener los datos de la disposicion: ', err);
          },
        })
    );
  }

  //Obtener datos del pronuncioamiento por fiscal provincial
  private obtenerDisposicionResuelveContiendaProvincial(idActoTramiteCaso: string): void {
    this.subscriptions.push(
      this.contiendaCompetenciaService.obtenerResuelveContienda('', idActoTramiteCaso).subscribe({
        next: datos => {
          this.datosResuelveContienda = datos;
          this.formularioPronunciamiento.patchValue({
            tipoResultado: this.datosResuelveContienda?.idTipoResultado,
            fechaDisposicion: this.datosResuelveContienda?.fechaDisposicion
              ? new Date(this.datosResuelveContienda.fechaDisposicion)
              : null,
            motivo: this.datosResuelveContienda?.idMotivoCompetencia,
            descripcion: this.datosResuelveContienda?.descripcion,
            observaciones: this.datosResuelveContienda?.observaciones,
          });
        },
        error: error => {
          console.error('Error al obtener los datos de la disposicion: ', error);
        }
      })
    );
  }

  private obtenerDatosGenerales(): void {
    this.subscriptions.push(
      this.bandejaTramitesService
        .obtenerDatosPrevisualizarVersion(this.config.data.idDocumentoVersiones)
        .subscribe({
          next: (resp) => {
            this.datos = resp.data;
            if (!this.isEmpty(this.datos.idNode)) {
              this.previsualizarTramitePDF(
                this.datos.idNode,
                this.datos.nombreDocumento
              );
            } else {
              this.documentoRuta = null;
            }
          },
          error: () => {
            console.log('ocurrio un error al obtener los datos del documento')
          },
        }));
  }

  private previsualizarTramitePDF(
    idNode: string,
    nombreDocumento: string
  ): void {
    // validar si el documento es pdf
    if (this.esPdf(nombreDocumento)) {
      this.setDocumentRoute(
        this.dataService.getArchivoUrl(idNode, nombreDocumento)
      );
    } else {
      // Obtener el documento si no es pdf
      this.obtenerDocumentoAPrevisualizar(idNode, nombreDocumento);
    }
  }

  private obtenerDocumentoAPrevisualizar(
    idNode: string,
    nombreDocumento: string
  ): void {
    this.subscriptions.push(
      this.bandejaTramitesService
        .previsualizarTramitePDF(idNode, nombreDocumento)
        .subscribe({
          next: (response) => {
            this.setDocumentRoute(
              this.createBlobUrl(response, 'application/pdf')
            );
          },
          error: (error) => {
            this.documentoRuta = null;
          },
        }));
  }

  private setDocumentRoute(url: string): void {
    this.documentoRuta = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private createBlobUrl(data: BlobPart, type: string): string {
    const blob = new Blob([data], { type });
    return URL.createObjectURL(blob);
  }

  private esPdf(filename: string): boolean {
    return /\.pdf$/i.test(filename);
  }

  protected eventoCerrarModal() {
    this.referenciaModal.close();
  }

  private isEmpty(value: any): boolean {
    return (
      value == null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  }

}
