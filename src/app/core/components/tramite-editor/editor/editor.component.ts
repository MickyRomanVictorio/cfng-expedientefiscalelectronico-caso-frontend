import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ReusableEditarTramiteService } from '@services/reusables/reusable-editar-tramite.service';
import { BACKEND } from '@environments/environment';
import { FirmaIndividualComponent } from '@components/generales/firma-individual/firma-individual.component';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SafeUrlPipe } from '@pipes/safe-url.pipe';
import { textoDecimales } from '@utils/string';
import { icono } from 'dist/ngx-cfng-core-lib';
import { MenubarModule } from 'primeng/menubar';
import { SkeletonModule } from 'primeng/skeleton';
import { delay, Subject, takeUntil } from 'rxjs';
import { MenuTramiteComponent } from '../menu-tramite/menu-tramite.component';
import { TramiteResponse } from '@interfaces/comunes/crearTramite';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalVerDetalleFirmasComponent } from '@core/components/modals/modal-ver-detalle-firmas/modal-ver-detalle-firmas.component';
import { ReservaProvicionalService } from '@core/services/provincial/tramites/reserva-provicional.service';
import { obtenerTiempoTranscurrido } from '@utils/date';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    MenubarModule,
    SkeletonModule,
    MenuTramiteComponent,
    FirmaIndividualComponent,
    CmpLibModule,
    SafeUrlPipe,
  ],
  templateUrl: './editor.component.html',
})
export class EditorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() tramiteResponse!: TramiteResponse;
  public readonly textoDecimales = textoDecimales;
  public referenciaModal!: DynamicDialogRef;
  url = BACKEND.CFE_GESTOR_DOCUMENTAL;
  intervalIdCheckDocumento: any;
  intervalIdMinutes: any;
  ultimoModificado: string = '';
  path: string = '';
  loading: boolean = false;

  private desuscribir$ = new Subject<void>();

  idEstadoTramite: any;
  daysQuantity=0;
  constructor(
    private readonly editarTramiteService: ReusableEditarTramiteService,
    private readonly tramiteService: TramiteService,
    private readonly firmaIndividualService: FirmaIndividualService,
    private readonly dialogService: DialogService,
    private readonly reservaProvisionalService: ReservaProvicionalService
  ) {}

  ngOnDestroy(): void {
    clearInterval(this.intervalIdCheckDocumento);
    clearInterval(this.intervalIdMinutes);
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  ngOnInit() {
    this.intervalIdCheckDocumento = setInterval(() => {
      this.verificarEdicionDocumento(this.tramiteResponse);
    }, 10000);

    this.tramiteService.reloadEditor
      .pipe(tap(() => this.loading = true),
        delay(1500),
        takeUntil(this.desuscribir$))
      .subscribe((reloadEditor) => {
        if (reloadEditor !== '') {
          this.loading = false;
          this.tramiteResponse.pathDocumento = reloadEditor;
          clearInterval(this.intervalIdCheckDocumento);
          this.refreshEditor(reloadEditor);
          this.intervalIdCheckDocumento = setInterval(() => {
            this.verificarEdicionDocumento(this.tramiteResponse);
          }, 10000);
        }
      }
    );
    this.path = `${this.url}/editor?fileName=${this.tramiteResponse.pathDocumento}&type=desktop&action=edit&directUrl=false`;
    this.tramiteService.endLoading();
    this.tramiteService.loadingEditor
      .pipe(takeUntil(this.desuscribir$))
      .subscribe({
      next: (resp) => {
        this.loading = !!resp;
      }
    })
    this.reservaProvisionalService.dataInput.subscribe((response: any) => {
      this.daysQuantity=+response.dias;
    });
    this.calcularDiferencia();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tramiteResponse']) {
      if (!changes['tramiteResponse'].firstChange) {
        this.calcularDiferencia();
      }
    }
  }

  public icono(name: string): string {
    return icono(name);
  }

  get estadoTramiteFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;
  }

  get documentoEditado(): boolean {
    return this.tramiteService.documentoEditado;
  }

  get formularioEditado(): boolean {
    return this.tramiteService.formularioEditado;
  }

  get activarGuardar(): boolean {
    return this.documentoEditado || this.formularioEditado;
  }

  get habilitarGuardar(): boolean {
    return this.tramiteService.habilitarGuardar;
  }

  get nombreUsuario(): string {
    return this.tramiteResponse.nombreUsuario ?? '';
  }

  get nombreUsuarioFormato(): string {
    return this.nombreUsuario.split(' ')
      .map(nombre => nombre.charAt(0) + nombre.slice(1).toLowerCase())
      .join(' ');
  }

  verDetalleFirmasModal() {
    this.referenciaModal = this.dialogService.open(
      ModalVerDetalleFirmasComponent,
      {
        width: '70%',
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
        data: {
          idDocumento: this.tramiteResponse.idActoTramiteCaso,
          // idCaso: tramite.idCaso,
          // numeroCaso: tramite.coCaso,
          // idTramite: tramite.idActoTramiteCaso,
          // titulo: tramite.noTramite,
        },
      }
    );
  }

  private calcularDiferencia(): void {
    if (!this.tramiteResponse.fechaModificacion) return;
    this.ultimoModificado = obtenerTiempoTranscurrido(new Date(this.tramiteResponse.fechaModificacion));
    this.intervalIdMinutes = setInterval(() => {
      if (!this.tramiteResponse.fechaModificacion) return;
      this.ultimoModificado = obtenerTiempoTranscurrido(new Date(this.tramiteResponse.fechaModificacion));
    }, 60000); // cada 1 minuto 60000
  }

  refreshEditor(pathDocumento?: string): void {
    this.path = `${this.url}/editor?fileName=${pathDocumento}&type=desktop&action=edit&directUrl=false`;
  }

  verificarEdicionDocumento(data: TramiteResponse): void {
    if (!data.pathDocumento) return;
    if (this.tramiteService.documentoEditado) return;
    if (this.tramiteService.isLoading()) return;
    this.editarTramiteService
      .verificarDocumentoEditado(data.pathDocumento)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe({
        next: (resp) => {
          this.tramiteService.documentoEditado = resp.data;
          /**
           Sólo si hubo cambios en el documento se habilita el guardar, debido a que si se obtiene un false de
           respuesta no se debe bloquear el guardar por que el trámite puede estar siendo editado y al ponerlo el false
           entra en conflicto con lo que el trámite modifique debido a que esta validación se hace cada 10 segudnos.
           **/
          if (resp.data) {
            this.tramiteService.habilitarGuardar = resp.data;
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}
