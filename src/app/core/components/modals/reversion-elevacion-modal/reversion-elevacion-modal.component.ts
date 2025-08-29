import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BandejaContiendasService } from '@services/provincial/bandeja-contiendas/bandeja-contiendas.service';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { Router } from '@angular/router';
import { urlConsultaCasoFiscal } from '@core/utils/utils';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';

@Component({
  standalone: true,
  selector: 'app-reversion-elevacion-modal',
  templateUrl: './reversion-elevacion-modal.component.html',
  styleUrls: ['./reversion-elevacion-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextareaModule,
    EncabezadoModalComponent,
  ],
  providers: [NgxCfngCoreModalDialogService],
})
export class ReversionElevacionModalComponent implements OnInit {
  public detalle = new FormControl('', [Validators.required]);
  public titulo;
  public descripcion;
  public numeroCaso;
  public idCaso;
  public idActoTramiteCaso;
  public idEtapa;
  public contenido;
  public idBandeja;
  public noEntidad;
  public idBandejaElevacion;
  public subscriptions: Subscription[] = [];
  protected wordCount = 1000;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private bandejaContiendasService: BandejaContiendasService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private router: Router,
    private readonly gestionCasoService: GestionCasoService,
  ) {
    this.titulo = this.config.data.titulo;
    this.descripcion = this.config.data.descripcion;
    this.numeroCaso = this.config.data.caso;
    this.idCaso = this.config.data.idCaso;
    this.idActoTramiteCaso = this.config.data.idActoTramiteCaso;
    this.contenido = this.config.data.contenido;
    this.idBandeja = this.config.data.idBandejaDerivacion;
    this.noEntidad = this.config.data.noEntidad;
    this.idBandejaElevacion = this.config.data.idBandejaElevacion;
    this.idEtapa = this.config.data.idEtapa;
  }

  ngOnInit() {
    if (this.contenido) this.detalle.setValue(this.contenido);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public closeAction(evt: MouseEvent): void {
    evt.preventDefault();
  }

  get isValidForm(): boolean {
    return this.detalle.value!.trim().length > 0;
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  public verificarFiscalAsignado(): void {
    this.subscriptions.push(
      this.bandejaContiendasService
        .verificarFiscalAsignado(this.idBandejaElevacion)
        .subscribe({
          next: (resp) => {
            if (resp.message === 'EXISTE') {
              this.modalDialogService.error(
                'Este caso no se puede revertir',
                'Este caso ya ha sido asignado a un fiscal superior, por lo que no se puede revertir',
                'Aceptar',
              ).subscribe((resp: string) => {
                if (resp === 'confirmado') {
                  this.ref.close('confirm');
                }
              });
            } else {
              this.guardarReversion();
            }
          },
          error: (error) => {
            console.error(error);
          },
        })
    );
  }

  guardarReversion(): void {
    const request: any = {
      idBandejaElevacion: this.idBandejaElevacion,
      idCaso: this.idCaso,
      detalleReversion: this.detalle.value,
      idActoTramiteCaso: this.idActoTramiteCaso
    };
    this.subscriptions.push(
      this.bandejaContiendasService
        .revertirElevacionContienda(request)
        .subscribe({
          next: (resp) => {

            this.ref.close('confirm');

            if (resp.code === 200) {
              this.modalDialogService
                .success(
                  'Elevación revertida correctamente',
                  'Se redireccionará al Historial de trámites para que pueda editar o eliminar el trámite',
                  'Aceptar'
                ).subscribe((resp: string) => {
                  if (resp === 'confirmado') {
                    const flgConcluido = this.gestionCasoService.getCasoFiscalActual()?.flgConcluido ?? '0';
                    //redirecciona
                    const urlEtapa = urlConsultaCasoFiscal({
                      idEtapa: this.idEtapa,
                      idCaso: this.idCaso,
                      flgConcluido: flgConcluido,
                    });
                    const ruta = urlEtapa + `/historia-tramites/activos`;
                    this.router.navigate([`${ruta}`]);
                  }
                });
            }
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  cerrar(): void {
    this.ref.close();
  }

  countWords() {
    const words = this.detalle.value ?? '';
    this.wordCount = 1000 - words.length;
    if (this.wordCount >= 1000) {
      const currentValue = words;
      const newValue = currentValue.substring(0, 1000);
      this.detalle.setValue(newValue);
    }
  }
}
