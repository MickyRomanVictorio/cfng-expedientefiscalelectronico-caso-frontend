import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CmpLibModule } from 'dist/cmp-lib';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DigitOnlyModule } from '@directives/digit-only.module';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { BehaviorSubject, firstValueFrom, Subscription } from 'rxjs';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { MaestroService } from '@core/services/shared/maestro.service';
import { RegistrarReparacionCivilService } from '@core/services/reusables/otros/registrar-reparacion-civil.service';
import { DelitoListaDeudores, ListaDeudores } from '@core/interfaces/reusables/reparacion-civil/lista-deudores';
import { REPARACION_CIVIL } from '@core/types/reutilizable/reparacion-civil.type';
import { DatosReparacionCivilInput } from '@core/interfaces/reusables/reparacion-civil/datos-reparacion-civil-input';
import { RegistrarReparacionCivilDetalleRequest, RegistrarReparacionCivilRequest } from '@core/interfaces/reusables/reparacion-civil/registrar-reparacion-civil-request';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ListaAcreedores } from '@core/interfaces/reusables/reparacion-civil/lista-acreedores';
import { ListaSujetosEditar } from '@core/interfaces/reusables/reparacion-civil/lista-sujetos-editar';
import { DatosEditarReparacionCivil } from '@core/interfaces/reusables/reparacion-civil/datos-editar-reparacion-civil';
import { MensajeCompletarCamposComponent } from '@core/components/mensajes/mensaje-completar-campos/mensaje-completar-campos.component';
import { valid } from '@core/utils/string';
import { ListaDeudoresRequest } from '@core/interfaces/reusables/reparacion-civil/lista-deudores-request';
@Component({
  selector: 'app-registrar-editar-sujetos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    CommonModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    DigitOnlyModule,
    CheckboxModule,
    RadioButtonModule,
    TableModule,
    MensajeCompletarCamposComponent
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './registrar-editar-sujetos.component.html',
  styleUrl: './registrar-editar-sujetos.component.scss'
})
export class RegistrarEditarSujetosComponent {

  @Input() data!: DatosReparacionCivilInput;

  @Input() editar: boolean = false;

  @Input() salidaAlterna!: boolean;

  @Input() tipoSentencia!: boolean;

  @Input() modoLectura!: boolean;

  @Input() tipoAcuerdoActa!: string;

  @Input() delitosTramiteSujeto!: boolean;

  @Output() salirModal = new EventEmitter<any>();

  @Input() datosEditarReparacionCivilSubject!: BehaviorSubject<DatosEditarReparacionCivil | null>;

  @Output() enviarEstadoBoton = new EventEmitter<any>();

  private readonly subscriptions: Subscription[] = [];
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  valid = valid;

  REPARACION_CIVIL: typeof REPARACION_CIVIL = REPARACION_CIVIL;
  datosEditarReparacionCivil: DatosEditarReparacionCivil | null = null;
  listaSalidaAlterna: any = [];
  salidaAlternaInput = new FormControl("");
  tipoReparacionCivil = new FormControl(0);
  sujetoMancomunado = new FormControl("");
  idActoTramiteCaso!: string;
  idCaso!: string;
  listaSentencias: any = [];
  //SOLIDARIA
  listaDeudores: ListaDeudores[] = [];
  checkboxPrincipalDeudores: boolean = false;
  checkboxPrincipalAcreedores: boolean = false;
  //MANCOMUNADO
  listaSujetosMancomunados: ListaDeudores[] = [];
  listaDelitosMancomunados: DelitoListaDeudores[] = []; //VARIABLE SOLO PARA VALIDACION E ITERACION
  //AGRAVIADOS
  listaAgraviados: ListaAcreedores[] = [];
  visibleMensajeError: boolean = false;
  txtMensajeError: string = "";
  guardarDesactivado: boolean = true;
  //EDITAR
  listaSujetosEditar: ListaSujetosEditar[] = [];
  constructor(
    private readonly maestroService: MaestroService,
    private readonly registrarReparacionCivilService: RegistrarReparacionCivilService,
    public config: DynamicDialogConfig) {
  }

