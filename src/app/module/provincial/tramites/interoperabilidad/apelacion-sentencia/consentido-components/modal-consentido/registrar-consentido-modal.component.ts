import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RecursoApelacionSentenciaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/recurso-apelacion-sentencia.service';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { Subscription } from 'rxjs';
import { CmpLibModule } from 'dist/cmp-lib';
import { NgIf } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { CapitalizePipe } from 'dist/ngx-cfng-core-lib';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { NombrePropioPipe } from '@core/pipes/nombre-propio.pipe';

@Component({
  selector: 'app-registrar-consentido-modal',
    standalone: true,
  templateUrl: './registrar-consentido-modal.component.html',
  styleUrls: ['./registrar-consentido-modal.component.scss'],
    imports: [
      CmpLibModule,
      NgIf,
      ProgressBarModule,
      PaginatorComponent,
      CapitalizePipe,
      SharedModule,
      TableModule,
      DropdownModule,
      FormsModule,
      NombrePropioPipe,
    ],
})
export class RegistrarConsentidoModalComponent implements OnInit {
  public tipo: 'apelacion' | 'queja' = 'apelacion'; // default
  public tituloModal: SafeHtml | undefined = undefined;
  public query: any = { limit: 10, page: 1, where: {} };
  public itemPaginado: any = { 
    isLoading: false, data:
     { data: [], pages: 0, perPage: 0, total: 0 } };
  public sujetosProcesales: any[] = [];
  public sujetosProcesalesFiltrados: any[] = [];
  public mostrarBtnAceptar: boolean = false;
  public soloLectura: boolean = false;
  public numeroCaso: string = '';
  public tituloCaso: SafeHtml = '';
  public misApelaciones: number = 0;
  public flCheckModal: boolean = false;
  private selectedSujetos: any = [];
  private idCaso: string = '';
  private idActoTramiteCaso: string = '';
  private readonly subscriptions: Subscription[] = [];
  protected readonly obtenerIcono = obtenerIcono;

  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
    protected tramiteService: TramiteService,
    private readonly recursoApelacionSentencia: RecursoApelacionSentenciaService
  ) {
    // Detecta el tipo desde config o input
    this.tipo = config.data?.tipo || 'apelacion';
  }

  ngOnInit(): void {
    this.idCaso = this.config.data?.idCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.soloLectura = this.config.data?.soloLectura || false;
    this.tituloModal = (this.soloLectura ? 'Ver' : 'Seleccionar') +
      (this.tipo === 'queja' ? ' consentimiento de la queja' : ' consentimiento de apelación');
    this.tituloDelCaso();
    this.obtenerSujetosProcesales();
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `${this.numeroCaso.endsWith('0') ? 'Número Caso: ' : 'Incidente: '}${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  cancelar() {
    this.dialogRef.close({ button: 'cancelar' });
  }

  aceptar() {
    const seleccionados = this.sujetosProcesales.filter(
      (sujeto) => sujeto.selection || sujeto.sujetoSelected
    );
    this.selectedSujetos = seleccionados;
    this.eventoRegistrarSujetosProcesales();
  }

  onSelectionChange(item: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    item.sujetoSelected = true;
    item.selection = true;
    if (this.tipo === 'queja') {
      item.quejaConsentido = checkbox.checked ? 1049 : 0;
      item.apelacionConsentido = checkbox.checked ? 1049 : 0;
    } else {
      item.apelacionConsentido = checkbox.checked ? 1049 : 0;
    }
    this.verificarElementos();
  }

  verificarElementos() {
    this.mostrarBtnAceptar = this.sujetosProcesalesFiltrados.some(
      (sujeto) => sujeto.selection
    );
    if (this.soloLectura) {
      this.mostrarBtnAceptar = false;
    }
  }

  protected eventoRegistrarSujetosProcesales() {
    if (this.selectedSujetos.length === 0) {
      this.cancelar();
      return;
    }
    console.log('Registrar Consentido Modal', this.sujetosProcesales);
    const req= this.sujetosProcesales.some(
      (sujeto: any) => this.tipo === 'queja' ? (sujeto.quejaConsentido === 1049 ) : (sujeto.apelacionConsentido === 1049) 
    );
    console.log('Recurso Consentido:', req);
    const data: any = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetos: this.selectedSujetos,
    };
    this.subscriptions.push(
      this.recursoApelacionSentencia
        .registrarTramiteApelacionConsentido(data)
        .subscribe({
          next: (resp) => {
            if (resp.codigo === 0) {
              this.dialogRef.close({ button: 'aceptar', data: req });
            }
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.recursoApelacionSentencia
        .obtenerResultadosSentencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp
              .map((sujeto: any) => ({
                ...sujeto,
                sujetoSelected: false,
              }))
              .sort((a: any, b: any) => {
                // Prioridad igual que antes
                const getPriority = (item: any) => {
                  if(this.tipo === 'queja') {
                    if (item.flApelacion === '1' &&item.idTipoRespuestaQueja === 1060 && item.sujetoQuienApela == null) return 0; // Prioridad máxima para queja
                  }
                  if (item.idTipoRespuestaInstancia1 === 1024 && item.flApelacion === '1'&& item.sujetoQuienApela == null && item.flQueja !== '1') return 1;
                  if (item.flApelacion === '1' && item.idTipoRespuestaInstancia1 == 1062  && item.flQueja !== '1') return 2;
                  if (item.flApelacion === '1' && item.idTipoRespuestaInstancia1 === 1024 && item.flQueja !== '1') return 3;
                  return 4;
                };
                const priorityA = getPriority(a);
                const priorityB = getPriority(b);
                if (priorityA !== priorityB) return priorityA - priorityB;
                return 0;
              });
            if (this.soloLectura) {
              this.sujetosProcesales = this.sujetosProcesales.filter((sujeto) =>
                this.esMismoTramite(sujeto)
              );
              this.misApelaciones = this.sujetosProcesales.length;
            }
            this.sujetosProcesalesFiltrados = this.sujetosProcesales;
            this.verificarElementos();


   
            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesales.length;
            this.actualizarPaginaRegistros(this.sujetosProcesales);
            this.misApelaciones = this.sujetosProcesales.filter(
              (sujeto: any) => sujeto.flApelacion && sujeto.sujetoQuienApela == null
            ).length;
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

   onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = this.sujetosProcesales.slice(
      start,
      end
    );
  }
    actualizarPaginaRegistros(data: any) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }
 protected esMismoTramite(sujeto: any): boolean {
    if (sujeto.idActoTramiteCasoGuardado) {
      return sujeto.idActoTramiteCasoGuardado == this.idActoTramiteCaso;
    }
    return true;
  }
   protected esOtroTramiteGuardado(sujeto: any): boolean {
    if (sujeto.idActoTramiteCasoGuardado) {
      return (
        sujeto.idActoTramiteCasoGuardado !== this.idActoTramiteCaso
         && (sujeto.quejaConsentido !== 0 || sujeto.apelacionConsentido !== 0)
      );
    }
    return false;
  }
}