import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListaSujetosProcesales } from '@core/interfaces/comunes/terminacion-anticipada';
import { TerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preliminar/terminacion-anticipada/terminacion-anticipada.service';
import { TERMINACION_ANTICIPADA } from '@core/types/efe/provincial/tramites/comun/preparatoria/terminacion-anticipada.type';
import { capitalizedFirstWord } from '@core/utils/string';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil, StringUtil } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sujetos-terminacion-anticipada',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CmpLibModule,
    TableModule,
    RouterLink
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './sujetos-terminacion-anticipada.component.html',
  styleUrl: './sujetos-terminacion-anticipada.component.scss'
})
export class SujetosTerminacionAnticipadaComponent {

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly subscriptions: Subscription[] = []

  protected readonly dialogRef = inject(DynamicDialogRef)

  private readonly terminacionAnticipadaService = inject(TerminacionAnticipadaService)

  protected readonly stringUtil =  inject(StringUtil)

  private readonly config = inject(DynamicDialogConfig)

  protected readonly iconUtil = inject(IconUtil)

  protected idActoTramiteCaso!: string

  protected idCaso!: string

  public numeroCaso!: string

  public etapa!: string

  public modoLectura!: boolean

  public idTramite!:string

  public listaIdSujeroCaso!: string[]

  protected listaSujetosProcesales: ListaSujetosProcesales[] = []

  protected sujetosProcesalesSeleccionados: ListaSujetosProcesales[] = [];

  protected mostrarAlertaSujeto : boolean = true

  protected sujetosProcesalesSeleccionadosIds!: string[]

  constructor() {
    this.idCaso = this.config.data.idCaso
    this.idActoTramiteCaso = this.config.data.idActoTramiteCaso
    this.numeroCaso = this.config.data.numeroCaso
    this.etapa = this.config.data.etapa
    this.sujetosProcesalesSeleccionadosIds = this.config.data.sujetosProcesalesSeleccionadosIds
    this.modoLectura = this.config.data.modoLectura
    this.idTramite = this.config.data.idTramite
  }

  ngOnInit(): void {
    this.listarSujetosProcesales();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected listarSujetosProcesales() : void {
    this.subscriptions.push(
      this.terminacionAnticipadaService.listarSujetosProcesales(this.idCaso,this.idActoTramiteCaso).subscribe({
        next: resp => {
          if (resp?.length) {
            this.listaSujetosProcesales = resp as ListaSujetosProcesales[];
            this.sujetosProcesalesSeleccionados = this.listaSujetosProcesales.filter(sujeto =>
              this.sujetosProcesalesSeleccionadosIds.includes(sujeto.idSujetoCaso)
            );
          }
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar listar los sujetos procesales`, 'Aceptar')
          this.dialogRef.close()
        }
      })
    )
  }

  protected mostrarDelitos(delito: any): string {
      if (delito && Object.keys(delito).length > 0) {
        return Object.values(delito)
          .map((item: any) => capitalizedFirstWord(item.toString()))
          .join(' / ');
      } else {
        return '-';
      }
  }
  protected obtenerUrlSujetos(): string {
    return `${'/app/administracion-casos/consultar-casos-fiscales/[ETAPA]/cuaderno-incidental/[CASO]/sujeto'
      .replace('[CASO]', this.idCaso)
      .replace('[ETAPA]', this.etapa)}`
  }

  protected guardarSujetos(){
    const listaIdSujetosCaso: string[] = this.sujetosProcesalesSeleccionados.map(s => s.idSujetoCaso)
    this.dialogRef.close(listaIdSujetosCaso);
  }

protected get mensajesPorTramite(): { superior: string; inferior: string } {
  const superiorMensajes: Record<string, string> = {
    [TERMINACION_ANTICIPADA.ID_TRAMITE_SOLICITUD]:
      "Seleccione los sujetos procesales que realizarán la solicitud de terminación anticipada.",
    [TERMINACION_ANTICIPADA.ID_TRAMITE_CITACION]:
      "Seleccione los sujetos procesales para la citación a reunión para acuerdo provisional",
    [TERMINACION_ANTICIPADA.ID_TRAMITE_REPROGRAMACION]:
      "Lista de sujetos procesales a los que se reprogramará la citación para acuerdo de terminación anticipada",
    [TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_ACUERDO]:
      "Seleccione los sujetos procesales que aceptaron el acuerdo de terminación anticipada",
    [TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_NO_ACUERDO]:
      "Seleccione los sujetos procesales que no aceptaron el acuerdo de terminación anticipada",
  };

  const inferiorMensajes: Record<string, string> = {
    [TERMINACION_ANTICIPADA.ID_TRAMITE_SOLICITUD]:
      "Las partes procesales pueden presentar su solicitud ante la fiscalía o ante el poder judicial",
    [TERMINACION_ANTICIPADA.ID_TRAMITE_CITACION]:
      "Como fiscal, podrá registrar la citación a reunión para acuerdo provisional de terminación anticipada",
    [TERMINACION_ANTICIPADA.ID_TRAMITE_REPROGRAMACION]:
      "Como fiscal, podrá registrar la reprogramación de citación a reunión para acuerdo provisional de terminación anticipada",
    [TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_ACUERDO]:
      "Como fiscal, podrá registrar el acta de acuerdo provisional de terminación anticipada",
    [TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_NO_ACUERDO]:
      "Como fiscal, podrá registrar a los sujetos procesales que no aceptaron el acuerdo provisional de terminación anticipada",
  };

  const defaultMensaje = "Ha seleccionado los sujetos procesales para el trámite";

  return {
    superior: superiorMensajes[this.idTramite] || defaultMensaje,
    inferior: inferiorMensajes[this.idTramite] || defaultMensaje
  };
}
}
