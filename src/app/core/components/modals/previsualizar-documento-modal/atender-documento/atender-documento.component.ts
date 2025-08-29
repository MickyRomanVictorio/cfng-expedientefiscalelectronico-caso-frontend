import { CommonModule } from '@angular/common';
import {Component, inject, Input, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CuadernoIncidentalResponse } from '@core/interfaces/provincial/documentos-ingresados/CuadernoIncidental';
import { DocumentoAtencionRequest } from '@interfaces/provincial/documentos-ingresados/DocumentoAtencionRequest';
import { DocumentoIngresadoNuevo } from '@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevo';
import { Tramites } from '@interfaces/reusables/buscar-tramites/buscar-tramites.interface';
import { AtenderDocumentosService } from '@services/provincial/documentos-ingresados/atender-documentos.service';
import { BandejaDocumentosVisorService } from '@services/provincial/documentos-ingresados/bandeja-documentos.service';
import { DocumentosIngresadosService } from '@services/provincial/documentos-ingresados/documentos-ingresados.service';
import { CasoStorageService } from '@services/shared/caso-storage.service';
import { urlConsultaCasoFiscal, urlConsultaCuaderno, urlConsultaPestanaApelacion} from '@utils/utils';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';
import {
  AsociarCuadernoIncidentalComponent
} from '../../asociar-cuaderno-incidental/asociar-cuaderno-incidental.component';
import { BuscarTramitesModalComponent } from '../../buscar-tramites-modal/buscar-tramites-modal.component';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { CmpLibModule } from 'dist/cmp-lib';
import { ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS } from '@core/types/tipo-bandeja-documentos-ingresados';
import { ID_TIPO_INGRESO_TRAMITE } from '@core/types/tipo-ingreso-tramite';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import {TokenService} from "@services/shared/token.service";


/**
 *  Tipos de clasificador
 * 0	PRINCIPAL
 * 1	CUADERNO
 * 2	CUADERNO INCIDENTAL
 * 3	CUADERNO DE EJECUCION
 * 4	CUADERNO EXTREMO
 * 5	PESTAÑA APELACIÓN
 * 6	CUADERNO DE PRUEBA
 */
@Component({
  standalone: true,
  selector: 'app-atender-documento',
  templateUrl: './atender-documento.component.html',
  styleUrls: ['./atender-documento.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RadioButtonModule,
    DropdownModule,
    CheckboxModule,
    InputTextareaModule,
    InputTextModule,
    ButtonModule,
    CmpLibModule
  ],
  providers: [NgxCfngCoreModalDialogService]
})
export class AtenderDocumentoComponent implements OnInit {
  @Input() documento!: DocumentoIngresadoNuevo;

  remainingChars: number = 1000;
  formulario!: FormGroup;
  public subscriptions: Subscription[] = [];
  listAtenderDocumentoRecibido: any = [];
  solicitudes = [];
  proceso: number = 0;
  subtipo!: string;
  etapa!: string;
  tramite!: Tramites | null;
  esRegistro: boolean = true;
  habilitarGuardar: boolean = true;
  cuadernoAsociado: CuadernoIncidentalResponse | null = null;
  NUEVOS: string = ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.NUEVOS.toString();
  private tokenService = inject(TokenService);
  private idJerarquia: number = 0;

  constructor(
    private dialogService: DialogService,
    public ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    private bandejaDocumentosVisorService: BandejaDocumentosVisorService,
    private atenderDocumentoService: AtenderDocumentosService,
    private spinner: NgxSpinnerService,
    private documentosIngresadosService: DocumentosIngresadosService,
    private casoStorageService: CasoStorageService,
    private router: Router,
    protected iconUtil: IconUtil,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
  ) { }

  tramitesExcepcionRedirigir = ['000001','000046'];

