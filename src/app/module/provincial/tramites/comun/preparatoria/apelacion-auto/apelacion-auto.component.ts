import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import {
  DynamicDialogModule
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { catchError, map, Observable, Subscription, tap, throwError } from 'rxjs';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { ElevacionActuadosService } from '@services/provincial/tramites/comun/calificacion/elevacion-actuados/elevacion-actuados.service';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import {
  ProcesarElevacionActuados
} from '@interfaces/provincial/tramites/comun/calificacion/elevacion-actuados/procesar-elevacion-actuados';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { capitalizedFirstWord } from '@core/utils/string';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';

@Component({
  selector: 'app-apelacion-auto',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    MessagesModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './apelacion-auto.component.html',
  styleUrls: ['./apelacion-auto.component.scss'],
})
export class ApelacionAutoComponent implements OnInit, OnDestroy {
  
  private readonly subscriptions: Subscription[] = []

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly tramiteService = inject(TramiteService)

  private readonly elevacionActuadosService = inject(ElevacionActuadosService)

  private readonly firmaIndividualService = inject(FirmaIndividualService)

  private readonly fb = inject(FormBuilder)

  public idCaso!:string

  public etapa!:string

  public tramiteSeleccionado: TramiteProcesal | null = null

  public idActoTramiteCaso!: string

  public idEstadoTramite!: number

  @Output() peticionParaEjecutar = new EventEmitter<() => Observable<any>>()

  public fiscaliasSuperiores: any[] = []

  public fiscaliaSuperiorSeleccionada: string | null = null

  public formRegistro!: FormGroup

  ngOnInit(): void {

    this.formBuild();

    this.listarFiscaliasSuperiores();

    this.obtenerFormulario();

    this.peticionParaEjecutar.emit(() => this.guardarFormulario())

    if (this.tramiteEnModoVisor || this.tramiteEstadoFirmado) {
      this.formRegistro.disable()
      this.habilitarFirmar(false)
    }

    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.formRegistro.disable()
          }
        }
      )
    )
  }

  private formBuild(): void {
    this.formRegistro = this.fb.group({
      fiscaliaSuperiorSeleccionada: null,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public obtenerFormulario() {
    this.subscriptions.push(
      this.elevacionActuadosService.obtenerFiscaliaSuperiorSeleccionada(this.idActoTramiteCaso, this.etapa)
        .subscribe({
          next: (resp) => {
            if (resp != undefined) {
              this.formRegistro.patchValue({fiscaliaSuperiorSeleccionada: resp.toString()});
              this.fiscaliaSuperiorSeleccionada = resp.toString()
              this.habilitarGuardar(false);
              this.formularioEditado(false);
            }
          },
          error: () => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar obtener la información del trámite`, 'Aceptar')
          },
        })
    );
  }

  private listarFiscaliasSuperiores(): void {
    this.subscriptions.push(
      this.elevacionActuadosService.listarFiscaliasSuperiores(this.etapa)
        .subscribe({
          next: (resp) => {
            this.fiscaliasSuperiores = resp;
          },
          error: () => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar listar las fiscalias superiores`, 'Aceptar')
          },
        })
    );
  }

  public alSeleccionarFiscaliaSuperior(fiscalia:string): void {
    if(this.fiscaliaSuperiorSeleccionada){
      if(this.fiscaliaSuperiorSeleccionada !== fiscalia){
        this.formularioEditado(true)
        this.habilitarGuardar(true)
      }
      else{
      this.formularioEditado(false)
      this.habilitarGuardar(false)
      }
    }
    else{
      this.habilitarGuardar(true)
    }
  }


  protected guardarFormulario(): Observable<any> {
    const datosApelacion: ProcesarElevacionActuados = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      etapa: this.etapa,
      fiscaliaSuperior: this.formRegistro.get('fiscaliaSuperiorSeleccionada')?.value
    }

    return this.elevacionActuadosService.guardarDisposicionElevacionActuados(datosApelacion).pipe(
      tap(() => {
        this.formularioEditado(false)
        this.modalDialogService.success(
          'Datos guardado correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.nombreTramite() + '</b>.',
          'Aceptar'
        );
        this.fiscaliaSuperiorSeleccionada = this.formRegistro.get('fiscaliaSuperiorSeleccionada')?.value
      }),
      map(() => 'válido'),
      catchError((err:any) => {
        const parsedError = JSON.parse(err.error);
        if(parsedError.code === '42200000'){
          this.modalDialogService.warning('No puede guardar la fiscalia superior', parsedError.message, 'Aceptar');
        }
        else{
          this.modalDialogService.error(
            'Error',
            'No se pudo guardar la información para el trámite: <b>' + this.nombreTramite() + '</b>.',
            'Aceptar'
          );
        }
        return throwError(() => new Error('Error al guardar'));
      })
    );
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }
  protected habilitarFirmar(valor: boolean) {
    this.tramiteService.habilitarFirmar = valor
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }
  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }
  protected get tramiteEstadoFirmado(): boolean {
      return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO
  }
}
