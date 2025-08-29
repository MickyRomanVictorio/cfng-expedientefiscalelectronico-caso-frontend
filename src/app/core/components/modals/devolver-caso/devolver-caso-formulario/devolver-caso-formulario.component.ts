import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {CommonModule} from '@angular/common';
import { Observable, of, Subscription } from 'rxjs';
import {AcumulacionAsociarCasoDatos} from "@interfaces/provincial/tramites/comun/calificacion/acumulacion-asociar-caso/acumulacion-asociar-caso-datos.interface";
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { TramiteProcesal } from '@interfaces/comunes/tramiteProcesal';
import {
  DerivadoPorRevisarService
} from '@services/provincial/bandeja-derivaciones/recibidos/por-revisar/derivado-por-revisar.service';
import {
  RecibidosDerivadoAService
} from '@services/provincial/bandeja-derivaciones/recibidos/recibido-derivadoa.service';

@Component({
  selector: 'app-devolver-caso-formulario',
  standalone: true,
  imports: [CommonModule],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './devolver-caso-formulario.component.html',
  styleUrls: ['./devolver-caso-formulario.component.scss']
})
export class DevolverCasoFormularioComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso!: string;

  @Output() peticionParaEjecutar = new EventEmitter<() => Observable<any>>();

  private readonly suscripciones: Subscription[] = [];

  public datos!: AcumulacionAsociarCasoDatos;

  constructor(private derivadoPorRevisarService: DerivadoPorRevisarService,
              private recibidosDerivadoAService: RecibidosDerivadoAService) {
  }

  ngOnInit(): void {
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  obtenerFormulario(): any {
    return this.derivadoPorRevisarService.obtenerFormulario();
  }

  guardarFormulario(): Observable<any>{
    const datos = this.obtenerFormulario();
    const request = {
        idBandeja: datos.idBandeja,
        idCaso: datos.idCaso,
        detalleDevolucion: datos.detalleDevolucion,
        carpetaIncompleta: datos.carpetaIncompleta == true ? '1' : '0',
        carpetaMalFoliada: datos.carpetaMalFoliada == true ? '1' : '0',
        consignarNombreDespacho: datos.consignarNombreDespacho == true ? '1' : '0',
      };
    return this.recibidosDerivadoAService.devolverRecibidosPorRevisar(request);
  }
}
