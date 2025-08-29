import {Component, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {CapitalizePipe} from '@pipes/capitalize.pipe';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {SharedModule} from 'primeng/api';
import {DropdownModule} from 'primeng/dropdown';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {obtenerIcono} from '@utils/icon';
import {obtenerCasoHtml} from '@utils/utils';
import {Subscription} from 'rxjs';
import {CheckboxModule} from 'primeng/checkbox';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {NgIf, CommonModule} from "@angular/common";
import {AlertaModalComponent} from '@core/components/modals/alerta-modal/alerta-modal.component';
import {
  PestanaApelacionSujetoService
} from "@services/provincial/tramites/interoperabilidad/resolucion-auto/pestana-apelacion-sujeto.service";

interface MensajeInformativo {
  mostrar: boolean;
  descripcion: string;
  campo_prerequisito: string;
  valor_prerequisito: number;
}

interface ColumnaConfig {
  nombre_campo: string;
  mostrar_campo: string;
  mostrar: boolean;
  editar: boolean;
}

export interface SujetosApelacionConfig {
  titulo: string;
  subtitulo: string;
  mensaje_informativo: MensajeInformativo;
  posicion_petitorio: 'columna' | 'bajo_texto';
  mostrar_apelaciones_desestimadas: boolean;
  columnas: ColumnaConfig[];
}

@Component({
  standalone: true,
  selector: 'app-registrar-auto-resuelve-calificacion-sentencia-superior-modal',
  templateUrl: './sujetos-apelacion-sentencia.html',
  styleUrls: ['./sujetos-apelacion-sentencia.scss'],
  imports: [
    CmpLibModule,
    CapitalizePipe,
    SharedModule,
    TableModule,
    DropdownModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    RippleModule,
    NgIf,
    CommonModule
  ],
})
export class SujetosApelacionSentencia implements OnInit, OnDestroy {

  protected configuracion: SujetosApelacionConfig;
  public tituloCaso: SafeHtml = '';
  protected readonly obtenerIcono = obtenerIcono;
  private idCaso: string = '';
  protected idActoTramiteCaso: string = '';
  protected nuPestana: string = '';
  private subscriptions: Subscription[] = [];
  protected soloLectura: boolean = false;
  protected numeroCaso: string = '';
  protected nuApelacionFiscal: number = 0;
  protected nuDesistidas: number = 0;
  private editableFieldName: string | null = null;
  protected listaSujetosConApelacion: any[] = [];

  protected listaRespuestaCalificacion: { id: number; nombre: string }[] = [
    { id: 1480, nombre: 'Admisible' },
    { id: 1045, nombre: 'Inadmisible' }
  ];
  protected listaRespuestaResposicion: { id: number; nombre: string }[] = [
    { id: 1485, nombre: 'Fundado' },
    { id: 1486, nombre: 'Infundado' },
    { id: 1487, nombre: 'Consentido' }
  ];
  protected listaRespuestaSentencia: { id: number; nombre: string }[] = [
    { id: 1488, nombre: 'Anula' },
    { id: 1489, nombre: 'Confirma' },
    { id: 1490, nombre: 'Revoca' },
    { id: 1491, nombre: 'Nulidad' }
  ];
  protected listaRespuestaDesistiemiento: { id: number; nombre: string }[] = [
    { id: 1506, nombre: 'Fundado' },
    { id: 1504, nombre: 'Infundado' },
    { id: 1505, nombre: 'Consentido' }
  ];

  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
    private pestanaApelacionSujetoService: PestanaApelacionSujetoService,
    private dialogService: DialogService,
  ) {
    this.idCaso = this.config.data?.idCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.nuPestana = this.config.data?.nuPestana;
    this.soloLectura = this.config.data?.soloLectura ?? false;
    this.configuracion = this.config.data?.configuracion;
  }

  ngOnInit(): void {
    this.tituloDelCaso();
    this.obtenerSujetosConDelitos();
    this.editableFieldName = this.configuracion.columnas.find(c => c.editar)?.nombre_campo || null;
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `Número de caso: ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  private obtenerSujetosConDelitos(): void {
    this.subscriptions.push(
      this.pestanaApelacionSujetoService
        .obtenerSujetosProcesalesSentencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: any[]) => {
            this.soloLectura ? this.ordenarNoEditables(resp) : this.ordenarEditables(resp);
            this.nuApelacionFiscal = this.listaSujetosConApelacion.filter(item => item.flApelacionFiscal === 1).length;
            this.nuDesistidas = this.listaSujetosConApelacion.filter(item => item.idResultadoResuelveDesistimiento === 1506).length;
          },
          error: (error: any) => {
            console.error('Error al obtener sujetos y delitos:', error);
          },
        })
    );
  }

  ordenarEditables(sujetos: any[]){
    const getPriority = (item: any) => {
      const columnaEditable = this.configuracion.columnas.find(c => c.editar);
      const mostrarCampo = !!item[columnaEditable?.mostrar_campo || ''];
      const esCasoActual = item.idActoTramiteCasoGuardado === this.idActoTramiteCaso || item.idActoTramiteCasoGuardado === null;

      if (item.idResultadoResuelveDesistimiento === 1506) return 5;
      if (!mostrarCampo) return 4;
      if (item.flApelacionFiscal === 1 && esCasoActual) return 1;
      if (esCasoActual) return 2;
      if (!esCasoActual && item.idActoTramiteCasoGuardado !== null) return 3;

      return 6;
    };

    this.listaSujetosConApelacion = sujetos.sort((a: any, b: any) => {
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const sujetoCompare = (a.sujeto || '').localeCompare(b.sujeto || '');
      if (sujetoCompare !== 0) {
        return sujetoCompare;
      }

      return (a.tipoPena || '').localeCompare(b.tipoPena || '');
    });
  }

  ordenarNoEditables(sujetos: any[]){
    this.listaSujetosConApelacion = sujetos
      .filter(item => item.idActoTramiteCasoGuardado === this.idActoTramiteCaso)
      .sort((a: any, b: any) => {
      const sujetoCompare = (a.sujeto || '').localeCompare(b.sujeto || '');
      if (sujetoCompare !== 0) {
        return sujetoCompare;
      }
      return (a.tipoPena || '').localeCompare(b.tipoPena || '');
    });
  }

  public cerrarModal(): void {
    this.dialogRef.close(); // Cierra sin devolver datos
  }

  cancelar(): void {
    this.cerrarModal();
  }

  aceptar(): void {
    if (!this.editableFieldName) {
      this.dialogRef.close({ flCheckModal: this.getTotalSujetosSeleccionados() > 0 });
      return;
    }

    const sujetosParaEnviar = this.listaSujetosConApelacion
      .filter(item => (item.idActoTramiteCasoGuardado === this.idActoTramiteCaso || item.idActoTramiteCasoGuardado === null)
        && item[this.editableFieldName!] !== null && (item[this.editableFieldName!] > 0 || item[this.editableFieldName!] === true))
      .map(item => ({
        ...item,
        [this.editableFieldName!]: item[this.editableFieldName!] === true ? 1 : item[this.editableFieldName!]
      }));

    this.pestanaApelacionSujetoService
      .registrarSujetosProcesalesSentencia(this.idActoTramiteCaso, this.editableFieldName, sujetosParaEnviar)
      .subscribe({
        next: () => {
          this.dialogService.open(AlertaModalComponent, {
            data: {
              icon: 'success',
              title: 'Éxito',
              description: 'Sujetos guardados correctamente',
              confirmButtonText: 'Aceptar',
              confirm: true,
            },
            showHeader: false,
          });
          this.dialogRef.close({
            flCheckModal: this.getTotalSujetosSeleccionados() > 0
          });
        },
        error: (error) => {
          this.dialogService.open(AlertaModalComponent, {
            data: {
              icon: 'error',
              title: 'Error',
              description: error?.error?.message || 'Ocurrió un error al guardar los sujetos',
              confirmButtonText: 'Aceptar',
              confirm: true,
            },
            showHeader: false,
          });
        }
      });
  }

  getTotalSujetosSeleccionados() {
    if (!this.editableFieldName) return 0;
    return this.listaSujetosConApelacion.filter(
      (sujeto) =>
        (sujeto[this.editableFieldName!] != null && (sujeto[this.editableFieldName!] > 0 || sujeto[this.editableFieldName!] === true)) &&
        (sujeto.idActoTramiteCasoGuardado == null ||
          sujeto.idActoTramiteCasoGuardado == this.idActoTramiteCaso)
    ).length;
  }

  esEditable(item: any): boolean {
    if (this.soloLectura) return false;
    if (item.idActoTramiteCasoGuardado && item.idActoTramiteCasoGuardado !== this.idActoTramiteCaso) return false;
    return true;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  showBtnAceptar(): boolean {
    if (this.soloLectura) return false;
    if (!this.editableFieldName) return true;

    if(this.editableFieldName === 'idResultadoResuelveApelacionSentencia'){ // PARA RESULTADO DE APELACION DE SENTENCIA SE OBLIGA A QUE TODOS LOS EDITABLE ESTEN COMPLETOS
      return this.listaSujetosConApelacion.every(item =>
        !(this.esEditable(item) && this.isColumnEditable(this.editableFieldName!, item)) || item[this.editableFieldName!] > 0
      );
    } else{
      return this.listaSujetosConApelacion.some(item =>
        this.esEditable(item) && !!item[this.editableFieldName!]
      );
    }
  }

  showMensajeInformativo(): boolean {
    const mensajeInformativo = this.configuracion.mensaje_informativo;
    const campo = mensajeInformativo.campo_prerequisito;
    const valor = mensajeInformativo.valor_prerequisito;

    if (!mensajeInformativo || !mensajeInformativo.mostrar || !mensajeInformativo.descripcion) return false;
    if (!campo) return true;
    if (valor === null || valor === undefined) {
      return this.listaSujetosConApelacion.some(sujeto =>
        sujeto.hasOwnProperty(campo) && sujeto[campo] !== null && sujeto[campo] !== undefined
      );
    }
    return this.listaSujetosConApelacion.some(sujeto => sujeto[campo] === valor);
  }

  isColumnVisible(nombreCampo: string): boolean {
    const column = this.configuracion.columnas.find(c => c.nombre_campo === nombreCampo);
    return !!column?.mostrar;
  }

  isColumnEditable(nombreCampo: string, item: any): boolean {
    const column = this.configuracion.columnas.find(c => c.nombre_campo === nombreCampo);
    if (!column) return false;
    if (column.mostrar_campo && item[column.mostrar_campo] === 0) return false;
    return !!column?.editar;
  }
}
