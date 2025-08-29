import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { IconUtil, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { CrearEditarAbogadoSujetoProcesalComponent } from '@core/components/modals/registrar-editar-abogado-sujeto-procesal/registrar-editar-abogado-sujeto-procesal.component';
import { AbogadoService } from '@core/services/generales/sujeto/abogado.service';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'gestion-abogado',
    templateUrl: './abogado-component.html',
    styleUrl: './abogado.component.scss',   
    imports: [
        InputSwitchModule,
        CommonModule,
        ButtonModule,
        CmpLibModule,
        TableModule,
        FormsModule,
        ReactiveFormsModule
    ],
    providers: [
        NgxCfngCoreModalDialogService,
    ],
})
export class AbogadoComponent {

    @Input() idSujetoCaso!: string;

    public subscriptions: Subscription[] = []
  
    listaAbogado: any = [];
  
    constructor(
      private readonly abogadoService: AbogadoService,
      private readonly dialogService: DialogService,
      protected readonly iconUtil: IconUtil,
      private readonly modalDialogService: NgxCfngCoreModalDialogService,
    ) {
    }
    ngOnInit() {
      this.obtenerListaAbogados();
    }
  
    ngOnDestroy(): void {
      this.subscriptions.forEach((s) => s.unsubscribe());
    }
  
    obtenerListaAbogados(): void {
      this.subscriptions.push(
        this.abogadoService.listarAbogados(this.idSujetoCaso).subscribe({
          next: resp => {
              this.listaAbogado = resp.data
          },
          error: error => {
            this.modalDialogService.error("Error", 'Se ha producido un error inesperado al intentar listar los abogados', 'Aceptar');
          }
        })
      )
    }
    abrirModalAgregarEditar(abogado: any = null) {
      const ref = this.dialogService.open(CrearEditarAbogadoSujetoProcesalComponent, {
        showHeader: false,
        data: { data: abogado, idSujetoCaso: this.idSujetoCaso },
        contentStyle: { padding: '0', 'border-radius': '15px' }
      });
  
      ref.onClose.subscribe((confirm: any) => {
        if (confirm === RESPUESTA_MODAL.OK) this.obtenerListaAbogados();
      });
    }
  
    editarAbogado(idAbogado: string) {
      this.subscriptions.push(
        this.abogadoService.obtenerUnAbogado(idAbogado).subscribe({
          next: resp => {
            this.abrirModalAgregarEditar(resp.data)
          },
          error: error => {
            this.modalDialogService.error("Error",
              'Se ha producido un error inesperado al intentar obtener la informacion del abogado',
              'Aceptar');
          }
        })
  
      )
    }
  
    eliminarAbogado(idAbogado: string) {
      const dialog = this.modalDialogService.question(
        'Eliminar abogado',
        '¿Estás seguro de eliminar este abogado para este sujeto procesal?',
        'Aceptar',
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.subscriptions.push(
              this.abogadoService.eliminarAbogado(idAbogado).subscribe({
                next: resp => {
                  this.modalDialogService.success("Abogado eliminado",
                    'Se eliminó correctamente el registro de abogado',
                    'Aceptar');
                  this.obtenerListaAbogados()
                },
                error: error => {
                  this.modalDialogService.error("Error", 'Se ha producido un error inesperado al intentar eliminar al abogado', 'Aceptar');
                }
              }
              )
            )
          }
        },
      });
    }
    habilitar(abogado: any) {
      const habilitado:boolean=abogado.habilitado;
      this.subscriptions.push(
        this.abogadoService.habilitar(abogado.idAbogado, habilitado).subscribe({
          next: resp => {
          this.modalDialogService.success(`Abogado ${habilitado?'Habilitado':'Deshabilitado'}.`,
              `Se ${habilitado?'habilitó':'deshabilitó'} correctamente el abogado.`,
              'Aceptar');
            this.obtenerListaAbogados()
          },
          error: error => {
            this.modalDialogService.error("Error", 'Se ha producido un error inesperado al intentar habilitar/deshabilitar al abogado', 'Aceptar');
          }
        }
        )
      )
    }

}