  async ngOnInit(): Promise<void> {
    this.idJerarquia = parseInt(this.tokenService.getDecoded().usuario.codJerarquia);
    this.formulario = this.formBuilder.group({
      accion: ['', Validators.required],
      tramite: [null],
      acto: [null],
      respuesta: [false],
      solicitud: [null],
      descripcion: [null, Validators.maxLength(1000)],
      correo: [this.documento.correo],
    });

    this.subscriptions.push(
      this.formulario.valueChanges.subscribe({
        next: () => {
          const values = this.formulario.getRawValue();
          this.validarFormulario(values);
        }
      })
    );
    if (
      Number(this.documento.estadoDocuIngresado) === ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.OBSERVADOS ||
      Number(this.documento.estadoDocuIngresado) === ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.NO_PRESENTADOS ||
      Number(this.documento.estadoDocuIngresado) === ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.RECIBIDOS
    ) {
      this.esRegistro = false;
      await this.ObtenerAtenderDocumento(this.documento.idDocumentoEscrito, this.documento.estadoDocuIngresado);
    } else if (Number(this.documento.estadoDocuIngresado) === ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.NUEVOS) {
      this.formulario.get('accion')!.setValue('R');
      this.formulario.get('tramite')!.disable();
      this.formulario.get('acto')!.disable();
      this.formulario.get('correo')!.disable();
      await this.obtenerEtapa();
    }
    await this.obtenerOficios();
  }

  validarFormulario(values: any) {
    if (values.accion == 'O') {
      const validE = Validators.email(this.formulario.get('correo')!);
      this.habilitarGuardar = values.descripcion && values.descripcion.length > 0 && !validE;
      return;
    }
    if (values.accion == 'R') {
      this.habilitarGuardar = values.tramite && values.acto;
      return;
    }
    this.habilitarGuardar = true;
    return;
  }

  reiniciarFormulario() {
    this.formulario.patchValue({
      tramite: null,
      acto: null,
      respuesta: false,
      solicitud: null,
      descripcion: null,
      correo: this.documento.correo,
    });
  }

