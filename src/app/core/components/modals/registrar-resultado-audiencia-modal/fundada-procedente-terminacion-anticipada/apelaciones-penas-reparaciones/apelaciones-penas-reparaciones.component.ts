import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';
import { ApelacionRequest } from '@core/interfaces/provincial/tramites/fundado-procedente/apelacion';
import { ApelacionPena } from '@core/interfaces/provincial/tramites/fundado-procedente/apelaciones-penas';
import { ApelacionesProcesoInmediato } from '@core/interfaces/provincial/tramites/fundado-procedente/apelaciones-proceso-inmediato';
import { ApelacionesResultadosService } from '@core/services/provincial/tramites/especiales/registrar-resultado-audiencia/fundada-procedente/apelaciones-resultados.service';
import { validateMessageService } from '@core/services/provincial/tramites/validateMessage.service';
import { RegistrarPenasService } from '@core/services/reusables/otros/registrar-penas.service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { ID_N_RSP_APELACION } from '@core/types/efe/provincial/tramites/especial/respuesta-apelacion.type';
import { ID_N_TIPO_APELACION_SUJETO } from '@core/types/efe/provincial/tramites/especial/tipo-apelacion-sujeto.type';
import { capitalizedFirstWord } from '@core/utils/string';
import { agruparPorLlave, limpiarFormcontrol } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { Constants, IconUtil } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { Message, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { catchError, Observable, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-apelaciones-penas-reparaciones',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CmpLibModule,
    TableModule,
    CommonModule,
    ButtonModule,
    DropdownModule,
    MessagesModule
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './apelaciones-penas-reparaciones.component.html',
  styleUrl: './apelaciones-penas-reparaciones.component.scss'
})
export class ApelacionesPenasReparacionesComponent implements OnInit, OnDestroy {
  @Input() data!: any;

  /**
   * 🔘 **Variable de valor booleano***
   * - **Nota:** Si es verdadero no permitirá hacer ninguna accion de registro, edición y eliminación
   */
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
  formProcesoInmediato: FormGroup;
  listaReparacionCivil: any = [];
  infoSujetosReparacionCivil: any = null;
  lstSujetosApelantes: any = [];
  lstResultadoApelaciones: any = [];
  lstQueja: any = [
    { nombre: "NO", id: 0 },
    { nombre: "SI", id: 1 }
  ];

  listaSujetoProcesalPena: any = [];
  listaSujetoProcesalDelitoPena: any = [];
  listaApelantes: any = [];

  listaApelacionReparacionCivil: any = [];
  listaApelacionPena: any = [];
  listaProcesoInmediato: any = [];
  codDependencia!: string;
  fiscaliasPronvinciales: SelectItem[] = [];
  validGuardarFiscaliaSuperior: boolean = false;
  fiscaliaApelacionControl = new FormControl('');
  codDependenciaApelacion: string = "";
  listaAgraviadosCiviles:any=[];
  listaImputadosPena:any=[];

  message: Message[] = [];
  messageRC: Message[] = [];
  messagePenas: Message[] = [];
  messageProcesoInmediato: Message[] = [];
  showMessage: boolean = false;
  showMessageRC: boolean = false;
  showMessagePenas: boolean = false;
  showMessageProcesoInmediato: boolean = false;
  tipoReparacionCivil: string = '';
  capitalizedFirstWord = capitalizedFirstWord;

