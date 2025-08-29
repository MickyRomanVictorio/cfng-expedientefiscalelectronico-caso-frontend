import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService, SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ReactiveFormsModule } from '@angular/forms';

import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { ReusablesSujetoProcesalService } from '@services/reusables/reusable-sujetoprocesal.service';
import { TrabajoSujetoProcesal } from '@core/interfaces/comunes/TrabajoSujetoProcesal';
import { EstudioSujetoProcesal } from '@core/interfaces/comunes/EstudioSujetoProcesal';
import { ToastModule } from 'primeng/toast';
import { RegistrarEstudiosComponent } from './registrar-estudios/registrar-estudios.component';
import { RegistrarTrabajosComponent } from './registrar-trabajos/registrar-trabajos.component';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
@Component({
  selector: 'app-formacion-profesional-sujeto-procesal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CmpLibModule,
    SharedModule,
    TableModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    RadioButtonModule,
    ReactiveFormsModule,
    ToastModule,
  ],
  templateUrl: './formacion-profesional-sujeto-procesal.component.html',
  styleUrls: ['./formacion-profesional-sujeto-procesal.component.scss'],
  providers: [MessageService, DialogService, NgxCfngCoreModalDialogService],
})
export class FormacionProfesionalSujetoProcesalComponent {
  @Input() idSujetoCaso!: string;
  @Output() onChangeStep: EventEmitter<number> = new EventEmitter<number>();

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);

  etapas_sujeto = [
    { label: 'Información general' },
    { label: 'Información detallada' },
    { label: 'Formación Profesional' },
    { label: 'Abogados' },
    { label: 'Interoperabilidad' },
  ];

  current_etapa: string = 'Formación Profesional';

  public refModal!: DynamicDialogRef;

  public referenciaModal!: DynamicDialogRef;

  public estudiosSujetoProcesal: EstudioSujetoProcesal[] = [];

  public trabajosSujetoProcesal: TrabajoSujetoProcesal[] = [];

  constructor(
    private readonly dialogService: DialogService,
    private readonly reusablesSujetoProcesalService: ReusablesSujetoProcesalService,
    protected iconUtil: IconUtil
  ) {}

  ngOnInit() {
    this.loadListaEstudioSujetoProcesal();
    this.loadListaTrabajoSujetoProcesal();
  }

  loadListaTrabajoSujetoProcesal() {
    this.reusablesSujetoProcesalService
      .getListaTrabajoSujetoProcesal(this.idSujetoCaso)
      .subscribe((result: any) => {
        this.trabajosSujetoProcesal = result.data;
      });
  }

  loadListaEstudioSujetoProcesal() {
    this.reusablesSujetoProcesalService
      .getListaEstudioSujetoProcesal(this.idSujetoCaso)
      .subscribe((result: any) => {
        this.estudiosSujetoProcesal = result.data;
      });
  }

  public openAgregarEstudio(): void {
    this.refModal = this.dialogService.open(RegistrarEstudiosComponent, {
      width: '65%',
      showHeader: false,
      data: {
        idSujetoCaso: this.idSujetoCaso,
        fechaNacimiento: '01/12/1988',
      },
    });

    this.refModal.onClose.subscribe((respuesta) => {
      if (respuesta !== undefined) {
        if (respuesta.code === 200) {
          this.loadListaEstudioSujetoProcesal();
        }
      }
    });
  }

  public editarEstudioSujetoProcesal(idSujetoEstudio: string): void {
    this.refModal = this.dialogService.open(RegistrarEstudiosComponent, {
      width: '65%',
      showHeader: false,
      data: {
        idSujetoCaso: this.idSujetoCaso,
        idSujetoEstudio: idSujetoEstudio,
        fechaNacimiento: '01/12/1988',
      },
    });

    this.refModal.onClose.subscribe((respuesta) => {
      if (respuesta !== undefined) {
        if (respuesta.code === 200) {
          this.loadListaEstudioSujetoProcesal();
        }
      }
    });
  }

  public eliminarEstudioSujetoProcesal(idSujetoEstudio: string): void {
    const dialog = this.modalDialogService.question(
      'Eliminar estudio',
      `¿Está seguro de eliminar este registro de estudios para este sujeto procesal?.`,
      'Aceptar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.reusablesSujetoProcesalService
            .eliminarEstudioSujetoProcesal(idSujetoEstudio)
            .subscribe((data) => {
              if (data.code === 200) {
                this.modalDialogService.success(
                  'Estudio Eliminado',
                  'Se eliminó correctamente el estudio.',
                  'Aceptar'
                );
                this.loadListaEstudioSujetoProcesal();
              } else {
                this.modalDialogService.error(
                  'Error',
                  `Se ha producido un error al intentar eliminar el estudio del sujeto procesal`,
                  'Ok'
                );
              }
            });
        }
      },
    });
  }

  public openAgregarTrabajo(): void {
    this.refModal = this.dialogService.open(RegistrarTrabajosComponent, {
      width: '65%',
      showHeader: false,
      data: {
        idSujetoCaso: this.idSujetoCaso,
        fechaNacimiento: '01/12/1988',
      },
    });

    this.refModal.onClose.subscribe((respuesta) => {
      if (respuesta !== undefined) {
        if (respuesta.code === 200) {
          this.loadListaTrabajoSujetoProcesal();
        }
      }
    });
  }

  public eliminarTrabajoSujetoProcesal(idSujetoCentroTrabajo: string): void {
    const dialog = this.modalDialogService.question(
      'Eliminar trabajo',
      `¿Está seguro de eliminar este registro de trabajo para este sujeto procesal?.`,
      'Aceptar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.reusablesSujetoProcesalService
            .eliminarTrabajoSujetoProcesal(idSujetoCentroTrabajo)
            .subscribe((data) => {
              if (data.code === 200) {
                this.modalDialogService.success(
                  'Trabajo Eliminado',
                  'Se eliminó correctamente el registro de trabajo.',
                  'Aceptar'
                );
                this.loadListaTrabajoSujetoProcesal();
              } else {
                this.modalDialogService.error(
                  'Error',
                  `Se ha producido un error al intentar eliminar el trabajo del sujeto procesal`,
                  'Ok'
                );
              }
            });
        }
      },
    });
  }

  public editarTrabajoSujetoProcesal(idSujetoCentroTrabajo: string): void {
    this.refModal = this.dialogService.open(RegistrarTrabajosComponent, {
      width: '65%',
      showHeader: false,
      data: {
        idSujetoCaso: this.idSujetoCaso,
        idSujetoCentroTrabajo: idSujetoCentroTrabajo,
        fechaNacimiento: '01/12/1988',
      },
    });

    this.refModal.onClose.subscribe((respuesta) => {
      if (respuesta !== undefined) {
        if (respuesta.code === 200) {
          this.loadListaTrabajoSujetoProcesal();
        }
      }
    });
  }
}
