
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { Subscription } from 'rxjs';
import { MaestroService } from '@core/services/shared/maestro.service';
import { ButtonModule } from "primeng/button";
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { MaestroInterface } from '@core/interfaces/comunes/maestro-interface';
import { obtenerIcono } from '@core/utils/icon';
import { ReusableBuscarTramites } from '@core/services/reusables/reusable-buscar-tramites.service';
import { TramiteGenerico } from '@core/interfaces/provincial/tramites/genericos/tramite-generico.interface';
import { RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
@Component({
  standalone: true,
  selector: 'app-guardar-tramite-procesal',
  templateUrl: './guardar-tramite-procesal.component.html',
  styleUrls: ['./guardar-tramite-procesal.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    MessagesModule,
    ButtonModule
  ],
  providers: [DialogService,NgxCfngCoreModalDialogService],
})
export class GuardarTramiteProcesalComponent implements OnInit {

  private readonly suscripciones: Subscription[] = [];
  protected actosProcesales: MaestroInterface[] = [];
  protected tramites: TramiteProcesal[] = [];

  protected formularioActoProcesal: FormGroup = new FormGroup({
    actoProcesal: new FormControl(null, [Validators.required,]),
    tramite: new FormControl({ value: null, disabled: true }, [Validators.required,]),
  });

  @Output() onSave = new EventEmitter();

  idActoTramiteCaso?: string;
  idEtapa: string = '';

  tipo: number = 0;
  idCaso: string = '';
  idActoProcesal: number = 0;


  public obtenerIcono = obtenerIcono
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly tramiteService: TramiteService,
    private readonly maestroService: MaestroService,
    private readonly buscarTramitesService: ReusableBuscarTramites,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
    this.idEtapa = this.config.data?.idEtapa;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.tipo = this.config.data?.tipo;
    this.idCaso = this.config.data?.idCaso;
    this.idEtapa = this.config.data?.idEtapa;
    this.idActoProcesal = this.config.data?.idActoProcesal;
  }

  ngOnInit() {
    this.obtenerActosProcesales();
  }

  get formularioValido(): boolean {
    return this.formularioActoProcesal.valid
  }

  private obtenerActosProcesales(): void {
    this.suscripciones.push(
      this.maestroService.obtenerActosProcesales(this.idEtapa)
        .subscribe({
          next: resp => {
            this.actosProcesales = resp.data;
          }
        })
    )
  }

  public alCambiarActoProcesal(): void {
    let idActoProcesal = this.formularioActoProcesal?.get('actoProcesal')?.value;
    this.obtenerTramitesSegunActoProcesal(idActoProcesal);
    this.formularioActoProcesal?.get('tramite')?.enable();
  }

  private obtenerTramitesSegunActoProcesal(idActoProcesal: string): void {
    this.tramites = [];
    this.suscripciones.push(
      this.buscarTramitesService.genericos(this.idEtapa, idActoProcesal).subscribe({
        next: resp => {
          this.tramites = resp;
        }
      })
    )
  }
  guardarDocumentoActoTramite() {
    const dataTramite = this.formularioActoProcesal?.get('tramite')?.value;
    if(this.tipo==2){
      const request: TramiteGenerico = {
        idActoTramiteCaso: this.idActoTramiteCaso,
        idActoTramiteEstado: dataTramite
      }
      this.tramiteService.actualizarEstadoTramite(request).subscribe({
        next: resp => {
          this.modalProcesoCorrecto();
        },
        error: (error) => {
          if ( error.error.code == 500 ) this.modalDialogService.error("ERROR", "Error al intentar actualizar el estado de Trámite", 'Aceptar');
          else this.modalDialogService.warning("Mensaje del sistema", error.error.message, 'Aceptar');     
        },
      })
    }
    else{
      this.onSave.emit(dataTramite);
    }
  }

  private modalProcesoCorrecto(): void {
    const dialog = this.modalDialogService.success("", 'Trámite modificado correctamente', 'Aceptar');
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        this.ref.close(RESPUESTA_MODAL.OK);
        this.onSave.emit(RESPUESTA_MODAL.OK);
      },
    });

  }


}
