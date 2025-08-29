import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {DesacumulacionService} from '@services/provincial/desacumulacion/desacumulacion.service';
import {Desacumulacion} from '@interfaces/provincial/tramites/comun/calificacion/desacumulacion/desacumulacion.interface';
import {InputTextModule} from 'primeng/inputtext';
import {NgxSpinnerService} from 'ngx-spinner';
import {catchError, Observable, of, Subscription, throwError} from 'rxjs';
import {TramiteService} from "@services/provincial/tramites/tramite.service";
import {switchMap} from "rxjs/operators";
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';

@Component({
  selector: 'app-desacumulacion-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, NgxCfngCoreModalDialogModule],
  templateUrl: './desacumulacion-formulario.component.html',
  styleUrls: ['./desacumulacion-formulario.component.scss'],
})
export class DesacumulacionFormularioComponent implements OnInit {
  @Input() etapa: string = '';
  @Input() idCaso: string = '';
  @Input() esNuevo: boolean = false;
  @Input() datosExtra: Desacumulacion | null = null;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
      !this.esNuevo && this.obtenerDatosFormulario();
      this.esNuevo && this.guardarFormulario();
    }
  }
  @Output() datosFormulario = new EventEmitter<Object>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  private _idActoTramiteCaso: string = '';
  public txtMotivo: String = '';
  public form!: FormGroup;
  private suscripciones: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private desacumulacionService: DesacumulacionService,
    private spinner: NgxSpinnerService,
    protected tramiteService: TramiteService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {}

  ngOnInit(): void {
    this.formBuild();
    this.peticionParaEjecutar.emit((datos: any) =>
      this.guardarFormulario()
    );
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  private formBuild(): void {
    this.form = this.fb.group({
      motivo: ['', [Validators.required, Validators.maxLength(200)]],
    });
    if(this.tramiteService.tramiteEnModoVisor){
      this.form.get('motivo')!.disable();
    }
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso;
  }

  get formularioValido(): boolean {
    if (!this.form) {
      return false;
    }
    return this.form.valid;
  }

  private obtenerDatosFormulario(): void {
    this.spinner.show();
    this.suscripciones.push(
      this.desacumulacionService
        .obtener(this.etapa, this.idActoTramiteCaso)
        .subscribe({
          next: (datos) => {
            if(datos.motivo.length > 0){
              this.tramiteService.formularioEditado = false;
              this.form.patchValue({
                motivo: datos.motivo,
              });
            }else{
              this.tramiteService.formularioEditado = true;
              this.tramiteService.habilitarGuardar = false;
            }
            this.spinner.hide();
          },
          error: (error) => {
            this.spinner.hide();
          },
        })
    );
  }

  private guardarFormulario(): Observable<any> {
    const formulario = this.form.getRawValue();
    const dataDesacumulacion: Desacumulacion = {
      etapa: this.etapa,
      idCasoPadre: this.datosExtra!.idCasoPadre,
      idCasoAAcumular: this.datosExtra!.idCasoAAcumular,
      motivo: formulario.motivo,
      idActoTramiteCasod: this.idActoTramiteCaso
    };
    return this.desacumulacionService.registrar(dataDesacumulacion).pipe(
      switchMap(_ => {
        this.modalDialogService.success(
          'Trámite',
          'Registros guardados correctamente.',
          'Aceptar'
        );
        this.tramiteService.formularioEditado = false;
        return of('válido');
      }),
      catchError(() => {
        this.modalDialogService.error(
          'Desacumulación',
          'Error al guardar. Intente de nuevo.',
          'Aceptar'
        );
        return throwError(() => new Error('Error al guardar.'));
      })
    );
  }

  protected eventoIngresarTexto(e:any){
    if(this.txtMotivo.length > 0){
      this.tramiteService.habilitarGuardar = true;
    }else{
      this.tramiteService.habilitarGuardar = false;
    }
    this.tramiteService.formularioEditado = true;
  }

}
