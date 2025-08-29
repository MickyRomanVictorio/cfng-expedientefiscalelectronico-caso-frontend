import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DropdownModule } from "primeng/dropdown";
import { CheckboxModule } from "primeng/checkbox";
import { formatoCampoPipe } from '@pipes/formato-campo.pipe';
import { AlertaData } from '@interfaces/comunes/alert';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { EncabezadoModalComponent } from '@components/modals/encabezado-modal/encabezado-modal.component';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { EnviadosAceptadosService } from '@services/provincial/tramites/enviados-aceptados.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';

@Component({
  standalone: true,
  selector: 'actualizarDestino',
  templateUrl: './actualizarDestino-modal.component.html',
  styleUrls: ['./actualizarDestino-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    EncabezadoModalComponent,
    CheckboxModule,
    formatoCampoPipe,
    CommonModule,
    ButtonModule,
    CalendarModule, RadioButtonModule
  ],
  providers: [NgxCfngCoreModalDialogService],
})
export class ActualizarDestinoModalComponent implements OnInit {
  public razon = new FormControl('', [Validators.required])
  public subscriptions: Subscription[] = []
  public fechaTramiteControl = new FormControl('', [])
  public documentoSeleccionado;
  form !: FormGroup;

  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private enviadosAceptadosService: EnviadosAceptadosService,
    private spinner: NgxSpinnerService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
    this.documentoSeleccionado = this.config.data;
    this.formBuild();
    /**this.form = this.fb.group({
      tipoDocIdentidad: [null]
    })**/
  }

  private formBuild() {
    this.form = this.fb.group({
      //distritoFiscal: [null, [Validators.required]],
      distritoFiscal: [null],
      tipoEspecialidad: [null],
      especialidad: [null],
      fiscalia: [null],
      despacho: [null],
    });
  }

  listaDistritoFiscal: any = [];
  listaEspecialidades: any = [];
  listaFiscalias: any = [];
  tipoEspecialidad: any = [];
  listaDespachos: any = [];

  distritoSeleccionado: string = "";
  tipoEspecialidadSeleccionado: string = "";
  especialidadSeleccionada: string = "";
  /**fiscaliaSeleccionada: string = "";
  despachoSeleccionado: string = "";**/

  async ngOnInit() {
    this.listaDistritoFiscal = await this.obtenerDistritoFiscal();
    //this.tipoEspecialidad = await this.obtenerTipoEspecilidad("0", "4006014501");
    //this.listaDespachos = await this.obtenerDespacho("4006014501")
  }

  async verTipoEspecialidad(event: any) {
    this.distritoSeleccionado = event.value
    this.tipoEspecialidad = await this.obtenerTipoEspecilidad(this.distritoSeleccionado, "4006014501");
  }

  async verEspecialidad(event: any) {
    this.tipoEspecialidadSeleccionado = event.value
    this.listaEspecialidades = await this.obtenerEspecilidad(this.distritoSeleccionado, "4006014501", this.tipoEspecialidadSeleccionado);
  }

  async verFiscalias(event: any) {
    this.especialidadSeleccionada = event.value
    this.listaFiscalias = await this.obtenerFiscalia(this.distritoSeleccionado, this.tipoEspecialidadSeleccionado, this.especialidadSeleccionada);
  }

  async verDespachos(event: any) {
    //this.especialidadSeleccionada = event.value
    this.listaDespachos = await this.obtenerDespacho(event.value);
  }

  /**seleccionarFiscalia(event: any) {
    this.fiscaliaSeleccionada = event.value
  }

  seleccionarDespacho(event: any) {
    this.despachoSeleccionado = event.value
  }**/

  obtenerEspecilidad(distritofiscal: any, entidad: any, especilidad: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.enviadosAceptadosService.obtenerEspecilidad(distritofiscal, entidad, especilidad).subscribe({
          next: resp => {

            resolve(resp.data);
          }
        })
      )
    });
  }

  obtenerTipoEspecilidad(distritoFiscal: any, codigoEntidad: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.enviadosAceptadosService.obtenerTipoEspecilidad(distritoFiscal, codigoEntidad).subscribe({
          next: resp => {
            resolve(resp.data);
          }
        })
      )
    });
  }

  obtenerDistritoFiscal() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.enviadosAceptadosService.obtenerDistritoFiscal().subscribe({
          next: resp => {

            resolve(resp.data);
          }
        })
      )
    });
  }

  obtenerFiscalia(distritoFiscal: any, tipoEspecialidad: any, especialidad: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.enviadosAceptadosService.obtenerFiscalias(distritoFiscal, tipoEspecialidad, especialidad).subscribe({
          next: resp => {
            resolve(resp.data);
          }
        })
      )
    });
  }

  obtenerDespacho(codigoEntidad: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.enviadosAceptadosService.obtenerDespachos(codigoEntidad).subscribe({
          next: resp => {
            resolve(resp.data);
          }
        })
      )
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg'
  }

  close() {
    this.dialogRef.close('closed');
  }

  showActualizarDerivacion() {
    /**let requestActualizarDerivacion = {
      idBandejaDerivacion: this.documentoSeleccionado.idBandejaDerivacion,
      distritoFiscal: this.distritoSeleccionado,
      tipoEspeciaidad: this.tipoEspecialidadSeleccionado,
      especialidd: this.especialidadSeleccionada,
      fiscalia: this.fiscaliaSeleccionada,
      despacho: this.despachoSeleccionado
    }**/

    let requestActualizarDerivacion = {
      idBandejaDerivacion: this.documentoSeleccionado.data.idBandejaDerivacion,
      distritoFiscal: this.form.value.distritoFiscal,
      tipoEspeciaidad: this.form.value.tipoEspecialidad,
      especialidd: this.form.value.especialidad,
      fiscalia: this.form.value.fiscalia,
      despacho: this.form.value.despacho
    }

    if (!requestActualizarDerivacion.distritoFiscal) {
      this.mensajeError("Aviso:", "El distrito fiscal es requerido")
      return;
    }

    if (!requestActualizarDerivacion.tipoEspeciaidad) {
      this.mensajeError("Aviso:", "El tipo de especialidad es requerido")
      return;
    }

    if (!requestActualizarDerivacion.especialidd) {
      this.mensajeError("Aviso:", "La especialidad es requerido")
      return;
    }

    if (!requestActualizarDerivacion.despacho) {
      this.mensajeError("Aviso:", "El despacho es requerido")
      return;
    }

    if (!requestActualizarDerivacion.fiscalia) {
      this.mensajeError("Aviso:", "La fiscalia es requerido")
      return;
    }

    const dialogRef = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `MODIFICAR DESTINO`,
        description: `Esta acción realizará un cambio de fiscalia y despacho destino de la derivación ¿Desea continuar? `,
        confirmButtonText: 'Confirmar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>)

    dialogRef.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.actualizarDerivacion(requestActualizarDerivacion);
        }
      }
    })
  }

  actualizarDerivacion(request: any) {
    /**
    this.dialogRef.close();
    this.modalDialogService.info(
      'Datos guardado correctamente',
      'Destino de derivación modificado correctamente',
    );**/

    this.spinner.show();
    this.subscriptions.push(
      this.enviadosAceptadosService.actualizarDerivacion(request).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.modalDialogService.info(
            'Destino de derivación modificado correctamente',
            'Ok'
          );
          this.close();
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      })
    );
  }

  getLabelById(value: any, list: any[]): string {
    const selectedItem = list.find(item => item.value === value);
    return selectedItem ? selectedItem.label : '';
  }

  mensajeError(mensaje: any, submensaje: any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      }
    } as DynamicDialogConfig<AlertaData>)
  }

}
