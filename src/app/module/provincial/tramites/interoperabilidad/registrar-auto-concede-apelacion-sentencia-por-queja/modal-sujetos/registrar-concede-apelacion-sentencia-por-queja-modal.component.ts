import {Component, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {CapitalizePipe} from '@pipes/capitalize.pipe';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {SharedModule} from 'primeng/api';
import {DropdownModule} from 'primeng/dropdown';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {obtenerIcono} from '@utils/icon';
import {obtenerCasoHtml} from '@utils/utils';
import {Subscription} from 'rxjs';
import {CheckboxModule} from 'primeng/checkbox';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {
  ResolucionAutoResuelveCalificacionSentenciaService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-calificacion-sentencia.service";
import { ReusablesSujetoProcesalService } from '@core/services/reusables/reusable-sujetoprocesal.service';
import {NgIf} from "@angular/common";
import { DialogService } from 'primeng/dynamicdialog';
import { AlertaModalComponent } from '@core/components/modals/alerta-modal/alerta-modal.component';
import {
  ResolucionAutoConcedeApelacionSentenciaPorQuejaService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/concede-apelacion-sentencia-por-queja.service";
import { RecursoApelacionSentenciaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/recurso-apelacion-sentencia.service';

@Component({
  standalone: true,
  selector: 'app-registrar-concede-apelacion-sentencia-por-queja-modal',
  templateUrl: './registrar-concede-apelacion-sentencia-por-queja-modal.component.html',
  styleUrls: ['./registrar-concede-apelacion-sentencia-por-queja-modal.component.scss'],
  imports: [
    CmpLibModule,
    CapitalizePipe,
    SharedModule,
    TableModule,
    DropdownModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    RippleModule,
    NgIf
  ],
})
export class RegistrarAutoConcedeApelacionSentenciaPorQuejaModalComponent implements OnInit, OnDestroy {

  // Propiedades originales
  public tituloCaso: SafeHtml = '';
  protected readonly obtenerIcono = obtenerIcono;
  private idCaso: string = '';
  protected idActoTramiteCaso: string = '';
  protected nuPestana: string = '';
  private subscriptions: Subscription[] = [];
  protected soloLectura: boolean = false;
  protected numeroCaso: string = '';
  protected nuApelacionFiscal: number = 0;

  public listaDelitos: any[] = [ // Dato de ejemplo, debería venir de un servicio
    { id: 1, nombre: 'Delito contra la seguridad pública' },
    { id: 2, nombre: 'Delito contra el patrimonio' },
    { id: 3, nombre: 'Delito contra la vida, el cuerpo y la salud' }
  ];

  protected listaSujetos: any[] = [];
  protected listaSujetosCaso: any[] = [];
  protected listaSujetosConApelacion: any[] = [];

  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private reusablesSujetoProcesalService: ReusablesSujetoProcesalService,
    private sanitizador: DomSanitizer,
    private resolucionAutoResuelveCalificacionSentenciaService: ResolucionAutoResuelveCalificacionSentenciaService,
    private resolucionAutoConcedeApelacionSentenciaPorQuejaService: ResolucionAutoConcedeApelacionSentenciaPorQuejaService,
    private dialogService: DialogService,
      private readonly recursoApelacionSentencia: RecursoApelacionSentenciaService
  ) {}

  ngOnInit(): void {
    this.idCaso = this.config.data?.idCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.nuPestana = this.config.data?.nuPestana;
    this.soloLectura = this.config.data?.soloLectura ?? false;

    this.tituloDelCaso();
    if(!this.soloLectura) this.obtenerSujetosCaso();
    this.obtenerSujetosProcesales();
   // this.obtenerSujetosConDelitos();
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `Caso: ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  private obtenerSujetosCaso(): void {
    this.subscriptions.push(
      this.reusablesSujetoProcesalService
        .getListaSujetoProcesal(this.idCaso)
        .subscribe({
          next: (resp) => {
            this.listaSujetosCaso = resp
              .filter((sujeto: any) => sujeto.datosPersonales && sujeto.datosPersonales.trim() !== '-' && sujeto.datosPersonales.trim() !== '')
              .map((sujeto: any) => ({
                idSujetoCaso: sujeto.idSujetoCaso,
                datosPersonales: sujeto.datosPersonales,
                tipoSujetoProcesal: sujeto.tipoSujetoProcesal,
                nombreCompleto: `${sujeto.datosPersonales} (${sujeto.tipoSujetoProcesal})`
              }));
          },
          error: (error) => {
            console.error('Error al obtener sujetos procesales:', error);
          },
        })
    );
  }

  private obtenerSujetosConDelitos(): void {
    this.subscriptions.push(
      this.resolucionAutoResuelveCalificacionSentenciaService
        .obtenerSujetos(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: any[]) => {
            this.listaSujetos = resp;
            this.listaSujetosConApelacion = [];

            if (this.soloLectura) {
              this.listaSujetosConApelacion = resp.filter(item =>
                item.idActoTramiteCasoGuardado === this.idActoTramiteCaso
              ).sort((a: any, b: any) => {
                const getPriority = (item: any) => {
                  if (item.idResultadoPresentacionQueja === 1059 && item.flApelacionFiscal === 1) return 1;
                  if (item.flApelacionFiscal === 0 && item.idResultadoPresentacionQueja == 1059) return 2;
                  if (item.flApelacionFiscal === 1 && item.idResultadoPresentacionQueja == 1060) return 3;
                  return 4;
                };

                const priorityA = getPriority(a);
                const priorityB = getPriority(b);

                if (priorityA !== priorityB) {
                  return priorityA - priorityB;
                }
                // Si tienen la misma prioridad, mantener el orden original


                return 0;
              });
            } else {
              this.listaSujetosConApelacion = resp.filter(item =>
                item.idResultadoCalificacionApelacion !== null && item.idResultadoCalificacionApelacion > 0
              ).sort((a: any, b: any) => {
                const getPriority = (item: any) => {
                  if (item.idResultadoPresentacionQueja === 1059 && item.flApelacionFiscal === 1) return 1;
                  if (item.flApelacionFiscal === 0 && item.idResultadoPresentacionQueja == 1059) return 2;
                  if (item.flApelacionFiscal === 1 && item.idResultadoPresentacionQueja == 1060) return 3;
                  return 4;
                };

                const priorityA = getPriority(a);
                const priorityB = getPriority(b);

                if (priorityA !== priorityB) {
                  return priorityA - priorityB;
                }
                // Si tienen la misma prioridad, mantener el orden original


                return 0;
              });
            }
            this.nuApelacionFiscal  = this.listaSujetosConApelacion.filter(item => item.flApelacionFiscal === 1).length;
          },
          error: (error: any) => {
            console.error('Error al obtener sujetos y delitos:', error);
          },
        })
    );
  }

  public cerrarModal(): void {
    this.dialogRef.close(); // Cierra sin devolver datos
  }

  cancelar(): void {
    this.cerrarModal();
  }

  aceptar(): void {
    const sujetosParaEnviar = this.listaSujetosConApelacion
      .filter(item => (item.idActoTramiteCasoGuardado === this.idActoTramiteCaso || item.idActoTramiteCasoGuardado === null)
        && item.checkResultadoRecursoQuejaSeleccionar !== null && item.checkResultadoRecursoQuejaSeleccionar === true);

    const payload = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetos: sujetosParaEnviar
    };

    this.resolucionAutoConcedeApelacionSentenciaPorQuejaService.registrarSujetos(payload).subscribe({
      next: () => {
        this.dialogService.open(AlertaModalComponent, {
          data: {
            icon: 'success',
            title: 'Éxito',
            description: 'Sujetos guardados correctamente',
            confirmButtonText: 'Aceptar',
            confirm: true,
          },
          showHeader: false,
        });
        this.dialogRef.close({
          flCheckModal: this.getTotalSujetosSeleccionados() > 0,
          flElevacionSuperior: this.getTotalSujetosSeleccionados() > 0,
        });
      },
      error: (error) => {
        this.dialogService.open(AlertaModalComponent, {
          data: {
            icon: 'error',
            title: 'Error',
            description: error?.error?.message || 'Ocurrió un error al guardar los sujetos',
            confirmButtonText: 'Aceptar',
            confirm: true,
          },
          showHeader: false,
        });
      }
    });
  }

  getTotalSujetosSeleccionados() {
    return this.listaSujetosConApelacion.filter(
      (sujeto) =>
        sujeto.checkResultadoRecursoQuejaSeleccionar != null &&
        sujeto.checkResultadoRecursoQuejaSeleccionar === true &&
        (sujeto.idActoTramiteCasoGuardado == null ||
          sujeto.idActoTramiteCasoGuardado == this.idActoTramiteCaso)
    ).length;
  }

  esEditable(item: any): boolean {
    if (this.soloLectura) return false;
    if (item.idActoTramiteCasoGuardado && item.idActoTramiteCasoGuardado !== this.idActoTramiteCaso) return false;
    return true;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  showBtnAceptar() {
    return !this.soloLectura && !(
      this.listaSujetosConApelacion.some(item =>
        (item.idActoTramiteCasoGuardado === this.idActoTramiteCaso || item.idActoTramiteCasoGuardado === null) &&
        (item.idResultadoCalificacionApelacion === 0 || item.idResultadoCalificacionApelacion === null) && item.flApelacionFiscal === 0
      )
    );
  }
private obtenerSujetosProcesales(): void {
    this.listaSujetos = [];
    this.subscriptions.push(
      this.recursoApelacionSentencia
        .obtenerResultadosSentencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            console.log('Respuesta de obtenerResultadosSentencia:', resp);
            this.listaSujetos = resp
              .map((sujeto: any) => ({
                ...sujeto,
                sujetoSelected: false,
                selection: false,
                desactivoPenaReparacionCivil:
                  sujeto.idPetitorio === 1502 || sujeto.idPetitorio === 0
                    ? true
                    : false,
                //  flApelacionPena: (sujeto.idPetitorio === 1502 || sujeto.idPetitorio === 0) ? '0' : '1',
              }))
              .sort((a: any, b: any) => {
                // Mostrar primero los elementos con estadoQueja igual a null o 0

                // Ordenar por idTipoRespuestaInstancia1: 1048 primero, luego 1492, y luego el resto
                //  const order = [1024 , 1062];
                // Priorizar por idTipoRespuestaInstancia1 = 1048
                const getPriority = (item: any) => {
                  if (item.flApelacionFiscal =='1' && item.idTipoRespuestaQueja===1059) return 1;
                  if (item.flApelacionFiscal =='0' && item.idTipoRespuestaQueja===1059) return 2;
                  return 3;
                };

                const priorityA = getPriority(a);
                const priorityB = getPriority(b);

                if (priorityA !== priorityB) {
                  return priorityA - priorityB;
                }
                // Si tienen la misma prioridad, mantener el orden original

                return 0;
              });
            this.listaSujetos = resp;
            this.listaSujetosConApelacion = [];

            if (this.soloLectura) {
              this.listaSujetosConApelacion = resp.filter(
                (item:any) =>
                  item.idActoTramiteCasoGuardado === this.idActoTramiteCaso
              );
            } else {
              this.listaSujetosConApelacion = resp.filter(
                (item: any) =>
                  item.idActoTramiteCasoGuardado !== null ||
                  item.flApelacionFiscal == 1
              );

            }

            this.nuApelacionFiscal = this.listaSujetosConApelacion.filter(
              (item) => item.flApelacionFiscal === 1
            ).length;
           // this.calcularCabecera();
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

}
