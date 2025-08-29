import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AcumulacionRequest } from '@interfaces/provincial/tramites/acumulacion/acumulacion-request';
import { CasosAcumular } from '@interfaces/provincial/tramites/acumulacion/casos-acumular';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { AcumulacionService } from '@services/provincial/tramites/acumulacion.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropdownModule } from 'primeng/dropdown';
import { catchError, firstValueFrom, Observable, of, Subject, Subscription, switchMap, takeUntil, throwError } from 'rxjs';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { anioNumCaso } from '@core/interfaces/provincial/tramites/acumulacion/anio-numero-caso.interface';
import { obtenerRutaParaEtapa } from '@core/utils/utils';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-acumulacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownModule, NgxCfngCoreModalDialogModule, MessagesModule],
  templateUrl: './acumulacion.component.html',
  styleUrls: ['./acumulacion.component.scss'],
})
export class AcumulacionComponent implements OnInit {
  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Input() tramiteEnModoEdicion = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso!: string;
  @Input() idEstadoTramite!: number;
  @Input() datosExtra!: any;

  @Output() datosFormulario = new EventEmitter<Object>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
  @Output() ocultarTitulo = new EventEmitter<boolean>();
  @Output() ocultarBotonTramite = new EventEmitter<boolean>();

  //firma
  private desuscribir$ = new Subject<void>();

  /**private _idActoTramiteCaso: string = '';**/
  private suscripciones: Subscription[] = [];

  /**public casoSeleccionado!: CasosAcumular;**/
  public casoSeleccionado!: string;
  private casoSeleccionadoInicial: string = '';

  public esCasoPadre: boolean = false;

  public idCasoAcumular: String = '';
  public listaCasos: CasosAcumular[] = [];
  public acumulacion!: AcumulacionRequest;
  public habilitarCasoAcumular: boolean = false;

  public casoFiscal!: Expediente;
  public message: Message[] = [];
  public showMessage: boolean = false;
  public tramiteCaso!: any;

