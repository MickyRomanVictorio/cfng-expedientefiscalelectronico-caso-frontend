import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonDirective } from 'primeng/button';
import { Subject } from 'rxjs';
import {
  ImputadosAcusacionModalComponent
} from '@modules/provincial/tramites/especiales/incoacion/requerimiento-acusacion-proceso-inmediato/imputados-acusacion-modal/imputados-acusacion-modal.component';
import {
  RequerimientoAcusacionService
} from '@services/provincial/tramites/especiales/requerimiento-acusacion/requerimiento-acusacion.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';

@Component({
  selector: 'app-requerimiento-acusacion-proceso-inmediato',
  standalone: true,
  imports: [
    ButtonDirective
  ],
  templateUrl: './requerimiento-acusacion-proceso-inmediato.component.html',
  styleUrl: './requerimiento-acusacion-proceso-inmediato.component.scss'
})
export class RequerimientoAcusacionProcesoInmediatoComponent implements OnInit, OnDestroy {

  @Input()
  idActoTramiteCaso: string = '';
  @Input()
  idCaso: string = '';
  private desuscribir$ = new Subject<void>();

  constructor(
    private dialogService: DialogService,
    protected tramiteService: TramiteService,
    private requerimientoAcusacionService: RequerimientoAcusacionService
  ) {
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  ngOnInit() {
    this.cargarImputados();
    this.validarTiempo();
    this.formularioEditado(false);  
  }

  public ngOnDestroy(): void {
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  private cargarImputados(): void {
    this.requerimientoAcusacionService.obtenerImputados(this.idCaso).subscribe({
      next: (resp) => {
        this.requerimientoAcusacionService.listaImputados = resp.data;
      }
    })
  }

  private validarTiempo(): void {
    this.requerimientoAcusacionService.validarPlazos(this.idActoTramiteCaso).subscribe({
      next: (resp) => {
        if(resp.data.vencido && resp.data.cantidad > 0) {
          this.mostrarAlerta();
        }
      }
    });
  }

  protected mostrarAlerta() {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: 'Tiempo vencido',
        description: 'El tiempo para generar el requerimiento de acusación ya se venció. ¿Desea continuar de todas formas?',
        confirmButtonText: 'Aceptar',
        confirm: false
      }
    });
  }

  protected abrirInputados() {
    this.dialogService.open(ImputadosAcusacionModalComponent, {
      showHeader: false,
      autoZIndex: false,
      style: {
        width: '90%',
        'max-width': '1160px',
        margin: 'auto',
        position: 'fixed',
      },
      data: {
        idActoTramiteCaso: this.idActoTramiteCaso,
      },
    });
  }
}
