import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, tap } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { AcumulacionAsociarCaso } from '@interfaces/provincial/tramites/comun/calificacion/acumulacion-asociar-caso/acumulacion-asociar-caso.interface';
import { ActoProcesalComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/acto-procesal/acto-procesal.component';
import { IconUtil, ID_ETAPA, obtenerCodigoCasoHtml } from 'dist/ngx-cfng-core-lib';
import { Expediente } from '@core/utils/expediente';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { DERIVACIONES } from '@core/types/bandeja/derivaciones.type';
import { ButtonModule } from 'primeng/button';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { AcumulacionAsociarCasoDatos } from '@core/interfaces/provincial/tramites/comun/calificacion/acumulacion-asociar-caso/acumulacion-asociar-caso-datos.interface';
import { AcumulacionAsociarCasoService } from '@core/services/provincial/tramites/comun/calificacion/acumulacion-asociar-caso/acumulacion-asociar-caso.service';

@Component({
  selector: 'app-acumulacion-asociar-caso-modal',
  standalone: true,
  imports: [CommonModule, CmpLibModule, ActoProcesalComponent, ButtonModule],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './acumulacion-asociar-caso-modal.component.html',
  styleUrls: ['./acumulacion-asociar-caso-modal.component.scss'],
})
export class AcumulacionAsociarCasoModalComponent implements OnInit {

  idCaso!:string;

  numeroCaso!: string;

  idActoTramiteCasoUltimo!:string;

  idTramiteAcumulacion!: string;

  idEtapa!: string;

  tituloCaso!:string;

  tituloAcumular!:string;

  tramiteAcumulacion!: TramiteProcesal;

  datosExtraFormulario: AcumulacionAsociarCaso = {};

  datos!: AcumulacionAsociarCasoDatos;

  casoFiscal!: Expediente;

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  readonly suscripciones: Subscription[] = [];

  protected utilIcon: IconUtil = new IconUtil;

  constructor(
    public referenciaModal: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly tramiteService: TramiteService,
    private readonly casoService: Casos,
    protected gestionCasoService: GestionCasoService,
    public acumulacionAsociarCasoService: AcumulacionAsociarCasoService,
    

  ) {
    this.idCaso = config.data.idCaso;
    this.numeroCaso = config.data.numeroCaso;
    this.idEtapa = config.data.idEtapa;
    this.datosExtraFormulario.idBandejaDerivacion = this.config.data.idBandejaDerivacion;
    this.datosExtraFormulario.idCasoAcumulado = this.config.data.idCasoAcumulado;
  }
  get tramiteEstablecido(): boolean {
    return this.tramiteAcumulacion !== undefined;
  }

  ngOnInit(): void {
    this.obtenerDatos(this.datosExtraFormulario!.idBandejaDerivacion!);
    this.establecerTramiteAcumulacion();
  }

  obtenerDatos(idBandejaDerivacion: string) {
    this.suscripciones.push(
      this.acumulacionAsociarCasoService.obtenerDatos(idBandejaDerivacion).subscribe({
        next: resp => {
          this.datos = resp;
          this.tituloCaso=obtenerCodigoCasoHtml(this.numeroCaso);
          this.tituloAcumular=obtenerCodigoCasoHtml(this.datos.codigoCasoAcumular);
        },
        error: error => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar recuperar la información de la acumulación`, 'Ok');
        }
      })
    );
  }

  establecerTramiteAcumulacion() {
    this.idTramiteAcumulacion = this.obtenerIdActoCasoTramiteAcumulacion();
    this.mostrarTramite()
  }

  obtenerIdActoCasoTramiteAcumulacion(): string {
    return this.idEtapa == ID_ETAPA.CALI ? DERIVACIONES.ACUMULACION_TRAMITE_CALIFICACION :
      this.idEtapa == ID_ETAPA.PREL ? DERIVACIONES.ACUMULACION_TRAMITE_PRELIMINAR : DERIVACIONES.ACUMULACION_TRAMITE_PREPARATORIA
  }

  obtenerTramite() {
    this.suscripciones.push(
      this.tramiteService
        .validarExisteUltimoTramiteCaso(this.idCaso, this.idActoTramiteCasoUltimo, this.idTramiteAcumulacion)
        .subscribe({
          next: (resp) => {
            console.log("ESTE ES EL ID CASO")
            console.log(this.idCaso)
            if (resp == false) {
              this.crearTramiteAcumulacion();
            }
            else {
              this.mostrarTramite()
            }
          },
          error: (error) => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar validar el trámite de acumulación`, 'Ok');
          },
        })
    );
  }
  crearTramiteAcumulacion() {
    this.suscripciones.push(
      this.tramiteService.crearTramiteBorrador(this.idCaso, this.idTramiteAcumulacion)
        .subscribe({
          next: (response) => {
            this.suscripciones.push(
              this.casoService.obtenerCasoFiscal(this.idCaso).subscribe({
                next: (resp) => {
                  this.casoFiscal = resp;
                  this.mostrarTramite();
                },
                error: (error) => {
                  this.modalDialogService.error("Error", `Se ha producido un error al intentar buscar la información del caso`, 'Ok');
                },
              })
            )
          },
          error: () => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar validar y crear el trámite de acumulación`, 'Ok');
          }
        })
    )
  }

  mostrarTramite() {
    this.obtenerCasoFiscal(this.idCaso)
    .subscribe({
      next: (resp) => {
        this.suscripciones.push(
          this.tramiteService
            .obtenerActoTramiteEstado(this.idTramiteAcumulacion)
            .subscribe({
              next: (resp) => {
                this.tramiteAcumulacion = resp;
              },
              error: (error) => {
                this.modalDialogService.error("Error", `Se ha producido un error al intentar obtener la información del trámite`, 'Aceptar');
              },
            })
        );
      },
      error: (error) => {
        this.modalDialogService.error("Error", `Se ha producido un error al intentar obtener la información del caso`, 'Aceptar');
      },
    })
  }

  obtenerCasoFiscal(idCaso: string): Observable<any> {
    return this.gestionCasoService.obtenerCasoFiscalV2( idCaso );
  }
}