  constructor(
    private spinner: NgxSpinnerService,
    private acumulacionService: AcumulacionService,
    private tramiteService: TramiteService,
    private gestionCasoService: GestionCasoService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private firmaIndividualService: FirmaIndividualService,
    @Optional() public referenciaModal: DynamicDialogRef // 👈 Aquí está la clave
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    try {
      await this.obtenerDatosTramiteCaso(this.idActoTramiteCaso);
      await this.obtenerCasosxAcumular();

      this.casoFiscal = this.gestionCasoService.expedienteActual;
      /**await this.obtenerAcumulacion();**/
      if (this.datosExtra?.idCasoAcumulado != null) {
        this.obtenerAcumulacionDerivacion();
      } else {
        await this.obtenerAcumulacion();
      }

      this.peticionParaEjecutar.emit(() =>
        this.guardarFormulario()
      )

      //toma la respuesta de firma
      this.firmaIndividualService.esFirmadoCompartidoObservable.pipe(
        takeUntil(this.desuscribir$)
      ).subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            /**this.habilitarCasoAcumular = true;**/
            if (this.datosExtra?.idCasoAcumulado != null) {
                if (this.referenciaModal) {
                  this.referenciaModal.close('derivado');
                }
            }
          }
        }
      );

    } catch (error) {
      console.error('Error en la carga de datos:', error);
    }
  }

  ngOnDestroy(): void {
    this.ocultarTitulo.emit(false);
    this.ocultarBotonTramite.emit(false);
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  get tramiteEstadoFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.tramiteService.tramiteEnModoVisor;
  }

  //guarda los datos del formulario
  private guardarFormulario(): Observable<any> {
    /**if (this.casoSeleccionado == undefined) {
      this.modalDialogService.error(
        'Acumular Caso',
        'Debe seleccionar al menos un número de caso acumular',
        'Aceptar'
      );
      return throwError(() => new Error('Falta completar los datos del causal'));
    }**/
    const acumulacion: AcumulacionRequest = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idCasoAcumular: this.casoSeleccionado,
      idCasoPadre: this.idCaso,
      etapa: this.etapa,
    };
    return this.acumulacionService.guardarAcumulacion(acumulacion).pipe(
      switchMap(_ => {
        this.tramiteService.formularioEditado = false;
        return of('válido');
      }),
      catchError(() => {
        this.modalDialogService.error(
          'Acumular Caso',
          'Error al guardar. Intente de nuevo.',
          'Aceptar'
        );
        return throwError(() => new Error('Error al guardar.'));
      })
    );
  }

  //obtiene la etapa por tramite caso
  async obtenerDatosTramiteCaso(idActoTramiteCaso: string): Promise<void> {
    this.spinner.show();
    try {
      const respuesta = await firstValueFrom(this.acumulacionService.obtenerDatosTramiteCaso(idActoTramiteCaso));
      this.tramiteCaso = respuesta;
      this.etapa = obtenerRutaParaEtapa(this.tramiteCaso.etapaId);

    } catch (error) {
      console.error('Error al obtener la etapa por tramite caso:', error);
    } finally {
      this.spinner.hide();
    }
  }

  //obtiene la lista de caso acumular
  async obtenerCasosxAcumular(): Promise<void> {
    this.spinner.show();
    try {
      // Asumiendo que obtenerCasosxAcumular retorna un Observable, lo convertimos a Promesa
      const respuesta = await firstValueFrom(this.acumulacionService.obtenerCasosxAcumular(this.etapa, this.idCaso));
      this.listaCasos = respuesta;

    } catch (error) {
      console.error('Error al obtener casos a acumular:', error);
    } finally {
      this.spinner.hide();
    }
  }

  public obtenerAcumulacionDerivacion(): void {
    this.casoSeleccionado = this.datosExtra.idCasoAcumulado;
    this.casoSeleccionadoInicial = this.casoSeleccionado;
    this.formularioEditado(true)
    this.habilitarGuardar(true)
  }

  public esCasoDerivado(){
    return this.datosExtra?.idCasoAcumulado!=null;
  }

  //obtiene el caso que ha sido acumulado
  public async obtenerAcumulacion(): Promise<void> {
    this.spinner.show();
    try {
      // Convertimos el Observable en una Promesa
      const respuesta = await firstValueFrom(this.acumulacionService.obtenerCasosAcumular(this.etapa, this.idActoTramiteCaso));
      this.acumulacion = respuesta;

      if (!(this.acumulacion.idCasoPadre == null || this.acumulacion.idCasoPadre === undefined)) {
        this.casoSeleccionado = this.acumulacion.idCasoPadre;
        this.casoSeleccionadoInicial = this.casoSeleccionado;

        if (this.tramiteService.tramiteEnModoVisor) {
          this.formularioEditado(true);
          this.habilitarGuardar(false);
        } else {
          this.formularioEditado(!this.formularioValido);
          this.habilitarGuardar(this.formularioValido);
        }
      }

    } catch (error) {
      console.log(error);
    } finally {
      this.spinner.hide();
    }
  }

  //evento change al selecionar el caso que se va acumular
  alSeleccionarCaso(): void {
    this.showMessage = false;
    this.esCasoPadre = false;

    if (this.casoSeleccionado != null && this.casoSeleccionado != undefined) {
      const caso = this.obtenerCasoPorCodigo(this.casoSeleccionado);
      /**if (caso?.esCasoPadre === '1') {
        this.modalDialogService.warning(
          'NO PUEDE REALIZAR LA ACUMULACIÓN',
          'Se verificó que el caso que intenta acumular cuenta con casos asociados. Por lo cual, no podrá realizar el proceso de acumulación',
          'Aceptar'
        );
        this.esCasoPadre = true;
      } else {**/
      const casoHijo = this.separarTexto(this.casoFiscal.anioNumCaso + '-' + this.casoFiscal.numSecuencial);//caso detallado
      const casoPadre = this.separarTexto(caso!.anioCaso + '-' + caso!.numCaso + '-' + caso?.numSecuencial);//caso acumular

      if (this.compararRegistros(casoPadre, casoHijo) == 1) {
        this.showMessage = true;
        this.obtenerMessageMasAntiguo();
      }
      /**}**/
    }

    this.establecerBotonesTramiteSiCambio();
  }

  get formularioValido(): boolean {
    return this.casoSeleccionado != null && !this.esCasoPadre && !this.showMessage;
  }

  protected elFormularioHaCambiado(): boolean {
    return this.casoSeleccionadoInicial !== this.casoSeleccionado;
  }

  private establecerBotonesTramiteSiCambio(): void {
    const cambio = this.elFormularioHaCambiado();
    if (cambio) {
      this.formularioEditado(true)
      this.habilitarGuardar(this.formularioValido)
    } else if (this.formularioValido) {
      this.habilitarFirma()
    } else {
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    }
  }

  public habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  //obteniendo el objeto completo del CasosAcumular si se encuentra, o null si no.
  private obtenerCasoPorCodigo(idCaso: string): CasosAcumular | null {
    return this.listaCasos.find(c => c.idCaso === idCaso) || null;
  }

  // Método para comparar ambos casos (el numSecuencial no esta actualizado en la bbdd y no lo esta guardando)
  private compararRegistros(registro1: anioNumCaso, registro2: anioNumCaso): number {
    if (registro1.anioCaso > registro2.anioCaso) {
      return 1; // El primer registro es mayor
    } else if (registro1.anioCaso < registro2.anioCaso) {
      return -1; // El segundo registro es mayor
    } else {
      // Si los años son iguales, comparamos el correlativo
      if (registro1.numCaso > registro2.numCaso) {
        return 1; // El primer registro es mayor
      } else if (registro1.numCaso < registro2.numCaso) {
        return -1; // El segundo registro es mayor
      } else {
        // Si el correlativo es igual, comparamos por el número de secuencia
        if (registro1.numSecuencial > registro2.numSecuencial) {
          return 1; // El primer registro es mayor
        } else if (registro1.numSecuencial < registro2.numSecuencial) {
          return -1; // El segundo registro es mayor
        } else {
          return 0; // Los registros son iguales
          //return 0; // Son iguales (aunque esto no debería ocurrir porque el correlativo es único)
        }
      }
    }
  }

  //metodo para separar el anio, numero y secuencia
  private separarTexto(texto: string): anioNumCaso {
    const partes = texto.split('-');  // Dividir el texto por el guion "-"
    const anioNumCaso: anioNumCaso = { anioCaso: 0, numCaso: 0, numSecuencial: 0 };
    anioNumCaso.anioCaso = parseInt(partes[0], 10);
    anioNumCaso.numCaso = parseInt(partes[1], 10);
    anioNumCaso.numSecuencial = parseInt(partes[2], 10);
    return anioNumCaso;
  }

  obtenerMessageMasAntiguo(): void {
    this.message = [
      {
        severity: 'warn',
        summary: '',
        detail: 'El número de caso al que se va acumular, no es el más antiguo',
        icon: 'pi-info-circle icon-color'
      },
    ];
  }

}