  ngOnInit() {
    this.idCaso = this.data.idCaso;
    this.idActoTramiteCaso = this.data.idActoTramiteCaso;
    this.tipoReparacionCivil.setValue(REPARACION_CIVIL.SOLIDARIA);

    if (this.modoLectura) {
      this.salidaAlternaInput.disable();
      this.tipoReparacionCivil.disable();
      this.sujetoMancomunado.disable();
    }

    if (this.datosEditarReparacionCivilSubject !== undefined) {
      this.subscriptions.push(
        this.datosEditarReparacionCivilSubject?.subscribe((datosEditarReparacionCivil) => {
          this.datosEditarReparacionCivil = datosEditarReparacionCivil ?? null;
          if (this.datosEditarReparacionCivil) {
            //SE HA ENVIADO DATA PARA EDITAR
            this.listarSalidasAlternas();
            this.listarSujetosEditados();
          }
        })
      );
    }
    else {
      this.listarSalidasAlternas();
      this.iniciarDatos();
      this.salidaAlternaInput.setValue(this.tipoAcuerdoActa)
    }
  }

  iniciarDatos() {
    this.visibleMensajeError = false;
    this.listarSentencias();
    this.listarDeudores();
    this.listarAcreedores();
  }

  listarSalidasAlternas() {
    this.subscriptions.push(
      this.maestroService.obtenerSalidasAlternas().subscribe({
        next: resp => {
          this.listaSalidaAlterna = resp.data
        }
      })
    )
  }
  listarDeudores() {
    const request: any = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idCaso: this.idCaso,
      delitosTramiteSujeto: this.delitosTramiteSujeto
    }
    this.subscriptions.push(
      this.registrarReparacionCivilService.listaDeudores(request).subscribe({
        next: resp => {
          this.listaDeudores = this.setearFalsoSujetoDelito(JSON.parse(JSON.stringify(resp as ListaDeudores[])));
          this.listaSujetosMancomunados = this.setearFalsoSujetoDelito(JSON.parse(JSON.stringify(resp as ListaDeudores[])));
          this.listarDeudoresSeleccionarEditar();
        },
        error: () => {
          this.modalDialogService.error("ERROR", "Error al intentar listar los deudores", 'Ok')
        }
      })
    )
  }
  listarDeudoresSeleccionarEditar() {
    if (this.listaSujetosEditar.length > 0) {
      const tipoReparacionCivil = this.listaSujetosEditar[0].idTipoReparacionCivil;
      this.tipoReparacionCivil.setValue(tipoReparacionCivil);
      if (tipoReparacionCivil === REPARACION_CIVIL.MANCOMUNADA) {
        let sujeto: string | undefined = this.listaSujetosEditar.find((item) => item.idTipoParticipante === REPARACION_CIVIL.DEUDOR)?.idSujetoCaso;
        if (sujeto) {
          this.sujetoMancomunado.setValue(sujeto)
          this.listarDelitosMancomunados(sujeto)
        }
      }
      let listaDeudores: ListaDeudores[] = tipoReparacionCivil === REPARACION_CIVIL.SOLIDARIA ? this.listaDeudores : this.listaSujetosMancomunados
      this.listaSujetosEditar.forEach((editar) => {
        listaDeudores.forEach((deudor) => {
          deudor.lstDelitosSujeto.forEach((delito) => {
            if (editar.idTipoParticipante === REPARACION_CIVIL.DEUDOR && editar.idActoTramiteDelitoSujeto === delito.idActoTramiteDelitoSujeto) {
              deudor.seleccionado ||= true;
              delito.seleccionado = true;
              if (this.tipoSentencia) {
                delito.idTipoSentencia = editar.idTipoSentencia
              }
            }
          });
        });
      });
      //EXCLUSIVO PARA SOLIDARIA
      this.checkboxPrincipalDeudores = this.listaDeudores.every(deudor => deudor.seleccionado === true);
    }
  }

  listarAcreedores() {
    this.subscriptions.push(
      this.registrarReparacionCivilService.listaAcreedores(this.idCaso, this.idActoTramiteCaso).subscribe({
        next: resp => {
          this.listaAgraviados = this.setearFalsoAcreedores(resp as ListaAcreedores[])
          this.listarAcreedoresSeleccionarEditar();
        },
        error: () => {
          this.modalDialogService.error("ERROR", "Error al intentar listar los acreedores", 'Ok')
        }
      })
    )
  }
  listarAcreedoresSeleccionarEditar() {
    if (this.listaSujetosEditar.length > 0) {
      this.listaSujetosEditar.forEach((editar) => {
        this.listaAgraviados.forEach((agraviado) => {
          if (editar.idTipoParticipante === REPARACION_CIVIL.ACREEDOR && editar.idActoTramiteSujeto === agraviado.idActoTramiteSujeto) {
            agraviado.seleccionado = true;
          }
        });
      });
      this.checkboxPrincipalAcreedores = this.listaAgraviados.every(agraviado => agraviado.seleccionado === true)
    }
  }


  listarSentencias() {
    this.maestroService.obtenerCatalogo('ID_N_TIPO_SENTENCIA').subscribe({
      next: resp => {
        this.listaSentencias = resp.data
        this.listaSentencias = this.listaSentencias
          .map((agraviado: any) => ({
            ...agraviado,
            noDescripcion: agraviado.noDescripcion.replace(/SENTENCIA(?: DE)?/gi, '').trim()
          }))
          .filter((agraviado: any) => agraviado.noDescripcion !== '');
      }
    })
  }

  listarSujetosEditados() {
    this.subscriptions.push(
      this.registrarReparacionCivilService.listaSujetosEditar(this.datosEditarReparacionCivil?.idReparacionCivil).subscribe({
        next: resp => {
          this.listaSujetosEditar = resp as ListaSujetosEditar[];
          if (this.salidaAlterna) {
            this.salidaAlternaInput.setValue(this.mostrarSalidaAlternaLista(this.listaSujetosEditar))
          }
          this.iniciarDatos();
          this.guardarDesactivado = false;
          this.enviarEstadoBoton.emit(this.guardarDesactivado);
        },
        error: () => {
          this.modalDialogService.error("ERROR", "Error al intentar obtener los sujetos procesales previamente registrados", 'Ok')
        }
      })
    )
  }

  transformarEstiloDocumento(documento: string): string {
    let estilo = documento.toLowerCase();
    estilo = estilo.replace(/\s+/g, '-');
    estilo = estilo.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return estilo;
  }

  /*********************************SOLIDARIA */

  setearFalsoSujetoDelito(lista: ListaDeudores[]): ListaDeudores[] {
    lista.forEach((sujeto: ListaDeudores) => {
      sujeto.seleccionado = false;
      sujeto.lstDelitosSujeto?.forEach(delito => {
        delito.seleccionado = false;
        if(this.tipoSentencia){
          delito.idTipoSentenciaOriginal = delito.idTipoSentencia;
        }
        else{
          delito.idTipoSentencia = null
        }
      });
      sujeto.lstDelitosSujeto?.sort((a, b) => a.delito.localeCompare(b.delito));
    });
    return lista;
  }

  setearFalsoAcreedores(lista: ListaAcreedores[]): ListaAcreedores[] {
    return lista.map(acreedor => ({ ...acreedor, seleccionado: false }));
  }

  /**************FUNCIONES DE SELECCION DE TABLA ACREEDORES SOLIDARIOS */

  seleccionandoTodosDeudores(check: boolean) {
    this.listaDeudores.forEach((deudor: any) => {
      deudor.seleccionado = check;
      deudor.lstDelitosSujeto.forEach((delito: any) => {
        delito.seleccionado = check
        if (!check && (delito.idTipoSentencia != null && delito.idTipoSentencia > 0)) {
          delito.idTipoSentencia = delito.idTipoSentenciaOriginal
        }
      });
    });
    this.calcularEstadoBoton();
  }
  seleccionarDeudor(check: boolean, deudor: ListaDeudores) {
    deudor.lstDelitosSujeto.forEach((delito: any) => {
      delito.seleccionado = check;
      if (!check && (delito.idTipoSentencia != null && delito.idTipoSentencia > 0)) {
        delito.idTipoSentencia = delito.idTipoSentenciaOriginal
      }
    });
    this.verificarSeleccionSolidariaGeneral();
  }

  seleccionandoDelito(check: boolean, deudor: ListaDeudores, delito: DelitoListaDeudores) {
    const hayDelitosSeleccionados = deudor.lstDelitosSujeto.some((delito: any) => delito.seleccionado);
    deudor.seleccionado = hayDelitosSeleccionados
    if (!check && (delito.idTipoSentencia != null && delito.idTipoSentencia > 0)) {
      delito.idTipoSentencia = delito.idTipoSentenciaOriginal
    }
    this.verificarSeleccionSolidariaGeneral();
  }

  verificarSeleccionSolidariaGeneral() {
    const todasFilasSeleccionadas = this.listaDeudores.every((deudor: any) => deudor.seleccionado);
    this.checkboxPrincipalDeudores = todasFilasSeleccionadas;
    this.calcularEstadoBoton();
  }

  /**************FUNCIONES DE SELECCION DE TABLA ACREEDORES */
  seleccionandoTodosAcreedores(valor: boolean): void {
    this.listaAgraviados.forEach(acreedor => acreedor.seleccionado = valor);
    this.calcularEstadoBoton();
  }
  verificarSeleccionAcreedores() {
    const todasFilasSeleccionadas = this.listaAgraviados.every((acreedor: any) => acreedor.seleccionado);
    this.checkboxPrincipalAcreedores = todasFilasSeleccionadas;
    this.calcularEstadoBoton();
  }

  /*********************************MANCUMUNADA */

  listarDelitosMancomunados(idSujetoCaso: string) {
    this.listaDelitosMancomunados = [];
    this.listaSujetosMancomunados = this.setearFalsoSujetoDelito(this.listaSujetosMancomunados);
    let sujeto = this.listaSujetosMancomunados.find(deudor => deudor.idSujetoCaso === idSujetoCaso);
    if (sujeto) {
      sujeto.seleccionado = true;
      const lista = sujeto?.lstDelitosSujeto;
      if (lista) {
        this.listaDelitosMancomunados = lista;
      }
    }
  }

  validarDelitoMancomunado(check: boolean, delito: DelitoListaDeudores) {
    if (!check && (delito.idTipoSentencia != null && delito.idTipoSentencia > 0)) {
     delito.idTipoSentencia = delito.idTipoSentenciaOriginal
    }
    this.calcularEstadoBoton()
  }

  validInputsDisable(): boolean {
    return this.tipoReparacionCivil.value === REPARACION_CIVIL.SOLIDARIA
      ? !this.validarDeudoresSolidarios()
      : !this.validarDeudorMancomunado();
  }

  validarDeudoresSolidarios(): boolean {
    if (this.tipoSentencia) {
      const hayDelitoInvalido = this.listaDeudores.some(
        (sujeto) =>
          sujeto.seleccionado &&
          sujeto.lstDelitosSujeto?.some(
            (delito) => delito.seleccionado && (delito.idTipoSentencia === 0 || delito.idTipoSentencia === null)
          )
      );
      if (hayDelitoInvalido) {
        return false;
      }
      return this.listaDeudores.some(
        (sujeto) =>
          sujeto.seleccionado &&
          sujeto.lstDelitosSujeto?.some(
            (delito) => delito.seleccionado && (delito.idTipoSentencia !== 0 && delito.idTipoSentencia !== null)
          )
      );
    }
    else {
      return this.listaDeudores.some(
        (sujeto) =>
          sujeto.seleccionado &&
          sujeto.lstDelitosSujeto?.some(
            (delito) => delito.seleccionado
          )
      );
    }
  }
  validarDeudorMancomunado(): boolean {
    if (this.tipoSentencia) {
      return this.listaDelitosMancomunados.some(delito => delito.seleccionado) &&
        this.listaDelitosMancomunados.every(delito =>
          !delito.seleccionado || (delito.idTipoSentencia !== 0 && delito.idTipoSentencia !== null)
        )
    }
    else {
      return (this.listaDelitosMancomunados.some(delito => delito.seleccionado))
    }
  }

  validarNoSeleccionAcreedor(): boolean {
    return this.listaAgraviados.every(acreedor => !acreedor.seleccionado);
  }

  validarSalidaAlterna(): boolean {
    if (this.salidaAlterna) {
      return !valid(this.salidaAlternaInput.value);
    }
    return false;
  }

  filtrarDeudoresSeleccionados(lista: ListaDeudores[]): ListaDeudores[] {
    return lista
      .filter((sujeto: ListaDeudores) => sujeto.seleccionado)
      .map((sujeto: ListaDeudores) => {
        return {
          ...sujeto,
          lstDelitosSujeto: sujeto.lstDelitosSujeto?.filter(delito => delito.seleccionado)
        };
      });
  }
  mostrarSalidaAlternaLista(lista: ListaSujetosEditar[]): string | null {
    //PERMITE IDENTIFICAR LA SALIDA ALTERNA DE UNA LISTA DE AGRAVIADOS Y DEUDORES
    const valores = [...new Set(lista.map(item => item.idSalidaAlterna).filter(v => v !== null))];
    return valores.length === 1 ? valores[0] : null;
  }
  calcularEstadoBoton() {
    this.guardarDesactivado = this.validarSalidaAlterna() || this.validInputsDisable() || this.validarNoSeleccionAcreedor();
    if (this.editar) {
      this.enviarEstadoBoton.emit(this.guardarDesactivado);
    }
  }
  mostrarMensajeError(text: string) {
    this.txtMensajeError = text;
    this.visibleMensajeError = true;
  }
  async guardar(): Promise<DatosEditarReparacionCivil | null> {
    let listaDetalle: RegistrarReparacionCivilDetalleRequest[] = [];
    let listaDeudores: ListaDeudores[] = this.tipoReparacionCivil.value === REPARACION_CIVIL.SOLIDARIA ? this.listaDeudores : this.listaSujetosMancomunados;
    let listarAgraviados: ListaAcreedores[] = this.listaAgraviados;

    listaDeudores.forEach((deudor: ListaDeudores) => {
      deudor.lstDelitosSujeto.forEach((detalle: DelitoListaDeudores) => {
        listaDetalle.push({
          idActoTramiteDelitoSujeto: detalle.idActoTramiteDelitoSujeto,
          idTipoParticipante: REPARACION_CIVIL.DEUDOR,
          idActoTramiteSujeto: deudor.idActoTramiteSujeto,
          idTipoParteSujeto: deudor.idTipoParteSujeto,
          idSujetoCaso: deudor.idSujetoCaso,
          idReparacionCivilDetalle: null,
          idTipoSentencia: this.tipoSentencia ? detalle.idTipoSentencia : null,
          idDelitoSujeto: detalle.idDelitoSujeto,
          seleccion: detalle.seleccionado ? 1 : 0,
        });
      });
    });

    listarAgraviados.forEach((acreedores: ListaAcreedores) => {
      listaDetalle.push({
        idActoTramiteDelitoSujeto: null,
        idTipoParticipante: REPARACION_CIVIL.ACREEDOR,
        idActoTramiteSujeto: acreedores.idActoTramiteSujeto,
        idTipoParteSujeto: acreedores.idTipoParteSujeto,
        idSujetoCaso: acreedores.idSujetoCaso,
        idReparacionCivilDetalle: null,
        idTipoSentencia: null,
        idDelitoSujeto: null,
        seleccion: acreedores.seleccionado ? 1 : 0,
      });
    });

    let request: RegistrarReparacionCivilRequest = {
      idReparacionCivil: this.datosEditarReparacionCivil?.pendienteRegistrar ? null : this.datosEditarReparacionCivil?.idReparacionCivil,
      idActoTramiteCaso: this.idActoTramiteCaso,
      idCaso: this.idCaso,
      idSalidaAlterna: this.salidaAlternaInput.value,
      idTipoRepacionCivil: this.tipoReparacionCivil.value,
      lstRegistroRepacionCivil: listaDetalle,
    };
    try {
      const resp = await firstValueFrom(
        this.registrarReparacionCivilService.registrarReparacionCivil(request)
      );
      if (resp?.codigo === 200) {
        if (!this.editar) {
          this.salirModal.emit(resp.data);
        } else {
          if (this.datosEditarReparacionCivil?.pendienteRegistrar === true) {
            this.datosEditarReparacionCivil.codReparacionCivil = resp.data.codReparacionCivil;
            this.datosEditarReparacionCivil.idReparacionCivil = resp.data.idReparacionCivil;
          }
          return this.datosEditarReparacionCivil;
        }
      } else if (resp?.codigo === 100) {
        this.mostrarMensajeError(
          'Los datos que desea ingresar ya se encuentran en otra reparación previamente registrada. Por favor, revise los datos y modifíquelos de ser necesario'
        );
      }
    } catch (error) {
      this.modalDialogService.error(
        'Error',
        `Se ha producido un error al intentar registrar la reparación civil`,
        'Ok'
      );
      throw error;
    }
    return null;
  }


}


