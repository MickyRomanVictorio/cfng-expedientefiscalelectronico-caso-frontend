import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { validateMessageService } from '@core/services/provincial/tramites/validateMessage.service';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO, IconAsset, IconUtil } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { Message } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { agruparPorLlave } from '@core/utils/utils';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { capitalizedFirstWord } from '@core/utils/string';
import { ApelacionesResultadosService } from '@core/services/provincial/tramites/especiales/registrar-resultado-audiencia/fundada-procedente/apelaciones-resultados.service';
import { ID_N_RSP_APELACION } from '@core/types/efe/provincial/tramites/especial/respuesta-apelacion.type';
import { ID_N_TIPO_APELACION_SUJETO } from '@core/types/efe/provincial/tramites/especial/tipo-apelacion-sujeto.type';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';
import { ApelacionFiscaliaComponent } from '../apelacion-fiscalia/apelacion-fiscalia.component';
import { ResolucionAutoResuelveTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preparatoria/resolucion-auto-resuelve-ta.service';
import { Apelacion, ListaApelaciones, ListaSujetosRC } from '@core/interfaces/provincial/tramites/comun/preparatoria/resolucion-auto-resuelve-ta';
import { UpperCaseInputModule } from '@core/directives/uppercase-input.module';


@Component({
  selector: 'app-fundado-procedente',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CmpLibModule,
    DropdownModule,
    MessagesModule,
    TableModule,
    UpperCaseInputModule,
    ApelacionFiscaliaComponent
  ],
  templateUrl: './fundado-procedente.component.html',
  styleUrl: './fundado-procedente.component.scss'
})
export class FundadoProcedenteComponent implements OnInit, OnDestroy {

  @Input() data!: any;
  @Input() modoLectura!: boolean;

  public subscriptions: Subscription[] = [];

  ID_DENIEGA_APELACION: number = 1024;
  COLUMNA_INPUTADO: string = 'Imputado';
  COLUMNA_AGRAVIADO: string = 'Agraviado';
  COLUMNA_ACTOR_CIVIL: string = 'Actor Civil';

  agruparPorLlave = agruparPorLlave;

  idActoTramiteCaso!: string;
  idCaso!: string;

  formReparacionCivil: FormGroup;
  formPenas: FormGroup;

  listaReparacionCivil: any = [];

  listaDeudores: ListaSujetosRC[] = [];
  listaAcreedores: ListaSujetosRC[] = [];

  verInformacionSujetos: boolean = false;

  lstSujetosApelantes: any = [];

  listaSujetoProcesalDelitoPena: any = [];

  listaApelacionReparacionCivil: any = [];
  listaApelacionPena: ListaApelaciones[] = [];

  listaImputadosPena: any = [];

  message: Message[] = [];
  messageRC: Message[] = [];
  messagePenas: Message[] = [];

  showMessage: boolean = false;
  showMessageRC: boolean = false;
  showMessagePenas: boolean = false;
  tipoReparacionCivil: string = '';

  capitalizedFirstWord = capitalizedFirstWord;

  constructor(
    private readonly tramiteService: TramiteService,
    private readonly validateMessageService: validateMessageService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    protected iconAsset: IconAsset,
    protected iconUtil: IconUtil,
    private dialogRef: DynamicDialogRef,
    private apelacionesResultadosService: ApelacionesResultadosService,
    private resolucionAutoResuelve: ResolucionAutoResuelveTerminacionAnticipadaService,
    private fb: FormBuilder,

  ) {
    this.formReparacionCivil = this.fb.group({
      reparacionCivil: ['', [Validators.required]],
      sujetoApelo: ['', [Validators.required]],
      resultadoApelacion: [ID_N_RSP_APELACION.CONSENTIDO]
    });

    this.formPenas = this.fb.group({
      imputado: ['', [Validators.required]],
      delito: ['', [Validators.required]],
      sujetoApelo: ['', [Validators.required]],
      resultadoApelacion: [ID_N_RSP_APELACION.CONSENTIDO, [Validators.required]],
    });
  }

  ngOnInit() {    
    this.idActoTramiteCaso = this.data?.idActoTramiteCaso;
    this.idCaso = this.data?.idCaso;
    this.iniciarDatos();

    if (this.modoLectura ) {
      this.formReparacionCivil.disable()
      this.formPenas.disable()
    }
  }

  validarMessageValidateFiscaliaSuperior(codigo: string): void {
    if (codigo === '') {
      this.showMessage = true;
    } else {
      this.showMessage = false;
    }
    this.validateMessageService.cambiarValidacion(this.showMessage);
  }


