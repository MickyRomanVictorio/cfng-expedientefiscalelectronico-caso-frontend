import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BandejaContiendasService } from '@core/services/provincial/bandeja-contiendas/bandeja-contiendas.service';
import { BandejaActualizarContiendaRequest } from '@interfaces/provincial/bandeja-contiendas/BandejaActualizarContiendas';
import { ContiendaCompetenciaService } from '@services/provincial/tramites/comun/calificacion/contienda-competencia/contienda-competencia.service';
import { MaestroService } from '@services/shared/maestro.service';
import { obtenerIcono } from '@utils/icon';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-actualizar-informacion-contienda',
  templateUrl: './actualizar-informacion-contienda.component.html',
  imports: [
    CommonModule,
    CmpLibModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
  ],
  providers: [NgxCfngCoreModalDialogService],
})
export class ActualizarInformacionContiendaComponent implements OnInit {
  public obtenerIcono = obtenerIcono;
  public formActualizar!: FormGroup;
  private idCaso;
  private idBandejaElevacion;
  private coEntidad;
  private idTipoEntidad;
  private subscriptions: Subscription[] = [];
  protected listaPresidencia: any[] = [];
  protected listaFiscaliasSuperiores: any[] = [];
  protected listaFiscalesAsignados: any[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private maestrosService: MaestroService,
    private contiendaCompetenciaService: ContiendaCompetenciaService,
    private bandejaContiendasService: BandejaContiendasService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
  ) {
    this.idCaso = this.config.data.idCaso;
    this.idBandejaElevacion = this.config.data.idBandejaElevacion;
    this.coEntidad = this.config.data.coEntidad;
    this.idTipoEntidad = this.config.data.idTipoEntidad;
    console.log('idCaso = ', this.idCaso);
    console.log('idBandejaElevacion = ', this.idBandejaElevacion);
    console.log('coEntidad = ', this.coEntidad);
    console.log('idTipoEntidad = ', this.idTipoEntidad);
    this.listaPresidencia = [
      {
        id: '1',
        nombre: this.config.data.presidencia
      }
    ];
    console.log('listaPresidencia = ', this.listaPresidencia);
  }

  ngOnInit() {
    this.formBuild();
    this.getPresidencia();
    this.getFiscaliaSuperior();
  }

  private formBuild(): void {
    this.formActualizar = this.fb.group({
      idPresidencia: [null, Validators.required],
      idFiscaliaSuperior: [null, Validators.required],
      idFiscalAsignado: [null, Validators.required],
    });
  }

  private getPresidencia(): void {
    console.log('PRESDIENDCIA');
    this.maestrosService
      .listarPresidencia(this.coEntidad, this.idTipoEntidad)
      .subscribe({
        next: (resp) => {
          this.listaPresidencia.push(resp);
          this.formActualizar.get('idPresidencia')!.setValue(this.listaPresidencia[0].id);
          this.formActualizar.get('idPresidencia')!.disable();
        },
        error: (error) => {
          this.listaPresidencia = [];
        },
      });
  }

  private getFiscaliaSuperior(): void {
    this.maestrosService
      .listarFiscaliaSuperior(this.coEntidad, this.idTipoEntidad)
      .subscribe({
        next: (resp) => {
          this.listaFiscaliasSuperiores = resp;
        },
        error: (error) => {
          this.listaFiscaliasSuperiores = [];
        },
      });
  }

  public validarFiscalAsignado(event: any): void {
    this.getFiscalAsignado(event.id, event.idTipoEntidad);
    console.log(event);
  }

  private getFiscalAsignado(coEntidad: string, idTipoEntidad: number): void {
    this.maestrosService
      .listarFiscalesAsignados(coEntidad, idTipoEntidad)
      .subscribe({
        next: (resp) => {
          this.listaFiscalesAsignados = resp;
        },
        error: (error) => {
          this.listaFiscalesAsignados = [];
        },
      });
  }

  close() {
    this.ref.close();
  }

  public verificarProcedenteImprocedente(): void {
    this.subscriptions.push(
      this.bandejaContiendasService
        .verificarProcedenteImprocedente(this.idBandejaElevacion)
        .subscribe({
          next: (resp) => {
            if (resp.message === 'EXISTE') {
              this.modalDialogService.error(
                'No se puede editar el destino',
                'Este caso ya tiene registrado un trámite de improcedencia o procedencia de contienda de competencia registrada, por lo que no se puede editar el destino',
                'Aceptar',

              ).subscribe((resp: string) => {
                if (resp === 'confirmado') {
                  this.ref.close('confirm');
                }
              });
            } else {
              this.actualizar();
            }
          },
          error: (error) => {
            console.error(error);
          },
        })
    );
  }

  public actualizar() {
    let body: BandejaActualizarContiendaRequest = {
      idCaso: this.idCaso,
      idBandejaElevacion: this.idBandejaElevacion,
      codigoEntidad: this.formActualizar.get('idFiscaliaSuperior')!.value.id,
      idTipoEntidad: this.formActualizar.get('idFiscaliaSuperior')!.value.idTipoEntidad,
      idFiscal: this.formActualizar.get('idFiscalAsignado')!.value,
    };
    this.subscriptions.push(
      this.contiendaCompetenciaService
        .actualizarInformacionContienda(body)
        .subscribe({
          next: (resp) => {

            this.ref.close('confirm');

            this.modalDialogService
              .success(
                'Fiscalía asignada actualizada',
                'Se actualizó correctamente la fiscalía asignada para esta contienda',
                'Aceptar'
              )

          },
          error: (error) => {
            console.error(error);
          },
        })
    );
  }
}
