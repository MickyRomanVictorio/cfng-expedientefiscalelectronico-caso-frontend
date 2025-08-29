import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { ApelacionesProcesoInmediato } from '@core/interfaces/provincial/tramites/fundado-procedente/apelaciones-proceso-inmediato';
import { ApelacionesResultadosService } from '@core/services/provincial/tramites/especiales/registrar-resultado-audiencia/fundada-procedente/apelaciones-resultados.service';
import { obtenerIcono } from '@core/utils/icon';
import { limpiarFormcontrol } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { MaestroService } from '@core/services/shared/maestro.service';
import { Message, SelectItem } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { validateMessageService } from '@core/services/provincial/tramites/validateMessage.service';
import { capitalizedFirstWord } from '@core/utils/string';
import {
  ApelaFiscalia,
  IncoacionSujeto,
  RegistroSujetoApela,
  ReparacionCivilCaso
} from '@interfaces/provincial/tramites/especiales/incoacion/apelacion';
import { Catalogo } from '@interfaces/comunes/catalogo';
import { TokenService } from '@services/shared/token.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-apelaciones-resultados',
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
  templateUrl: './apelaciones-resultados.component.html',
  styleUrl: './apelaciones-resultados.component.scss'
})
export class ApelacionesResultadosComponent implements OnInit, OnDestroy {

  @Input() data!: any;

  /**
   * 🔘 **Variable de valor booleano***
   * - **Nota:** Si es verdadero no permitirá hacer ninguna accion de registro, edición y eliminación
   */
  @Input() modoLectura!: boolean;
  obtenerIcono = obtenerIcono;
  public subscriptions: Subscription[] = [];
  ID_CONSENTIDO: number = 1061;
  ID_DENIEGA_APELACION: number = 1024;
  COLUMNA_INPUTADO: string = 'Imputado';
  COLUMNA_AGRAVIADO: string = 'Agraviado';
  COLUMNA_ACTOR_CIVIL: string = 'Actor Civil';
  TIPO_APELACION_SUJETO_PI: number = 1192; //PROCESO INMEDIATO
  TIPO_APELACION_SUJETO_RC: number = 1190; //REPARACION CIVIL
  formProcesoInmediato: FormGroup;
  formSalidasAlternas: FormGroup;
  listaProcesoInmediato: RegistroSujetoApela[] = [];
  listaSalidaAlterna: RegistroSujetoApela[] = [];
  lstSujetosApelantes: IncoacionSujeto[] = [];
  lstResultadoApelaciones: Catalogo[] = [];
  lstReparacionCivilApelada: ReparacionCivilCaso[] = [];
  fiscaliasPronvinciales: SelectItem[] = [];
  infoSujetosReparacionCivil: any = null;
  lstQueja: any = [
    { nombre: "NO", id: 0 },
    { nombre: "SI", id: 1 }
  ];
  idActoTramiteCaso!: string;
  idCaso!: string;
  codDependencia!: string;
  validGuardarFiscaliaSuperior: boolean = false;
  fiscaliaApelacionControl = new FormControl('');
  codDependenciaApelacion: string = "";

  message: Message[] = [];
  messageProcesoInmediato: Message[] = [];
  messageSalidaAlterna: Message[] = [];
  showMessage: boolean = false;
  showMessageProcesoInmediato: boolean = false;
  showMessageSalidaAlterna: boolean = false;
  tipoReparacionCivil: string = '';

  capitalizedFirstWord = capitalizedFirstWord;
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  constructor(
    private readonly apelacionesResultadosService: ApelacionesResultadosService,
    private readonly validateMessageService: validateMessageService,
    private readonly maestrosService: MaestroService,
    private readonly tokenService: TokenService,
    private sanitizer: DomSanitizer,
    private readonly fb: FormBuilder
  ) {
    this.formProcesoInmediato = this.fb.group({
      sujetoApelo: ['', [Validators.required]],
      resultadoApelacion: ['', [Validators.required]],
      queja: [null],
    });
    this.formSalidasAlternas = this.fb.group({
      reparacionCivil: ['', [Validators.required]],
      sujetoApelo: ['', [Validators.required]],
      resultadoApelacion: ['', [Validators.required]],
      queja: [null],
    });
    const decodedToken = this.tokenService.getDecoded();
    this.codDependencia = decodedToken.usuario.codDependencia;
  }