  iniciarDatos() {
    this.listarImputadosPenaCombo();

    this.listaSujetosApelantesCombo();
    this.listarReparacionCivilApeladaCombo();

    setTimeout(() => {
      this.listarApelacionesReparacionCivil();
      this.listarApelacionesPenas();
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  listarDelitosPorSujetoProcesal(idSujetoCaso: string) {
    this.subscriptions.push(
      this.resolucionAutoResuelve.listarDelitosSujeto(idSujetoCaso).subscribe({
        next: resp => {
          this.listaSujetoProcesalDelitoPena = resp.data
        }
      })
    )
  }

  listarImputadosPenaCombo() {
    this.subscriptions.push(
      this.resolucionAutoResuelve.listarImputados(this.idCaso).subscribe({
        next: resp => {
          this.listaImputadosPena = resp.data
        }
      })
    )
  }

  listaSujetosApelantesCombo() {
    this.subscriptions.push(
      this.resolucionAutoResuelve.listarApelantes(this.idCaso).subscribe({
        next: (resp) => {
          this.lstSujetosApelantes = resp.data;
        },
      })
    );
  }


  listarReparacionCivilApeladaCombo() {
    this.subscriptions.push(
      this.apelacionesResultadosService.listaReparacionCivilApelada(this.idActoTramiteCaso).subscribe({
        next: (resp) => {
          this.listaReparacionCivil = resp.data;
        },
      })
    );
  }

  listarApelacionesReparacionCivil() {
    this.listaApelacionReparacionCivil = [];
    this.subscriptions.push(
      this.resolucionAutoResuelve.listarApelaciones(this.idActoTramiteCaso, ID_N_TIPO_APELACION_SUJETO.REPARACION_CIVIL).subscribe({
        next: (resp) => {
          if (resp?.code === 200) {
            this.listaApelacionReparacionCivil = resp?.data;
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar listar las apelaciones realizadas a las salidas alternas", 'Aceptar');
        }
      })
    );
  }

  listarReparacionCivil(event: any) {
    this.verInformacionSujetos = false;
    this.listaDeudores = [];
    this.listaAcreedores = [];

    if (event) {
      this.subscriptions.push(
        this.resolucionAutoResuelve.listaSujetosReparacionCivil(this.idActoTramiteCaso, event).subscribe({
          next: (resp) => {
            if (resp.code == 200) {
              this.verInformacionSujetos = true;
              this.listaDeudores = resp.data.filter(d => d.idTipoParteSujeto === 17 || d.idTipoParteSujeto === 4)
              this.listaAcreedores = resp.data.filter(d => d.idTipoParteSujeto === 1 || d.idTipoParteSujeto === 5)
              this.tipoReparacionCivil = this.obtenerReparacionCivil(resp.data);
            }
          },
          error: () => {
            this.modalDialogService.error("ERROR", "Error al mostrar la información de la Reparación Civil", 'Aceptar');
          }
        })
      );
    }
  }

  obtenerReparacionCivil(sujetos: any): string {
    // Filtrar solo los objetos con el campo 'nombre' y agrupar los valores únicos
    const valor = [
      ...new Set(
        sujetos
          .filter((item: any) => typeof item === 'object' && item.noTipoReparacionCivil) // Declarar `item` como `any`
          .map((item: any) => item.noTipoReparacionCivil)
      )
    ];

    return valor.join('');
  }

  get obtenerCodigoReparacionCivil() {
    let idReparacion = this.formReparacionCivil.get("reparacionCivil")?.value;
    return this.listaReparacionCivil.find((item: any) => item.idReparacion === idReparacion)?.codigoReparacion || '';
  }

  listarApelacionesPenas() {
    this.listaApelacionPena = [];
    this.subscriptions.push(
      this.resolucionAutoResuelve.listarApelaciones(this.idActoTramiteCaso, ID_N_TIPO_APELACION_SUJETO.PENAS).subscribe({
        next: (resp) => {
          this.listaApelacionPena = resp.data;
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar listar las apelaciones a las penas", 'Aceptar');
        }
      })
    );
  }

  guardarReparacionCivilApelado() {
    const sujeto: string = this.formReparacionCivil.get("sujetoApelo")?.value;
    const sujetoDatos = this.lstSujetosApelantes.find((item: any) => item.idSujetoCaso === sujeto);
    const nombreSujeto: number = sujetoDatos.nombreSujeto;
    const idTipoParteSujeto: number = sujetoDatos.idTipoParteSujeto;
    const idReparacion: string = this.formReparacionCivil.get("reparacionCivil")?.value;

    if (this.validacionSalidasAlternasExiste(idReparacion, sujeto)) {
      this.messageRC = [
        {
          severity: 'error',
          summary: '',
          detail: 'El sujeto procesal: ' + nombreSujeto + ', ya tiene un registro de apelación para la reparación civil ' + this.obtenerCodigoReparacionCivil + ', por favor seleccione otro sujeto u otra reparación civil',
          icon: 'pi-info-circle icon-color'
        },
      ];
      this.showMessageRC = true;
      return;
    }

    const request: Apelacion = {
      idTipoApelacion: ID_N_TIPO_APELACION_SUJETO.REPARACION_CIVIL,
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: sujeto,
      idRspInstancia: ID_N_RSP_APELACION.CONSENTIDO,
      idTipoParteSujeto: idTipoParteSujeto,
      idTipoReparacionCivil: idReparacion
    }

    this.subscriptions.push(
      this.resolucionAutoResuelve.registrarApelacion(request).subscribe({
        next: resp => {
          if (resp?.code == 200) {
            this.modalDialogService.success("Éxito", 'Apelación registrada', 'Aceptar');
            this.listarApelacionesReparacionCivil();
            this.formReparacionCivil.reset();
            this.listaAcreedores = [];
            this.listaDeudores = [];
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar registrar la apelación realizada a salida alterna", 'Aceptar');
        }
      })
    );
  }

  validacionSalidasAlternasExiste(idReparacion: string, idSujetoCaso: string): boolean {
    return this.listaApelacionReparacionCivil.some((item: any) =>
      item.idSujetoCaso === idSujetoCaso && item.idReparacion === idReparacion
    );
  }

  guardarPenaApelada() {
    let form = this.formPenas.getRawValue();
    const contraSujetoApelo = this.listaImputadosPena.find((item: any) => item.idSujetoCaso === form.imputado).idActoTramiteSujeto;
    
    if (this.validacionApelacionPenaExiste(form.sujetoApelo, contraSujetoApelo, form.delito)) {
      this.messagePenas = [
        {
          severity: 'error',
          summary: '',
          detail: 'Seleccione otro sujeto en la opción quien apeló para poder generar el registro',
          icon: 'pi-info-circle icon-color'
        },
      ];
      this.showMessagePenas = true;
      return;
    }

    const sujeto: string = this.formPenas.get("sujetoApelo")?.value;
    const sujetoDatos = this.lstSujetosApelantes.find((item: any) => item.idSujetoCaso === sujeto);
    const idTipoParteSujeto: number = sujetoDatos.idTipoParteSujeto;

    let request: Apelacion = {
      idTipoApelacion: ID_N_TIPO_APELACION_SUJETO.PENAS,
      idTipoParteSujeto: idTipoParteSujeto,
      idActoTramiteCaso: this.idActoTramiteCaso,
      contraQuienApelo: contraSujetoApelo,
      idSujetoCaso: form.sujetoApelo,
      idRspInstancia: ID_N_RSP_APELACION.CONSENTIDO,
      idDelito: form.delito
    }
    this.subscriptions.push(
      this.resolucionAutoResuelve.registrarApelacion(request).subscribe({
        next: (resp: GenericResponse) => {
          if (resp?.code == 200) {
            this.formPenas.reset();
            this.modalDialogService.success('Éxito', 'Apelación registrada', 'Aceptar');
            this.listarApelacionesPenas();
          }
        },
        error: () => {
          this.modalDialogService.error(
            'ERROR',
            'Error al intentar registrar la apelación a la pena',
            'Aceptar'
          );
        },
      })
    );
  }

  validacionApelacionPenaExiste(sujetoApelo: string, contraSujetoApelo: string, delito: string): boolean {
    return this.listaApelacionPena.some((item: any) =>
      item.idSujetoCasoResultado === sujetoApelo && item.idActoTramiteSujeto === contraSujetoApelo &&
      item.delito === delito && item.resultadoApelacion == 'CONCEDE APELACIÓN'
    );
  }

  eliminarRegistroApelado(idApelacionResultado: string, tipoTabla: number) {
    const dialog = this.modalDialogService.question(
      'Eliminar apelación',
      '¿Realmente quiere eliminar este registro de apelación?',
      'Eliminar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.subscriptions.push(
            this.resolucionAutoResuelve.eliminarApelacion(idApelacionResultado).subscribe({
              next: resp => {
                if (resp?.code === 200) {
                  this.modalDialogService.info("Éxito", 'Apelación eliminada correctamente', 'Aceptar');
                  switch (tipoTabla) {
                    case 1:
                      this.listarApelacionesReparacionCivil();
                      break;
                    case 2:
                      this.listarApelacionesPenas();
                      break;
                  }
                }
              },
              error: () => {
                this.modalDialogService.error("ERROR", "Error al intentar eliminar la apelación", 'Aceptar');
              }
            })
          );
        }
      },
    });
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  get tramiteEstadoFirmadoRecibido(): boolean {
    return this.data.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.data.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  protected obtenerDelito(pena: ListaApelaciones): string {
   return  pena.delitoGenerico +'/'+ pena.delitoSubgenerico +'/'+ pena.delitoEspecifico; 
  }

  cancelar() {
    this.dialogRef.close()
  }
}
