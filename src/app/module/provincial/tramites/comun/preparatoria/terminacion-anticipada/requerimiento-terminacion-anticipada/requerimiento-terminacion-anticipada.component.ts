import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SujetosRequerimientoTaComponent } from '@core/components/modals/sujetos-requerimiento-ta/sujetos-requerimiento-ta.component';
import { ContadorFooterTextareaComponent } from '@core/components/reutilizable/contador-footer-textarea/contador-footer-textarea.component';
import { GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { RequerimientoTA, SujetosRequerimientoTA } from '@core/interfaces/provincial/tramites/comun/preparatoria/requerimiento-inconcurrencia-ta';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { RequerimientoTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preparatoria/requerimiento-ta.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { capitalizedFirstWord } from '@core/utils/string';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO, IconAsset } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { catchError, map, Observable, Subscription, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-requerimiento-terminacion-anticipada',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CmpLibModule,
    ButtonModule,
    InputTextareaModule,
    ContadorFooterTextareaComponent
  ],
  templateUrl: './requerimiento-terminacion-anticipada.component.html',
  styleUrl: './requerimiento-terminacion-anticipada.component.scss'
})
export class RequerimientoTerminacionAnticipadaComponent implements OnDestroy, OnInit {

  @Input() idCaso!: string;
  @Input() tramiteSeleccionado!: TramiteProcesal;
  @Input() idActoTramiteCaso!: string;
  @Input() numeroCaso!: string;
  @Output() peticionParaEjecutar = new EventEmitter<() => any>();

  protected formulario!: FormGroup;
  public suscripciones: Subscription[] = [];
  protected sujetosAceptados: boolean = false;
  protected formularioIncompleto: boolean = false;
  private obteniendoInformacion: boolean = false;
  private listaSujetosProcesales: SujetosRequerimientoTA[] = [];

  protected fb = inject(FormBuilder);
  protected iconAsset = inject(IconAsset);

  protected readonly tramiteService = inject(TramiteService);
  private readonly dialogService = inject(DialogService);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly firmaIndividualService = inject(FirmaIndividualService);
  private readonly requerimientoTaService = inject(RequerimientoTerminacionAnticipadaService);

  constructor() {
    this.formulario = this.fb.group({
      observaciones: new FormControl(null, [Validators.maxLength(200)]),
    });
  }


  ngOnInit(): void {
    this.obtenerDatoRequerimiento();

    if (!this.esPosibleEditarFormulario) {
      this.formulario.disable();
    }

    this.formulario.valueChanges.subscribe(() => {
      if (!this.obteniendoInformacion) {
        this.formularioIncompleto = !this.sujetosAceptados;
        this.formularioEditado(true);
        this.habilitarGuardar(true);
      }
    });

    this.suscripciones.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.formulario.disable();
          }
        }
      )
    );

    this.peticionParaEjecutar.emit(() => this.guardarDatosRequerimiento());
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }
  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite);
  }


  protected get esPosibleEditarFormulario(): boolean {
    return (
      this.tramiteService.validacionTramite.idEstadoRegistro ===
      ESTADO_REGISTRO.BORRADOR
    );
  }

  private obtenerDatoRequerimiento() {
    this.suscripciones.push(
      this.requerimientoTaService
        .obtenerRequerimiento(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: GenericResponseModel<RequerimientoTA>) => {

            this.obteniendoInformacion = true;

            this.formulario.patchValue({
              observaciones: resp.data.observaciones,
            });

            this.formularioIncompleto = resp.data.formularioIncompleto;

            this.listaSujetosProcesales = resp.data.listaSujetos;

            if (!this.formularioIncompleto) {
              this.sujetosAceptados = true;
              this.formularioEditado(false);
            } else {
              this.formularioEditado(true);
              this.habilitarGuardar(true);
            }

            this.obteniendoInformacion = false;
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'No se pudo obtener la información del trámite : <b>' +
              this.nombreTramite() +
              '</b>.',
              'Aceptar'
            );
          },
        })
    );
  }

  protected openModalSujetos() {
    const ref = this.dialogService.open(SujetosRequerimientoTaComponent, {
      showHeader: false,
      data: {
        idActoTramiteCaso: this.idActoTramiteCaso,
        numeroCaso: this.numeroCaso,
        listaSujetosProcesales: this.listaSujetosProcesales
      },
      contentStyle: { padding: '0', 'border-radius': '15px' },
    });

    ref.onClose.subscribe((data?: boolean) => {
      if (data !== undefined) {
        this.sujetosAceptados = true;
        this.formularioIncompleto = false;
      }
    });
  }

  private guardarDatosRequerimiento(): Observable<any> {
    let data: RequerimientoTA = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      observaciones: this.formulario.get('observaciones')?.value,
      formularioIncompleto: this.formularioIncompleto,
      listaSujetos: this.listaSujetosProcesales,
    };

    return this.requerimientoTaService.guardarRequerimiento(data).pipe(
      tap(() => {
        this.formularioEditado(this.formularioIncompleto);
        this.modalDialogService.success(
          'Datos guardado correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' +
          this.nombreTramite() +
          '</b>.',
          'Aceptar'
        );
      }),
      map(() => 'válido'),
      catchError(() => {
        this.modalDialogService.error(
          'Error',
          'No se pudo guardar la información para el trámite: <b>' +
          this.nombreTramite() +
          '</b>.',
          'Aceptar'
        );
        return throwError(() => new Error('Error al guardar'));
      })
    );
  }

}
