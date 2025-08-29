import {Component, EventEmitter, inject, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {AcumulacionAsociarCasoService} from "@services/provincial/tramites/comun/calificacion/acumulacion-asociar-caso/acumulacion-asociar-caso.service";
import {Subscription} from "rxjs";
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';

@Component({
  selector: 'app-acumulacion-asociar-caso-formulario',
  standalone: true,
  imports: [CommonModule],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './acumulacion-asociar-caso-formulario.component.html',
})
export class AcumulacionAsociarCasoFormularioComponent {

  @Output() peticionParaEjecutar = new EventEmitter<() => any>();

  @Output() ocultarTramiteIniciado = new EventEmitter<boolean>();

  private readonly suscripciones: Subscription[] = [];

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  constructor(
    public acumulacionAsociarCasoService: AcumulacionAsociarCasoService,
    public referenciaModal: DynamicDialogRef,
    protected tramiteService: TramiteService,
    private firmaIndividualService: FirmaIndividualService,
  ) {
  }
  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  ngOnInit(): void {
    this.formularioEditado(false)
    this.ocultarTramiteIniciado.emit(true)
    this.suscripciones.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.firmaRealizada();
          }
        }
      )
    )
  }
  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  firmaRealizada(){
    this.acumulacionAsociarCasoService.activarEvento(true);
    //this.modalDialogService.success("Exito", `El caso derivado fue acumulado de manera exitosa`, 'Ok');
  }
}