  ngOnInit() {
    this.idActoTramiteCaso = this.data?.idActoTramiteCaso;
    this.idCaso = this.data?.idCaso;
    this.iniciarDatos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  validarMessageValidateFiscaliaSuperior(codigo: string): void {
    this.showMessage = codigo === '';
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
    this.listaSujetosApelantesCombo();
    this.listarResultadoApelacionesCombo();
    this.listarReparacionCivilApeladaCombo();
    setTimeout(() => {
      this.listarApelacionesInmediato();
      this.listarApelacionesSalidasAlternas();
    }, 0);
  }

  listarApelacionesInmediato() {
    this.listaProcesoInmediato = [];
    this.subscriptions.push(
      this.apelacionesResultadosService.listarApelacionesInmediato(this.idActoTramiteCaso).subscribe({
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

  validacionApelacionInmediatoExiste(idSujetoCaso: string): boolean {
    return this.listaProcesoInmediato.some((item) =>
      item.idSujetoCaso === idSujetoCaso
    );
  }

  validacionSalidasAlternasExiste(codigoReparacion: string, idSujetoCaso: string): boolean {
    return this.listaSalidaAlterna.some((item: any) =>
      item.idSujetoCaso === idSujetoCaso && item.idReparacion === codigoReparacion
    );
  }


  listarApelacionesSalidasAlternas() {
    this.listaSalidaAlterna = [];
    this.subscriptions.push(
      this.apelacionesResultadosService.listarApelacionesSalidasAlternas(this.idActoTramiteCaso).subscribe({
        next: (resp) => {
          if (resp?.code === 200) {
            this.listaSalidaAlterna = resp?.data;
            this.validarElevacionFiscalia();
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar listar las apelaciones realizadas a las salidas alternas", 'Aceptar');
        }
      })
    );
  }

  listaSujetosApelantesCombo() {
    this.subscriptions.push(
      this.apelacionesResultadosService.sujetosApelantes(this.idCaso).subscribe({
        next: (resp) => {
          this.lstSujetosApelantes = resp.data;
        },
      })
    );
  }

  listarResultadoApelacionesCombo() {
    this.subscriptions.push(
      this.apelacionesResultadosService.resultadoApelaciones().subscribe({
        next: (resp) => {
          this.lstResultadoApelaciones = resp.data.filter((item: any) => item.id !== this.ID_CONSENTIDO);
        },
      })
    );
  }

  cambioApelacionInmediata(id: number, form: FormGroup) {
    form.get("queja")?.setValue(null);
    limpiarFormcontrol(form.get("queja"), []);
    if (id == this.ID_DENIEGA_APELACION) {
      form.get("queja")?.setValue(0);
      limpiarFormcontrol(form.get("queja"), [Validators.required]);
    }
  }

  validarQuejaInmediato(form: FormGroup): boolean {
    return form.get("resultadoApelacion")?.value == this.ID_DENIEGA_APELACION
  }

  guardarApelacionProcesoInmediato() {
    const sujetoApelo: string = this.formProcesoInmediato.get("sujetoApelo")?.value;
    const sujetoApela = this.lstSujetosApelantes.find((item: any) => item.idSujetoCaso === sujetoApelo);
    const resultadoApelacion: number = Number(this.formProcesoInmediato.get("resultadoApelacion")?.value);
    const queja: number = Number(this.formProcesoInmediato.get("queja")?.value);

    if (!sujetoApela) return;
    const idTipoParteSujeto: number = sujetoApela.idTipoParteSujeto;

    if (this.validacionApelacionInmediatoExiste(sujetoApelo)) {
      this.messageProcesoInmediato = [
        {
          severity: 'error',
          summary: '',
          detail: 'Seleccione otro sujeto en la opción "quien apeló" para poder generar el registro',
          icon: 'pi-info-circle icon-color'
        },
      ];
      this.showMessageProcesoInmediato = true;
      return;
    }
    const request: ApelacionesProcesoInmediato = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: sujetoApelo,
      flagRspQueja: queja,
      idRspInstancia: resultadoApelacion,
      idTipoParteSujeto: idTipoParteSujeto,
      idTipoApelacionSujeto: this.TIPO_APELACION_SUJETO_PI
    }
    this.subscriptions.push(
      this.apelacionesResultadosService.registrarApelacionesInmediato(request).subscribe({
        next: resp => {
          if (resp?.code == 200) {
            this.modalDialogService.success("Éxito", 'Apelación registrada', 'Aceptar');
            this.listarApelacionesInmediato();
            this.formProcesoInmediato.reset();
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar registrar la apelación de proceso inmediato", 'Aceptar');
        }
      })
    );
  }

  listarReparacionCivilApeladaCombo() {
    this.subscriptions.push(
      this.apelacionesResultadosService.listaReparacionCivilApelada(this.idActoTramiteCaso).subscribe({
        next: (resp) => {
          this.lstReparacionCivilApelada = resp.data;
        },
      })
    );
  }

  listarReparacionCivil(idReparacion: string) {
    this.infoSujetosReparacionCivil = null;
    if (idReparacion) {
      this.subscriptions.push(
        this.apelacionesResultadosService.listaSujetoReparacionCivil(this.idActoTramiteCaso, idReparacion).subscribe({
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
  }

  agruparSujetosPorTipo(sujetos: IncoacionSujeto[]) {
    const agrupados: any = {};
    sujetos.forEach((sujeto) => {
      const tipo = sujeto.noTipoParteSujeto;
      if (!agrupados[tipo]) {
        agrupados[tipo] = [];
      }
      agrupados[tipo].push(sujeto.nombreSujeto);
    });
    return agrupados;
  }

  obtenerReparacionCivil(sujetos: IncoacionSujeto[]): string {
    // Filtrar solo los objetos con el campo 'nombre' y agrupar los valores únicos
    const valor = [
      ...new Set(
        sujetos
          .filter((item) => typeof item === 'object' && item.noTipoReparacionCivil) // Declarar `item` como `any`
          .map((item) => item.noTipoReparacionCivil)
      )
    ];

    return valor.join('');
  }

  get obtenerCodigoReparacionCivil() {
    let idReparacion = this.formSalidasAlternas.get("reparacionCivil")?.value;
    return this.lstReparacionCivilApelada.find((item: any) => item.idReparacion === idReparacion)?.codigoReparacion || '';
  }

  guardarApelacionSalidaAlterna() {
    const idReparacion: string = this.formSalidasAlternas.get("reparacionCivil")?.value;
    const sujeto: string = this.formSalidasAlternas.get("sujetoApelo")?.value;
    const resultadoApelacion: number = Number(this.formSalidasAlternas.get("resultadoApelacion")?.value);
    const queja: number = Number(this.formSalidasAlternas.get("queja")?.value);
    const sujetoDatos = this.lstSujetosApelantes.find((item) => item.idSujetoCaso === sujeto);
    if (!sujetoDatos) return;
    const nombreSujeto: string = sujetoDatos.nombreSujeto;
    const idTipoParteSujeto: number = sujetoDatos.idTipoParteSujeto;

    if (this.validacionSalidasAlternasExiste(idReparacion, sujeto)) {
      this.messageSalidaAlterna = [
        {
          severity: 'error',
          summary: '',
          detail: 'El sujeto procesal: ' + nombreSujeto + ', ya tiene un registro de apelación para la reparación civil ' + this.obtenerCodigoReparacionCivil + ', por favor seleccione otro sujeto u otra reparación civil',
          icon: 'pi-info-circle icon-color'
        },
      ];
      this.showMessageSalidaAlterna = true;
      return;
    }

    const request: ApelacionesProcesoInmediato = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: sujeto,
      flagRspQueja: queja,
      idRspInstancia: resultadoApelacion,
      idTipoParteSujeto: idTipoParteSujeto,
      idTipoApelacionSujeto: this.TIPO_APELACION_SUJETO_RC,
      idTipoReparacionCivil: idReparacion
    }
    this.subscriptions.push(
      this.apelacionesResultadosService.registrarApelacionesInmediato(request).subscribe({
        next: resp => {
          if (resp?.code == 200) {
            this.modalDialogService.success("Éxito", 'Apelación registrada', 'Aceptar');
            this.listarApelacionesSalidasAlternas();
            this.formSalidasAlternas.reset();
            this.infoSujetosReparacionCivil = null;
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar registrar la apelación realizada a salida alterna", 'Aceptar');
        }
      })
    );
  }
  agruparPorLlave(data: any, key: string): string[] {
    return data[key] || ["-"];
  }

  eliminarRegistroApelado(idActoTramiteSujeto: string, idApelacionResultado: string) {
    const dialog = this.modalDialogService.question("Eliminar apelación", "¿Realmente quiere eliminar este registro de apelación?", 'Eliminar', 'Cancelar');
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.subscriptions.push(
            this.apelacionesResultadosService.eliminarRegistroApelado(idActoTramiteSujeto, idApelacionResultado).subscribe({
              next: resp => {
                if (resp?.code === 200) {
                  this.modalDialogService.info("Éxito", 'Apelación eliminada correctamente', 'Aceptar');
                  this.listarApelacionesInmediato();
                  this.listarApelacionesSalidasAlternas();
                }
              },
              error: error => {
                this.modalDialogService.error("ERROR", "Error al intentar eliminar la apelación", 'Aceptar');
              }
            })
          );
        }
      }
    });
  }

  obtenerFiscaliasXEntidad() {
    this.subscriptions.push(
      this.maestrosService.obtenerFiscaliaXDependencia(this.codDependencia).subscribe({
        next: (resp) => {
          this.fiscaliasPronvinciales = resp.data.map((item) => ({ value: item.id, label: item.nombre }));
        },
        error: (error) => { },
      })
    );
  }

  guardarFiscaliaSuperior(id: any) {
    this.validGuardarFiscaliaSuperior = false;
      const request: ApelaFiscalia = {
        idActoTramiteCaso: this.idActoTramiteCaso,
        codigoDependecia: id
      }
      this.subscriptions.push(
        this.apelacionesResultadosService.registrarApelacionFiscalia(request).subscribe({
          next: resp => {
            this.validGuardarFiscaliaSuperior = (resp?.code === 200 && id !== null);
            this.codDependenciaApelacion = id;
            this.validarMessageValidateFiscaliaSuperior(this.codDependenciaApelacion);
          },
          error: error => {
            this.modalDialogService.error("ERROR", "Error al intentar registrar la apelación a fiscalia", 'Aceptar');
          }
        })
      );
    
  }

  validarElevacionFiscalia() {
    const array1 = this.listaProcesoInmediato.some((item: any) => item.resultadoApelacion === 'CONCEDE APELACIÓN');
    const array2 = this.listaSalidaAlterna.some((item: any) => item.resultadoApelacion === 'CONCEDE APELACIÓN');
    if (array1 || array2) {
      this.fiscaliaApelacionControl.enable();
      this.fiscaliaApelacionControl.setValue(this.codDependenciaApelacion);
      this.validarMessageValidateFiscaliaSuperior(this.codDependenciaApelacion);
    }
    else {
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
