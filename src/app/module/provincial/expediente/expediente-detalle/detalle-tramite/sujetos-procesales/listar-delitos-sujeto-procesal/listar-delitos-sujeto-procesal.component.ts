import {CommonModule} from '@angular/common';
import {Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DelitoRequest} from '@interfaces/reusables/sujeto-procesal/delitoRequest';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {AgregarDelitosModalComponent} from '@components/modals/agregar-delitos-modal/agregar-delitos-modal.component';
import {AlertaModalComponent} from '@components/modals/alerta-modal/alerta-modal.component';
import {RESPUESTA_HTTP} from 'ngx-cfng-core-lib';
import {DelitoService} from '@services/generales/sujeto/delito.service';
import {TableModule} from "primeng/table";
import {Button} from "primeng/button";
import {Casos} from "@services/provincial/consulta-casos/consultacasos.service";
import { valid } from '@core/utils/string';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { finalize, Subscription } from 'rxjs';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { CmpLibModule } from 'dist/cmp-lib';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { PaginatorComponent } from "@core/components/generales/paginator/paginator.component";
import { ReusablesSujetoProcesalService } from '@core/services/reusables/reusable-sujetoprocesal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertaData } from '@core/interfaces/comunes/alert';

@Component({
  standalone: true,
  selector: 'app-listar-delitos-sujeto-procesal',
  templateUrl: './listar-delitos-sujeto-procesal.component.html',
  styleUrls: ['./listar-delitos-sujeto-procesal.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, TableModule, Button, CmpLibModule, PaginatorComponent],
  providers: [DialogService,NgxCfngCoreModalDialogService],
})
export class ListarDelitosSujetoProcesalComponent implements OnInit {
  @Input() sujeto!: string;
  @Input() numeroCaso!: string;
  @Input() idCaso!: string;
  @Input() nombreSujeto = '';
  @Input() listaDelitos: DelitoRequest[] = [];
  @Input() listaDelitosCompleta: DelitoRequest[] = [];

  @Input({ required: true }) paginacionCondicion: any;
  @Input({ required: true }) paginacionConfiguracion: any;
  @Input({ required: true }) paginacionReiniciar: boolean = false;
  @Output() cambiarPagina = new EventEmitter<PaginacionInterface>();
  @Output() buscarPorTexto = new EventEmitter<string>();
  protected temporizadorBusqueda: any;

  @Output() onListaDelitos: EventEmitter<any> = new EventEmitter<any>();
  public formDelitoSujetoProcesal!: FormGroup;
  
  referenciaModal!: DynamicDialogRef;
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly subscriptions: Subscription[] = [];
  public ocultarBuscador: boolean = false;

  protected pagina!: number;

  constructor(
    private readonly delitoService: DelitoService,
    private readonly dialogService: DialogService,
    private reusablesSujetoProcesalService: ReusablesSujetoProcesalService,
    private readonly casoService: Casos,
    protected readonly iconUtil: IconUtil,
    private formulario: FormBuilder,
    private spinner: NgxSpinnerService
  ) {
  }

  ngOnInit(): void {
    this.formInicio();
    this.pagina = this.paginacionCondicion.page;
  }

  private formInicio(): void {
    this.formDelitoSujetoProcesal = this.formulario.group({
      buscar: [''],
    });
  }

  protected eventoBuscarSegunTexto(): void {
    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => {
      const buscado = this.formDelitoSujetoProcesal.get('buscar')!.value;
      this.buscarPorTexto.emit(buscado);
    }, 200);
  }

  async ngOnChanges(changes: SimpleChanges) {
    /**this.listaDelitos = this.inputListaDirecciones;**/
    if (changes['listaDelitos'] && changes['listaDelitos'].currentValue) {
      if (this.listaDelitos.length > 0) this.ocultarBuscador = true;
    }    
  }

  protected eventoCambiarPagina(paginacion: PaginacionInterface){
    this.pagina = paginacion.page;
    this.cambiarPagina.emit(paginacion);
  }

  tipificarDelitos(): void {
    if (this.numeroCaso == null) {
      this.casoService.obtenerCasoFiscal(this.idCaso).subscribe({
        next: (resp) => {
          this.numeroCaso = resp.numeroCaso;
          this.abrirModalTipificar();
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      this.abrirModalTipificar();
    }
  }

  abrirModalTipificar(): void {
    this.dialogService
      .open(AgregarDelitosModalComponent, {
        showHeader: false,
        width: '95%',
        data: {
          numeroCaso: this.numeroCaso,
          idSujetoProcesal: this.sujeto,
          delitosActuales: this.formatDelitos(),
        },
      })
      .onClose.subscribe((resp) => {
      if (resp === RESPUESTA_HTTP.OK) {
        this.obtenerDelitos();
        this.mostrarAlerta('success', 'Delitos actualizados correctamente', `Se actualizó los delitos para el sujeto <b>${this.nombreSujeto}</b>`);
      } else {
        if (Array.isArray(resp) && resp.length > 0) {
          this.listaDelitos = resp;
          this.listaDelitosCompleta = resp;
          this.formDelitoSujetoProcesal.get('buscar')?.setValue(null);
          this.onListaDelitos.emit(this.listaDelitos);
        }
      }
    });
  }

  obtenerDelitos(): void {
    this.delitoService.listarDelitosSujeto(this.sujeto).subscribe((data) => {
      this.listaDelitos = data;
      this.listaDelitosCompleta = data;
      this.formDelitoSujetoProcesal.get('buscar')?.setValue(null);
      this.onListaDelitos.emit(this.listaDelitos);
      if (this.listaDelitos.length === 0) this.ocultarBuscador = false;
    });
  }

  private formatDelitos(): string {
    return this.listaDelitosCompleta
      .map(({
              delitoGenerico,
              delitoSubgenerico,
              delitoEspecifico
            }) => `${delitoGenerico} / ${delitoSubgenerico} / ${delitoEspecifico}`)
      .join('||');
  }

  eliminarDelitoSujeto(idDelitoSujeto: any, index: number): void {
    if (this.sujeto !== 'nuevo') {
      this.subscriptions.push(
        this.reusablesSujetoProcesalService.consultarAsociacionDelitoSujetosProcesalesConDelitos(this.sujeto, idDelitoSujeto)
          .pipe(finalize(() => { this.spinner.hide(); }))
          .subscribe({
            next: (tieneDelitos) => {

              if (tieneDelitos.coValidacion == '0') {
                this.modalDialogService.warningRed("NO SE PUEDE ELIMINAR DELITO", tieneDelitos.noValidacion, 'Aceptar');
              } else {

                const dialog = this.modalDialogService.question(
                  'Eliminar Delito',
                  tieneDelitos.noValidacion,
                  'Aceptar',
                );
                dialog.subscribe({
                  next: (resp: CfeDialogRespuesta) => {
                    if (resp === CfeDialogRespuesta.Confirmado) {
                      if (valid(idDelitoSujeto)) {
                        this.subscriptions.push(
                          this.delitoService.eliminarDelitoSujeto(idDelitoSujeto).subscribe({
                            next: resp => {
                              if (resp.code === 200) {
                                this.modalDialogService.success("Exito", 'Se eliminó correctamente el delito', 'Aceptar');
                                this.obtenerDelitos() 
                              }
                            },
                            error: error => {
                              this.modalDialogService.error("Error", `Se ha producido un error al intentar eliminar el delito del sujeto procesal`, 'Aceptar');
                            }
                          })
                        )
                      }
                      else {
                        this.listaDelitos.splice(index, 1);
                        if (this.listaDelitos.length === 0) this.ocultarBuscador = false;
                        this.modalDialogService.success("Exito", 'Se eliminó correctamente el delito', 'Aceptar');
                      }
                    }
                  },
                });

              }
            },
            error: () => {
              this.modalDialogService.error("Error", `Se ha producido un error al validaR si el sujeto se encuentra en un trámite firmado`, 'Aceptar');
            },
          })
      );
    } else {
      const dialog = this.modalDialogService.question(
        'Eliminar Delito',
        'Está seguro de eliminar este delito para este sujeto procesal, esta acción no puede ser revertida',
        'Aceptar',
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            if (!valid(idDelitoSujeto)) {
              this.listaDelitos.splice(index, 1);
              if (this.listaDelitos.length === 0) this.ocultarBuscador = false;
              this.modalDialogService.success("Exito", 'Se eliminó correctamente el delito', 'Aceptar');
            }
          }
        },
      });

    }
    
  }

  private mostrarAlerta(icon: string, title: string, description: string): void {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon,
        title,
        description,
        confirmButtonText: 'Aceptar',
      },
    });
  }

}
