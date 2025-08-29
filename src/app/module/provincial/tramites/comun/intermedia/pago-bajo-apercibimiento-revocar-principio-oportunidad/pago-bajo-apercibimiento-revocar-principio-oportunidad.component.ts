import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { ApercibimientoRevocarPrincipioOportunidadService } from '@services/provincial/tramites/comun/intermedia/pago-bajo-apercibimiento-revocar-principio-oportunidad.service';
import { PagoBajoApercibimientoRevocar } from '@interfaces/provincial/tramites/acta-acuerdo/pago-apercibimiento-revocar-principio';
import { parseISO } from 'date-fns';

@Component({
  selector: 'app-pago-bajo-apercibimiento-revocar-principio-oportunidad',
  templateUrl: './pago-bajo-apercibimiento-revocar-principio-oportunidad.component.html',
  styleUrls: ['./pago-bajo-apercibimiento-revocar-principio-oportunidad.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
  ],
  providers: [MessageService, DialogService],
})
export class PagoBajoApercibimientoRevocarPrincipioOportunidadComponent implements OnInit {

  @Input() idCaso: string = ''
  @Input() etapa: string = ''
  @Input() esNuevo: boolean = false
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if ( this._idActoTramiteCaso !== idActoTramiteCaso ) {
      this._idActoTramiteCaso = idActoTramiteCaso
      this.esNuevo && this.alSeleccionar()
      !this.esNuevo && this.obtenerFormulario()
    }
  }

  @Input() deshabilitado: boolean = false;
  @Output() datosFormulario = new EventEmitter<any>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  public subscriptions: Subscription[] = []
  private _idActoTramiteCaso: string = ''
  public fechaNotificacion: Date | null = null;
  public datosForm: PagoBajoApercibimientoRevocar | null= null

  constructor(
    private spinner: NgxSpinnerService,
    private apercibimientoRevocarPrincipio: ApercibimientoRevocarPrincipioOportunidadService
  ) { }

  ngOnInit() {
    this.peticionParaEjecutar.emit((datos: any) => this.apercibimientoRevocarPrincipio.guardarApercibimientoRevocarPrincipioOportunidad(datos, this.idActoTramiteCaso))
  }

  get formularioValido(): boolean {
    return this.fechaNotificacion !== null;
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso
  }

  public alSeleccionar(): void {

    this.datosForm = {
      idCaso: this.idCaso,
      fechaNotificacion: this.fechaNotificacion!
    }
    console.log(this.datosForm);
    this.datosFormulario.emit(this.datosForm)
  }

  public obtenerFormulario() {
    this.spinner.show();
    this.subscriptions.push(
      this.apercibimientoRevocarPrincipio.obtenerApercibimientoRevocarPrincipioOportunidad(this.idActoTramiteCaso)
      .subscribe({
        next: resp => {
          this.spinner.hide();
          if ( resp != undefined && resp != null){
            this.datosForm = resp
            const fechaFormat = parseISO(this.datosForm!.fechaNotificacion.toString())
            this.fechaNotificacion = fechaFormat;
            this.datosFormulario.emit(this.datosForm)
          }
        },
        error: error => {
          console.error(error);
          this.spinner.hide();
        }
      })
    )
  }
}