  obtenerEtapa() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.atenderDocumentoService
          .obtenerEtapa(this.documento.idCaso)
          .subscribe({
            next: (resp) => {
              this.proceso = resp.proceso;
              this.subtipo = resp.subtipo;
              this.etapa = resp.etapa;
              resolve();
            },
          })
      );
    });
  }

  seleccionarTramite() {
    const tipo = 1;
    const idCaso = this.documento.idCaso;
    const nroCaso = this.documento.numeroCaso;
    const proceso = this.proceso;
    const subtipo = this.subtipo;
    const etapa = this.etapa;
    const dialog = this.dialogService.open(BuscarTramitesModalComponent, {
      data: { tipo, idCaso, nroCaso, proceso, subtipo, etapa },
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px', },
    });

    dialog.onClose.subscribe({
      next: (data: Tramites) => {
        this.tramite = data;
        console.log(data);
        if (this.tramite!.clasificador === 2) {
          this.abrirModalAsociarCuaderno(1, 'R');
        } else if (this.tramite!.clasificador === 5) {
          this.abrirModalAsociarCuaderno(2, 'R');
        } else {
          this.formulario.patchValue({
            tramite: this.tramite?.nombreTramite,
            acto: this.tramite?.acto
          });
        }
      },
    });
  }

  abrirModalAsociarCuaderno(tipo: number, tipoAccion: string) {
    let nombreTramite = this.tramite!.nombreTramite;
    nombreTramite = nombreTramite.charAt(0) + nombreTramite.slice(1).toLowerCase();
    const nombreCuaderno = this.tramite!.nombreTipoClasificador;
    const tipoCuaderno = this.tramite!.tipoClasificador;
    const codigoCasoCuaderno = tipoAccion === 'E' ? this.cuadernoAsociado?.idCaso : null;
    const dialog2 = this.dialogService.open(AsociarCuadernoIncidentalComponent, {
      data: {
        tipo,
        tipoAccion,
        nombreTramite,
        nombreCuaderno,
        tipoCuaderno,
        codigoCasoCuaderno,
        idCaso: this.documento.idCaso,
      },
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px', 'max-width': '1200px', 'width': '90%' },
    });
    dialog2.onClose.subscribe({
      next: (data) => {
        this.cuadernoAsociado = data;
        this.formulario.patchValue({
          tramite: this.tramite?.nombreTramite,
          acto: this.tramite?.acto
        });
      },
    });
  }

  onInputDescripcionChange() {
    this.remainingChars = 1000 - this.formulario.get('descripcion')!.value.length;
  }

  obtenerOficios() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.atenderDocumentoService
          .obtenerOficios(this.documento.idCaso)
          .subscribe({
            next: (resp) => {
              this.solicitudes = resp;
              resolve();
            },
          })
      );
    });
  }

  onSubmit() {
    //
    //ID_TIPO_INGRESO_TRAMITE.MESA_SIN_VALIDAR es un tipo parecido a ID_TIPO_INGRESO_TRAMITE.MESA. La única diferencia es que ID_TIPO_INGRESO_TRAMITE.MESA_SIN_VALIDAR permite caragr el componente angular en el proceso de trámite.
    if (this.tramite?.idTipoIngreso === ID_TIPO_INGRESO_TRAMITE.MESA_SIN_VALIDAR) {
      this.tramite.idTipoIngreso = ID_TIPO_INGRESO_TRAMITE.MESA;
    }
    //
    let datos = this.formulario.getRawValue();

    if (datos.accion === undefined || datos.accion === null || datos.accion === '') {
      this.modalDialogService.error('Formulario incompleto', 'Por favor, seleccionar una acción a realizar'); return;
    }

    if ((datos.accion === 'O' || datos.accion === 'N') && (datos.correo === undefined || datos.correo === null || datos.correo === '' || datos.descripcion === undefined || datos.descripcion === null || datos.descripcion === '')) {
      this.modalDialogService.error('Formulario incompleto', 'Por favor, complete la información para enviar el correo.')
      return;
    }

    if (datos.accion === 'R' && (datos.tramite === undefined || datos.tramite === null || datos.tramite === '' || datos.acto === undefined || datos.acto === null || datos.acto === '')) {
      this.modalDialogService.error('Formulario incompleto', 'Por favor, asocie el trámite.'); return;
    }
    if (datos.accion === 'R' && datos.respuesta && (datos.solicitud === undefined || datos.solicitud === null || datos.solicitud === '')) {
      this.modalDialogService.error('Formulario incompleto', 'Por favor, seleccione la solicitud a asociar'); return;
    }
    if (datos.accion === 'R' && this.tramite!.idTipoIngreso === ID_TIPO_INGRESO_TRAMITE.MIXTO && this.tramite!.tramiteMixtoBorrador > 0) {
      this.modalDialogService.warning('No se puede asociar este documento', 'Existe un acta en desarrollo para el trámite ' + this.tramite?.nombreTramite + ', firmela o eliminela para poder recibir este documento', 'OK');
      this.formulario.get('tramite')?.setValue(null);
      this.formulario.get('acto')?.setValue(null);
      this.tramite = null;
      return;
    }

    if (datos.accion === 'R' && this.tramite?.idTipoIngreso !== ID_TIPO_INGRESO_TRAMITE.MESA && this.tramite?.idTipoIngreso !== ID_TIPO_INGRESO_TRAMITE.MIXTO) {
      this.modalDialogService.warning('No se puede asociar este documento', 'Este trámite se debe ingresar por la fiscalia', 'OK');
      this.formulario.get('tramite')?.setValue(null);
      this.formulario.get('acto')?.setValue(null);
      this.tramite = null;
      return;
    }

    if ((datos.accion === 'R' && this.tramite?.idTipoIngreso === ID_TIPO_INGRESO_TRAMITE.MIXTO && this.tramite!.tramiteCreado === 0)
      || (datos.accion === 'R' && this.tramite?.idTipoIngreso === ID_TIPO_INGRESO_TRAMITE.MESA) || datos.accion !== 'R') {
      this.guardarAtencion(false);
    } else if (this.tramite?.idTipoIngreso === ID_TIPO_INGRESO_TRAMITE.MIXTO && this.tramite!.tramiteCreado > 0) {
      const dialog = this.modalDialogService.question(
        'Adjuntar resolución ',
        'Ya se ha registrado un acta para el trámite ' + this.tramite?.nombreTramite + ', esta resolución se adjuntará. ¿Desea continuar?',
        'Sí',
        'No'
      )
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.guardarAtencion(true);
          }
        }
      });
    }
  }

  // Función para eliminar el texto
  eliminarTexto(textoPrincipal: string, textoEliminar: string): string {
    // Usamos replace para eliminar el texto específico
    const resultado = textoPrincipal.replace(textoEliminar, '').trim(); // trim para eliminar espacios
    return resultado;
  }

  private guardarAtencion(asociar: boolean) {
    this.spinner.show();
    let datos = this.formulario.getRawValue();
    let idCaso: string = '';
    let numeroCaso: string = '';
    if (this.cuadernoAsociado === null) {
      idCaso = this.documento.idCaso;
      numeroCaso = this.documento.numeroCaso;
    } else {
      idCaso = this.cuadernoAsociado.idCaso;
      numeroCaso = this.cuadernoAsociado.numeroCaso;
    }
    let request: DocumentoAtencionRequest = {
      accion: datos.accion,
      idCaso: idCaso,
      caso: numeroCaso,
      idDocumentoEscrito: this.documento.idDocumentoEscrito,
      nombreDocumento: this.documento.numeroDocumento,
      codigoDocumento: this.documento.numeroDocumentoPdf,
      acto: datos.accion === 'R' ? datos.acto : null,
      actoTramiteEstado: datos.accion === 'R' ? this.tramite!.actoTramiteEstado : null,
      correo: datos.accion === 'R' ? this.documento.correo?.toUpperCase() : datos.correo?.toUpperCase(),
      descripcion: datos.descripcion?.toUpperCase(),
      flag: datos.accion === 'R' ? datos.respuesta : null,
      solicitud: datos.accion === 'R' ? datos.solicitud : null,
      tramite: datos.accion === 'R' ? datos.tramite : null,
      idBandeja: this.documento.idBandeja,
      asociarDocumento: asociar
    };
    this.subscriptions.push(
      this.atenderDocumentoService.guardarAtencion(request).subscribe({
        next: (resp) => {
          this.spinner.hide();
          if (resp.code === 0) {
            if (datos.accion === 'R') {
              if (this.tramite!.flgSinRegdata === '1') {
                this.modalDialogService.success(
                  'DOCUMENTO RECIBIDO',
                  'Se ha recibido el documento y se comunicó por correo electrónico al remitente',
                  'OK'
                ).subscribe({
                  next: () => {
                    if (this.tramitesExcepcionRedirigir.includes(this.tramite!.idTramite)){
                      this.redireccionCasoCompleta(resp);
                    }
                    else{
                      this.documentosIngresadosService.reloadBandejaEscritos(true);
                    }
                    this.ref.close();
                  },
                  error: (error) => { console.error('Error:', error) }
                })
              }
              else {
                this.modalDialogService.warning(
                  'DOCUMENTO RECIBIDO',
                  'Se ha recibido el documento y se comunicó por correo electrónico al remitente.' + (!asociar ? 'Por favor tener en cuenta que se requiere que complete información adicional' : ''),
                  'OK'
                ).subscribe({
                  next: () => {
                    this.redireccionCasoCompleta(resp);
                    this.ref.close();
                  },
                  error: (error) => { console.error('Error:', error) }
                })
              }

            } else if (datos.accion === 'O') {
              this.modalDialogService.warning(
                'DOCUMENTO OBSERVADO',
                'Se ha registrado la observación al documento y se envió el detalle por correo electrónico al remitente',
                'OK'
              ).subscribe({
                next: () => {
                  this.documentosIngresadosService.reloadBandejaEscritos(true);
                  this.ref.close();
                },
                error: (error) => { console.error('Error:', error) }
              })
            } else if (datos.accion === 'N') {
              this.modalDialogService.error(
                'DOCUMENTO NO PRESENTADO',
                'Se ha registrado el no presentado al documento y se envió el detalle por correo electrónico al remitente',
                'OK'
              ).subscribe({
                next: () => {
                  this.documentosIngresadosService.reloadBandejaEscritos(true);
                  this.ref.close();
                },
                error: (error) => { console.error('Error:', error) }
              })
            }
          } else {
            this.formulario.get('tramite')?.setValue(null);
            this.formulario.get('acto')?.setValue(null);
            this.tramite = null;
            this.modalDialogService.error('ERROR', 'Error al atender el documento');
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.modalDialogService.error('ERROR', 'Error al atender el documento');
          console.error(err);
        },
      })
    );
  }

  private redireccionCasoCompleta(resp: any): void {
    const idEtapa = this.etapa;
    const idCaso = this.cuadernoAsociado?.idCaso ?? this.documento.idCaso;
    const flgConcluido = resp.data.flagConcluido;
    const idClasificadorExpediente = this.tramite?.clasificador?.toString() ?? '0';
    const idTipoClasificadorExpediente = this.tramite?.tipoClasificador?.toString() ?? '000';
    const commonParams = { idEtapa, idCaso, flgConcluido };

    const urlBaseRedireccion = (() => {
      switch (idClasificadorExpediente) {
        case '2':
          return urlConsultaCuaderno('incidental', commonParams);
        case '4':
          return urlConsultaCuaderno('extremo', commonParams);
        case '5':
          return urlConsultaPestanaApelacion(idTipoClasificadorExpediente, this.documento.idCaso);
        default:
          return urlConsultaCasoFiscal(commonParams);
      }
    })();

    if (this.tramite?.clasificador === 5) {
      const ruta = `${urlBaseRedireccion}/apelaciones`;
      this.router.navigate([ruta], { queryParams: { openModal: this.cuadernoAsociado?.idCaso, idActoTramiteCaso: resp.data.idActoTramiteCaso, isTramiteEnModoEdicion: true } });
    } else {
      const ruta = `${urlBaseRedireccion}/acto-procesal/${resp.data.idActoTramiteCaso}/editar`;
      this.router.navigate([ruta]);
    }
  }

  ObtenerAtenderDocumento(idDocumento: any, estadoDocumento: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.bandejaDocumentosVisorService
          .obtenerAtenderDocumento(idDocumento, estadoDocumento)
          .subscribe({
            next: (resp) => {
              if (estadoDocumento === '585') {
                this.formulario.get('accion')!.setValue('O');
              } else if (estadoDocumento == '664') {
                this.formulario.get('accion')!.setValue('N');
              } else if (estadoDocumento == '668') {
                this.formulario.get('accion')!.setValue('R');
              }

              if (resp.data[0] != undefined) {
                this.formulario.patchValue({
                  tramite: resp.data[0].tramite,
                  acto: resp.data[0].acto,
                  respuesta: resp.data[0].respuesta,
                  solicitud: resp.data[0].solicitud,
                  descripcion: resp.data[0].observacion,
                  /**correo: resp.data[0].email,**/
                  correo: this.documento.correo,
                });
              }

              /**if (estadoDocumento == '664') {
                this.formulario.get('descripcion')!.setValue('No se ha subsanado la observación en el plazo establecido');
              }**/
              this.formulario.disable();
            },
          })
      );
    });
  }
}
