
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { Subscription } from 'rxjs';
import { MaestroService } from '@services/shared/maestro.service';
//import { GenericosComponent } from "@modulos/efe/provincial/tramites/genericos/genericos.component";
import { ButtonModule } from "primeng/button";
import { TramiteProcesal } from '@interfaces/comunes/tramiteProcesal';
import { MaestroInterface } from '@interfaces/comunes/maestro-interface';
import { obtenerIcono } from '@utils/icon';
import { ReusableBuscarTramites } from '@services/reusables/reusable-buscar-tramites.service';
import { TramitesGenericosService } from '@services/provincial/tramites/genericos/tramites-genericos.service';
import { TramiteGenerico } from '@interfaces/provincial/tramites/genericos/tramite-generico.interface';
import { RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import {InputTextModule} from "primeng/inputtext";
import {Casos} from "@services/provincial/consulta-casos/consultacasos.service";
import {urlConsultaCasoFiscal} from "@utils/utils";
import {Router} from "@angular/router";
@Component({
  standalone: true,
  selector: 'app-modal-consulta-rapida',
  templateUrl: './modal-consulta-rapida.component.html',
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    MessagesModule,
    ButtonModule,
    InputTextModule
  ],
  providers: [DialogService,NgxCfngCoreModalDialogService],
})
export class ModalConsultaRapidaComponent implements OnInit {

  private readonly suscripciones: Subscription[] = [];
  protected actosProcesales: MaestroInterface[] = [];
  protected tramites: TramiteProcesal[] = [];
  numeroCaso: string = '';

  public obtenerIcono = obtenerIcono
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private tramitesGenericosService: TramitesGenericosService,
    private maestroService: MaestroService,
    private buscarTramitesService: ReusableBuscarTramites,
    private dialogService: DialogService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private casoService: Casos,
    private fb: FormBuilder,
    private readonly router: Router,
  ) {
  }

  ngOnInit() {
  }

  buscar() {
    this.casoService.consultaRapida(this.numeroCaso).subscribe({
      next: (resp: any) => {
        if (resp.code === 200 && resp.data) {
          const ruta = `${urlConsultaCasoFiscal({ idEtapa: resp.data.idEtapa, idCaso: resp.data.idCaso, flgConcluido: '0' })}/acto-procesal`;
          this.router.navigate([`${ruta}`]).then(() => {
            window.location.reload();
          });
        }
      },
      error: () => {
        this.modalDialogService.error("ERROR", "Error al consultar caso", 'Aceptar');
      },
    })
  }


}