  constructor(
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private maestrosService: MaestroService,
    private registrarPenasService: RegistrarPenasService,
    private apelacionesResultadosService: ApelacionesResultadosService,
    private validateMessageService: validateMessageService,
    private fb: FormBuilder,
    protected iconUtil: IconUtil
  ) {
    this.formReparacionCivil = this.fb.group({
      reparacionCivil: ['', [Validators.required]],
      sujetoApelo: ['', [Validators.required]],
      resultadoApelacion: ['', [Validators.required]],
      queja: [null],
    });

    this.formPenas = this.fb.group({
      imputado: ['', [Validators.required]],
      delito: ['', [Validators.required]],
      sujetoApelo: ['', [Validators.required]],
      resultadoApelacion: ['', [Validators.required]],
      queja: [null],
    });
    this.formProcesoInmediato = this.fb.group({
      sujetoApelo: ['', [Validators.required]],
      resultadoApelacion: ['', [Validators.required]],
      queja: [null],
    });
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);
    this.codDependencia = decodedToken.usuario.codDependencia;
  }

  ngOnInit() {
    this.idActoTramiteCaso = this.data?.idActoTramiteCaso;
    this.idCaso = this.data?.idCaso;
    this.iniciarDatos();
  }

  validarMessageValidateFiscaliaSuperior(codigo:string): void{
    if(codigo === ''){
      this.showMessage = true;
    }else{
      this.showMessage = false;
    }
    this.validateMessageService.cambiarValidacion(this.showMessage);
  }

  obtenerMessageValidateFiscaliaSuperior(): void {
    this.message = [
      {
        severity: 'error',
        summary: '',
        detail:
          'Selecione una fiscalía superior a elevar',
        icon: 'pi-info-circle icon-color'
      },
    ];
  }


  iniciarDatos() {
    this.obtenerMessageValidateFiscaliaSuperior();
    this.obtenerFiscaliasXEntidad();
    this.obtenerApelacionFiscalia();
    this.listarResultadoApelacionesCombo();
    this.listarSujetosProcesalPenaCombo();
    this.listarApelantesCombo();
    this.listarAgraviadosCivilesCombo();
    this.listarImputadosPenaCombo();

    this.listaSujetosApelantesCombo();
    this.listarReparacionCivilApeladaCombo();

    setTimeout(() => {
      this.listarApelacionesReparacionCivil();
      this.listarApelacionesPenas();
      this.listarApelacionesProcesoInmediato();;
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  listarAgraviadosCivilesCombo(){
    this.subscriptions.push(
      this.apelacionesResultadosService.listarApelantesAgraviadosCiviles(this.idCaso).subscribe({
        next: resp => {
          this.listaAgraviadosCiviles = resp.data
        }
      })
    )
  }

  listarSujetosProcesalPenaCombo() {
    this.subscriptions.push(
      this.registrarPenasService.listarSujetos(this.idCaso).subscribe({
        next: resp => {
          this.listaSujetoProcesalPena = resp
        }
      })
    )
  }
  listarDelitosPorSujetoProcesal(sujeto: string) {
    this.subscriptions.push(
      this.apelacionesResultadosService.listarDelitosPorSujetoProcesal(sujeto).subscribe({
        next: resp => {
          this.listaSujetoProcesalDelitoPena = resp.data
        }
      })
    )
  }
  listarApelantesCombo() {
    this.subscriptions.push(
      this.apelacionesResultadosService.listarApelantes(this.idCaso).subscribe({
        next: resp => {
          this.listaApelantes = resp.data
        }
      })
    )
  }
  listarImputadosPenaCombo(){
    this.subscriptions.push(
      this.apelacionesResultadosService.listarApelantesImputadosPena(this.idActoTramiteCaso).subscribe({
        next: resp => {
          this.listaImputadosPena = resp.data
        }
      })
    )
  }
  listarResultadoApelacionesCombo() {
    this.subscriptions.push(
      this.apelacionesResultadosService.resultadoApelaciones().subscribe({
        next: (resp) => {
          this.lstResultadoApelaciones = resp.data.filter((item: any) => item.id !== ID_N_RSP_APELACION.CONSENTIDO);
        },
      })
    );
  }
/**************** */

listaSujetosApelantesCombo() {
  this.subscriptions.push(
    this.apelacionesResultadosService.sujetosApelantes(this.idCaso).subscribe({
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
      this.apelacionesResultadosService.listarApelacionesSalidasAlternas(this.idActoTramiteCaso).subscribe({
        next: (resp) => {
          if (resp?.code === 200) {
            this.listaApelacionReparacionCivil = resp?.data;
            this.validarElevacionFiscalia();
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar listar las apelaciones realizadas a las salidas alternas", 'Aceptar');
        }
      })
    );
  }

  listarReparacionCivil(event: any) {
    this.infoSujetosReparacionCivil = null;
    if (event) {
      this.subscriptions.push(
        this.apelacionesResultadosService.listaSujetoReparacionCivil(this.idActoTramiteCaso, event).subscribe({
          next: (resp) => {
            if (resp.code == 200) {
              this.infoSujetosReparacionCivil = this.agruparSujetosPorTipo(resp.data);
              this.tipoReparacionCivil = this.obtenerReparacionCivil(resp.data);
            }
          },
          error: error => {
            this.modalDialogService.error("ERROR", "Error al mostrar la información de la Reparación Civil", 'Aceptar');
          }
        })
      );
    }
    /*if (event) {
      this.subscriptions.push(
        this.apelacionesResultadosService.listaSujetoReparacionCivil(this.idCaso, event).subscribe({
          next: (resp) => {
            if (resp.code == 200) {
              this.infoSujetosReparacionCivil = this.agruparSujetosPorTipo(resp.data);
            }
          },
          error: error => {
            this.modalDialogService.error("ERROR", "Error al mostrar la información de la Reparación Civil", 'Ok');
          }
        })
      );
    }*/
  }

  agruparSujetosPorTipo(sujetos: any) {
    const agrupados: any = {};
    sujetos.forEach((sujeto: any) => {
      const tipo = sujeto.noTipoParteSujeto;
      if (!agrupados[tipo]) {
        agrupados[tipo] = [];
      }
      agrupados[tipo].push(sujeto.nombreSujeto);
    });
    return agrupados;
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
      this.apelacionesResultadosService.listarApelacionesPenas(this.idActoTramiteCaso).subscribe({
        next: (resp) => {
            this.listaApelacionPena = resp;
            this.validarElevacionFiscalia();
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar listar las apelaciones a las penas", 'Aceptar');
        }
      })
    );
  }

  listarApelacionesProcesoInmediato() {
    this.listaProcesoInmediato = [];
    this.subscriptions.push(
      this.apelacionesResultadosService.listarApelaciones(this.idActoTramiteCaso, ID_N_TIPO_APELACION_SUJETO.PROCESO_INMEDIATO).subscribe({
        next: (resp) => {
          if (resp?.code === 200) {
            this.listaProcesoInmediato = resp?.data;
            this.validarElevacionFiscalia();
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar listar las apelaciones realizadas de proceso inmediato", 'Aceptar');
        }
      })
    );
  }

  cambioApelacionInmediata(event: any, form: FormGroup) {
    form.get("queja")?.setValue(null);
    limpiarFormcontrol(form.get("queja"), []);
    if (event == this.ID_DENIEGA_APELACION) {
      form.get("queja")?.setValue(0);
      limpiarFormcontrol(form.get("queja"), [Validators.required]);
    }
  }

  validarQuejaInmediato(form: FormGroup): boolean {
    return form.get("resultadoApelacion")?.value == this.ID_DENIEGA_APELACION
  }

  guardarReparacionCivilApelado() {
    const sujeto: string = this.formReparacionCivil.get("sujetoApelo")?.value;
    const sujetoDatos = this.lstSujetosApelantes.find((item: any) => item.idSujetoCaso === sujeto);
    const nombreSujeto: number = sujetoDatos.nombreSujeto;
    const resultadoApelacion: number = Number(this.formReparacionCivil.get("resultadoApelacion")?.value);
    const queja: number = Number(this.formReparacionCivil.get("queja")?.value);
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

    const request: ApelacionesProcesoInmediato = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: sujeto,
      flagRspQueja: queja,
      idRspInstancia: resultadoApelacion,
      idTipoParteSujeto: idTipoParteSujeto,
      idTipoApelacionSujeto: ID_N_TIPO_APELACION_SUJETO.REPARACION_CIVIL,
      idTipoReparacionCivil: idReparacion
    }
    this.subscriptions.push(
      this.apelacionesResultadosService.registrarApelacionesInmediato(request).subscribe({
        next: resp => {
          if (resp?.code == 200) {
            this.modalDialogService.success("Éxito", 'Apelación registrada', 'Aceptar');
            this.listarApelacionesReparacionCivil();
            this.formReparacionCivil.reset();
            this.infoSujetosReparacionCivil = null;
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
    let request: ApelacionPena = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      contraQuienApelo: contraSujetoApelo,
      quienApelo: form.sujetoApelo,
      resultadoApelacion: form.resultadoApelacion,
      queja: form.resultadoApelacion === ID_N_RSP_APELACION.CONCEDE ? null : form.queja,
      idDelito: form.delito
    }
    this.subscriptions.push(
      this.apelacionesResultadosService.registrarApelacionPena(request).subscribe({
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

  guardarApelacionProcesoInmediato() {
    let form = this.formProcesoInmediato.getRawValue();
    if (this.validacionApelacionInmediatoExiste(form.sujetoApelo)) {
      this.messageProcesoInmediato = [
        {
          severity: 'error',
          summary: '',
          detail: 'Seleccione otro sujeto en la opción quien apeló para poder generar el registro',
          icon: 'pi-info-circle icon-color'
        },
      ];
      this.showMessageProcesoInmediato = true;
      return;
    }
    let request: ApelacionRequest = {
      idTipoApelacion: ID_N_TIPO_APELACION_SUJETO.PROCESO_INMEDIATO,
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: form.sujetoApelo,
      idRspInstancia: form.resultadoApelacion,
      flagRspQueja: form.resultadoApelacion === ID_N_RSP_APELACION.CONCEDE ? null : form.queja,
      idTipoParteSujeto: 0
    }
    this.subscriptions.push(
      this.apelacionesResultadosService.registrarApelacion(request).subscribe({
        next: (resp: GenericResponse) => {
          if (resp?.code == 200) {
            this.formProcesoInmediato.reset();
            this.modalDialogService.success('Éxito', 'Apelación registrada', 'Aceptar');
            this.listarApelacionesProcesoInmediato();
          }
        },
        error: () => {
          this.modalDialogService.error(
            'ERROR',
            'Error al intentar registrar la apelación de la fiscalía a la terminación anticipada',
            'Aceptar'
          );
        },
      })
    );
  }

  validacionApelacionInmediatoExiste(idSujetoCaso: string): boolean {
    return this.listaProcesoInmediato.some((item: any) =>
      item.idSujetoCaso === idSujetoCaso
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
            this.apelacionesResultadosService.eliminarApelacion(idApelacionResultado).subscribe({
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
                    case 3:
                      this.listarApelacionesProcesoInmediato();
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

  guardarFiscaliaSuperior(value: any) {
    this.subscriptions.push(
      this.guardarFiscaliaSuperiorObs(value).subscribe({
        error: err => {
          this.modalDialogService.error('ERROR', err, 'Aceptar');
        }
      })
    );

  }

  guardarFiscaliaSuperiorObs(value: any): Observable<any> {
    this.validGuardarFiscaliaSuperior = false;
    // if (value) {
      const request = {
        idActoTramiteCaso: this.idActoTramiteCaso,
        codigoDependecia: value
      }
      return this.apelacionesResultadosService.registrarApelacionFiscalia(request).pipe(
        tap(resp => {
          this.validGuardarFiscaliaSuperior = (resp?.code === 200 && value !== null);
          this.codDependenciaApelacion = value;
          this.validarMessageValidateFiscaliaSuperior(this.codDependenciaApelacion);
        }),
        catchError(error => {
          throw 'Error al intentar registrar la apelación a fiscalia';
        })
      );
  //   } else return of(true);
  }

  obtenerFiscaliasXEntidad() {
    this.subscriptions.push(
      this.maestrosService.obtenerFiscaliaXDependencia(this.codDependencia).subscribe({
        next: (resp) => {
          this.fiscaliasPronvinciales = resp.data.map((item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre }));
        },
        error: (error) => { },
      })
    );
  }

  validarElevacionFiscalia() {
    const tieneApelacionConcedida = [this.listaApelacionReparacionCivil, this.listaApelacionPena, this.listaProcesoInmediato]
      .some(lista => lista.some((item: any) => item.resultadoApelacion === 'CONCEDE APELACIÓN'));

    if (tieneApelacionConcedida) {
      if (this.fiscaliasPronvinciales.length == 1 && this.codDependenciaApelacion.length == 0) {
        this.subscriptions.push(
          this.guardarFiscaliaSuperiorObs(this.fiscaliasPronvinciales[0].value).subscribe({
            next: resp => {
              this.fiscaliaApelacionControl.enable();
              this.fiscaliaApelacionControl.setValue(this.codDependenciaApelacion);
            }
          })
        );
      } else {
        this.fiscaliaApelacionControl.enable();
        this.fiscaliaApelacionControl.setValue(this.codDependenciaApelacion);
        this.validarMessageValidateFiscaliaSuperior(this.codDependenciaApelacion);
      }
    } else {
      this.validGuardarFiscaliaSuperior = false;
      this.fiscaliaApelacionControl.disable();
      this.fiscaliaApelacionControl.setValue('');
      this.validarMessageValidateFiscaliaSuperior('0');
    }
  }

  obtenerApelacionFiscalia() {
    this.subscriptions.push(
      this.apelacionesResultadosService.obtenerApelacionFiscalia(this.idActoTramiteCaso).subscribe({
        next: resp => {
          if (resp?.data?.codigoDependecia) {
            this.codDependenciaApelacion = resp?.data?.codigoDependecia;
            this.fiscaliaApelacionControl.setValue(this.codDependenciaApelacion);
          }
          this.validarMessageValidateFiscaliaSuperior(this.codDependenciaApelacion);
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar obtener la fiscalia", 'Aceptar');
        }
      })
    );
  }
}
