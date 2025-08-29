import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GenericResponse, GenericResponseList } from '@core/interfaces/comunes/GenericResponse';
import { GuardarSujetosInconcurrencia, SujetosInconcurrenciaTA } from '@core/interfaces/provincial/tramites/comun/preparatoria/acta-inconcurrencia-ta';
import { ActaInconcurrenciaTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preparatoria/acta-inconcurrencia-ta.service';
import { capitalizedFirstWord } from '@core/utils/string';
import { CmpLibModule } from 'dist/cmp-lib';
import { StringUtil } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-sujetos-acta-inconcurrencia-ta',
  standalone: true,
  imports: [CommonModule, ButtonModule, CmpLibModule, TableModule, RadioButtonModule, ReactiveFormsModule, FormsModule, CheckboxModule],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './sujetos-acta-inconcurrencia-ta.component.html',
  styleUrl: './sujetos-acta-inconcurrencia-ta.component.scss',
})
export class SujetosActaInconcurrenciaTaComponent {

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);

  private readonly suscripciones: Subscription[] = [];

  protected readonly dialogRef = inject(DynamicDialogRef);

  protected readonly stringUtil = inject(StringUtil);

  private readonly config = inject(DynamicDialogConfig);

  private readonly actaInconcurrenciaTaService = inject(ActaInconcurrenciaTerminacionAnticipadaService);

  protected idActoTramiteCaso!: string;
  public numeroCaso!: string;
  public modoLectura!: boolean;
  public formularioValido!: boolean;
  
  protected listaSujetosProcesales: SujetosInconcurrenciaTA[] = [];
  protected listaSujetosProcesalesIniciales: SujetosInconcurrenciaTA[] = [];

  constructor() {
    this.idActoTramiteCaso = this.config.data.idActoTramiteCaso;
    this.numeroCaso = this.config.data.numeroCaso;
    this.modoLectura = this.config.data.modoLectura;
    this.formularioValido = this.config.data.formularioValido;
  }

  ngOnInit(): void {
    this.listarSujetosProcesales();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  protected listarSujetosProcesales(): void {
    this.suscripciones.push(
      this.actaInconcurrenciaTaService.listarSujetosProcesales(this.idActoTramiteCaso).subscribe({
        next: (resp: GenericResponseList<SujetosInconcurrenciaTA>) => {
          this.listaSujetosProcesales = resp.data.map(sujeto => ({
            ...sujeto,
            noAsistio: !!sujeto.noAsistio,
            reprogramado: !!sujeto.reprogramado
          }));
          this.listaSujetosProcesalesIniciales = JSON.parse(JSON.stringify(this.listaSujetosProcesales));
          this.seleccionarTodosNoAsistio =  this.listaSujetosProcesales.every(sujeto => sujeto.noAsistio === true);
          this.seleccionarTodosReprogramar =  this.listaSujetosProcesales.every(sujeto => sujeto.reprogramado === true);
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar listar los sujetos procesales`, 'Aceptar')
        }
      })
    )
  }

  protected mostrarDelitos(delito: any): string {
    if (delito && Object.keys(delito).length > 0) {
      return Object.values(delito)
        .map((item: any) => capitalizedFirstWord(item.toString()))
        .join(' / ');
    } else {
      return '-';
    }
  }

  get tieneAlgunNoAsistio(): boolean {
    return this.listaSujetosProcesales.some(sujeto => sujeto.noAsistio === true);
  }

  get hayCambiosEnSujetos(): boolean {
    return JSON.stringify(this.listaSujetosProcesales) !== JSON.stringify(this.listaSujetosProcesalesIniciales);
  }

  get botonHabilitado(): boolean {
    return this.tieneAlgunNoAsistio && this.hayCambiosEnSujetos;
  }

  protected onNoAsistioChange(sujeto: any, checked: boolean): void {
    sujeto.noAsistio = checked;
    if (!checked) {
      sujeto.reprogramado = false;
    }
  }

  seleccionarTodosNoAsistio: boolean = false;

  onToggleSeleccionarTodosNoAsistio(checked: boolean): void {
    this.seleccionarTodosNoAsistio = checked;
    this.listaSujetosProcesales.forEach(sujeto => {
      sujeto.noAsistio = checked;
      if (!checked) {
        sujeto.reprogramado = false;        
      }
    });
    this.seleccionarTodosReprogramar = false;
  }

  seleccionarTodosReprogramar: boolean = false;

  onToggleSeleccionarTodosReprogramado(checked: boolean): void {
    this.seleccionarTodosReprogramar = checked;
    this.listaSujetosProcesales.forEach(sujeto => {
      sujeto.reprogramado = checked;
    });
  }

  protected guardarSujetos() {

    let request: GuardarSujetosInconcurrencia = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      formularioIncompleto: !(this.tieneAlgunNoAsistio && this.formularioValido),
      listaSujetos: this.listaSujetosProcesales
    }

    const mostrarError = () => {
      this.modalDialogService.error(
        'Error',
        'No se pudo guardar la información de los sujetos procesales',
        'Aceptar'
      );
    };

    this.suscripciones.push(
      this.actaInconcurrenciaTaService.guardarSujetosProcesales(request).subscribe({
        next: (resp: GenericResponse) => {
          resp.code === 0
            ? this.mostrarExitoYCerrar()
            : mostrarError();
        },
        error: mostrarError
      })
    );
  }

  private mostrarExitoYCerrar(): void {
    this.modalDialogService.success(
      'Datos guardado correctamente',
      'Se guardó la información de los sujetos procesales correctamente',
      'Aceptar'
    );
    this.dialogRef.close(this.tieneAlgunNoAsistio);
  }
}
