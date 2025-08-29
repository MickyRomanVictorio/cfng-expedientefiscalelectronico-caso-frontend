import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenericResponse, GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import { ApelacionFiscalia } from '@core/interfaces/provincial/tramites/fundado-procedente/apelacion-fiscalia';
import { ApelacionesResultadosService } from '@core/services/provincial/tramites/especiales/registrar-resultado-audiencia/fundada-procedente/apelaciones-resultados.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ID_N_RSP_APELACION } from '@core/types/efe/provincial/tramites/especial/respuesta-apelacion.type';

@Component({
  selector: 'app-apelacion-fiscalia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    RadioButtonModule
  ],
  templateUrl: './apelacion-fiscalia.component.html',
  styleUrl: './apelacion-fiscalia.component.scss'
})
export class ApelacionFiscaliaComponent implements OnInit, OnDestroy {

  @Input() data!: any;
  @Input() modoLectura!: boolean;

  public subscriptions: Subscription[] = [];

  formApelacionFiscalia: FormGroup;
  verMensajeApelacion: boolean = false;
  idActoTramiteCaso!: string;
  idCaso!: string;

  CONSENTIDO: number = ID_N_RSP_APELACION.CONSENTIDO;

  constructor(
    private apelacionesResultadosService: ApelacionesResultadosService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private fb: FormBuilder
  ) {
    this.formApelacionFiscalia = this.fb.group({
      resultadoApelacion: [null, [Validators.required]],
    });

  }

  ngOnInit() {
    this.idActoTramiteCaso = this.data?.idActoTramiteCaso;
    this.idCaso = this.data?.idCaso;
    this.formApelacionFiscalia.get('resultadoApelacion')?.setValue(0);
    this.obtenerApelacionFiscalia();
    
    if (this.modoLectura ) this.formApelacionFiscalia.disable()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  obtenerApelacionFiscalia() {
    this.subscriptions.push(
      this.apelacionesResultadosService
        .obtenerApelacionDeLaFiscalia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: GenericResponseModel<ApelacionFiscalia>) => {
            if (resp?.code == 200 && resp.data !== null) {
              this.formApelacionFiscalia.get('resultadoApelacion')?.setValue(resp.data.idRspInstancia);
            }
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar obtener la apelación de la fiscalía',
              'Aceptar'
            );
          },
        })
    );
  }


  onChangeResultadoApelacionFiscalia() {
    this.verMensajeApelacion = false;
    let data = this.formApelacionFiscalia.getRawValue();

    let request: ApelacionFiscalia = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idRspInstancia: data.resultadoApelacion === 0 ? null : data.resultadoApelacion
    }

    this.guardarResultadoApelacion(request);

  }

  guardarResultadoApelacion(request: ApelacionFiscalia) {
    this.subscriptions.push(
      this.apelacionesResultadosService
        .registrarApelacionDeLaFiscalia(request)
        .subscribe({
          next: (resp: GenericResponse) => {
            if (resp?.code == 200) {
              this.verMensajeApelacion = true;
            }
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar registrar la apelación de la fiscalía',
              'Aceptar'
            );
          },
        })
    );
  }
}
