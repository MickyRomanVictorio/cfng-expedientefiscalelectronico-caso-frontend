import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {ESTADO_REGISTRO} from 'ngx-cfng-core-lib';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {ButtonModule} from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-solicitud-reapertura-caso',
  templateUrl: './solicitud-reapertura-caso.component.html',
  styleUrls: ['./solicitud-reapertura-caso.component.scss'],
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
  ],
})
export class SolicitudReaperturaCasoComponent implements OnInit {
  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() esNuevo: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteProcesalEnlace: string = '';
  @Input() idEstadoTramite: number = 0;
  @Input() flgIngresoTramite: string = '';

  @Input() deshabilitado: boolean = false;

  @Output() ocultarTitulo = new EventEmitter<boolean>();
  @Output() ocultarBotonTramite = new EventEmitter<boolean>();
  @Output() datosFormulario = new EventEmitter<any>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  constructor(private router: Router) {
    this.ocultarBotonTramite.emit(true);
    this.ocultarTitulo.emit(true);
  }

  ngOnInit() {
    console.log(this.estadoRecibido);
  }

  get estadoRecibido(): boolean {
    return (
      this.idEstadoTramite !== null &&
      this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
    );
  }

  get documentoIngresadoPorMPE(): boolean {
    return this.flgIngresoTramite !== null && this.flgIngresoTramite === '1';
  }

  public verDocumentosIngresados(): void {
    this.router.navigate(['/app/documentos-ingresados']);
  }
}
