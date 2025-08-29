import {NgClass, NgIf} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IconAsset, icono } from 'ngx-cfng-core-lib';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AlertaData } from '@interfaces/comunes/alert';
import { SujetosProcesales } from '@core/interfaces/comunes/SujetosProcesales';
import { ReusablesSujetoProcesalService } from '@services/reusables/reusable-sujetoprocesal.service';
import { ExportarService } from '@services/shared/exportar.service';
import { MaestroService } from '@services/shared/maestro.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { MensajeNotificacionService } from '@services/shared/mensaje.service';
import { obtenerRutaParaEtapa } from '@utils/utils';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { ListarCuadernosModalComponent } from '../listar-cuadernos-modal/listar-cuadernos-modal.component';
import { PaginatorComponent } from "@core/components/generales/paginator/paginator.component";
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { CasosMonitoreadosService } from '@core/services/superior/casos-monitoreados/casos-monitoreados.service';

@Component({
  standalone: true,
  selector: 'app-listar-sujeto-procesal',
  templateUrl: './listar-sujeto-procesal.component.html',
  styleUrls: ['./listar-sujeto-procesal.component.scss'],
  imports: [
    DropdownModule, FormsModule, ReactiveFormsModule, CmpLibModule, MenuModule, TableModule, CalendarModule,
    DateMaskModule, InputTextModule, RadioButtonModule, NgClass, NgIf,
    PaginatorComponent
],
  providers: [MessageService, DialogService, MensajeNotificacionService],
})
export class ListarSujetoProcesalComponent implements OnInit {
  private caso!: Expediente;

  public formSujetoProcesal!: FormGroup;

  public sujetosProcesales!: SujetosProcesales[];
  public sujetosProcesalesFiltrados: SujetosProcesales[] = [];
  public totalSujetosProcesales!: number;
  public suscripciones: Subscription[] = [];
  protected esSoloLectura: boolean = false;
  tiposSujetoProcesal: any[] = [];
  protected existeMismoAgraviado: boolean=false;

  public mostrarFiltros = false;
  public referenciaModal!: DynamicDialogRef;
  public referenciaModal2!: DynamicDialogRef;

  protected query: any = { limit: 10, page: 1, where: {} };
  protected resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    protected iconAsset: IconAsset,
    private formulario: FormBuilder,
    private maestroService: MaestroService,
    private reusablesSujetoProcesalService: ReusablesSujetoProcesalService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private dialogService: DialogService,
    private messageService: MessageService,
    private exportarService: ExportarService,
    private gestionCasoService: GestionCasoService,
    private mensajeService: MensajeNotificacionService,
    private spinner: NgxSpinnerService,
    private readonly casosMonitoreadosService: CasosMonitoreadosService,
  ) { }

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
    this.esSoloLectura = this.esModoLecturaMonitoreado() ? true : (this.caso && (this.caso.flgLectura.toString() === '1' || this.caso.flgConcluido === '1'));
    this.formInicio();
    this.loadTiposSujetoProcesal();
    this.loadListaSujetosProcesales();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((subscription) => subscription.unsubscribe());
  }

  private formInicio(): void {
    this.formSujetoProcesal = this.formulario.group({
      buscar: [''],
      tipoSujetoProcesal: [''],
    });

    this.busquedaDinamica();
  }

  loadTiposSujetoProcesal() {
    this.suscripciones.push(
      this.maestroService.obtenerTipoParteSujeto().subscribe((result: any) => {
        this.tiposSujetoProcesal = result.data;
      })
    );
  }

  private loadListaSujetosProcesales() {
    this.suscripciones.push(
      this.reusablesSujetoProcesalService.getListaSujetoProcesal(this.caso.idCaso)
        .subscribe((result) => {
          this.sujetosProcesales = result ?? [];
          this.totalSujetosProcesales = this.sujetosProcesales.length;
          //this.sujetosProcesalesFiltrados = [...this.sujetosProcesales];

          this.sujetosProcesalesFiltrados = this.sujetosProcesales;
          this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
          this.itemPaginado.data.total = this.sujetosProcesalesFiltrados.length;
          this.updatePagedItems(this.sujetosProcesalesFiltrados, false);

          const documentosDenunciantes = new Set(
            this.sujetosProcesales
                .filter(sujeto => sujeto.tipoSujetoProcesal === "Denunciante" 
                  && sujeto.numeroDocumento !== "-")
                .map(sujeto => sujeto.numeroDocumento)
        );
        this.sujetosProcesales.forEach(sujeto => {
          if (sujeto.tipoSujetoProcesal === "Agraviado"
             && documentosDenunciantes.has(sujeto.numeroDocumento)
            ) {
              this.existeMismoAgraviado = true;
          }
        });    
      })
    );
  }

  private busquedaDinamica(): void {
    this.formSujetoProcesal.get('buscar')!.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.filtrarSujetoProcesalPorCampo();
      });
  }

  public filtrarSujetoProcesalPorCampo(): void {
    if (this.formSujetoProcesal.valid) {
      const textoBusqueda = this.formSujetoProcesal.get('buscar')!.value;

      if (!textoBusqueda) {
        this.sujetosProcesalesFiltrados = [...this.sujetosProcesales];
      } else {
        this.sujetosProcesalesFiltrados = this.sujetosProcesales.filter((data) =>
          Object.values(data).some((fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') && fieldValue?.toString()?.toLowerCase().includes(textoBusqueda.toLowerCase())
          )
        );
      }
    }
  }

  public obtenerSujetoProcesalConFiltro(): void {  
    const tipoSujeto  = this.formSujetoProcesal.get('tipoSujetoProcesal')!.value;
    if(tipoSujeto && tipoSujeto !== null){
      const criterioBusqueda = this.obtenerNombrePorId(tipoSujeto);
      this.filtrarSujetosProcesales(criterioBusqueda);
    }else{
      this.sujetosProcesalesFiltrados = this.sujetosProcesales;
    }
  }

  protected limpiarTipoSujeto(): void {
    this.sujetosProcesalesFiltrados = this.sujetosProcesales;
  }

  obtenerNombrePorId(idBuscado: number): string | undefined {
    return this.tiposSujetoProcesal.find((opcion) => opcion.id === idBuscado)?.nombre;
  }

  public filtrarSujetosProcesales(value: string | undefined): void {
    console.log(value);
    
    this.sujetosProcesalesFiltrados = this.sujetosProcesales.filter((item) =>
      Object.values(item).some((fieldValue: any) =>
        (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
        fieldValue?.toString()?.toLowerCase().includes(value!.toLowerCase())
      ));
  }

  public abrirEditarSujetoProcesal(idSujetoCaso: string): void {
    this.router.navigate([`/app/administracion-casos/consultar-casos-fiscales/${ obtenerRutaParaEtapa(this.caso.idEtapa) }/caso/${ this.caso.idCaso }/sujeto/${ idSujetoCaso }`])
  }

  public abrirRegistrarSujetoProcesal(): void {
    this.router.navigate([`/app/administracion-casos/consultar-casos-fiscales/${ obtenerRutaParaEtapa(this.caso.idEtapa) }/caso/${ this.caso.idCaso }/sujeto/nuevo`])
  }

  public eliminarSujetoProcesal(idSujetoCaso: string): void {
    this.suscripciones.push(
      this.reusablesSujetoProcesalService.consultarAsociacionSujetosProcesalesConDelitos(idSujetoCaso)
        .pipe(finalize(() => { this.spinner.hide(); }))
        .subscribe({
          next: (tieneDelitos) => {
            let data: object;

            if (tieneDelitos.coValidacion == '0') {
              data = {
                icon: 'error',
                title: 'NO SE PUEDE ELIMINAR SUJETO PROCESAL',
                description: tieneDelitos.noValidacion,
                confirmButtonText: 'Aceptar',
                confirm: false
              };
            } else {
              data = {
                icon: 'warning',
                title: 'ELIMINAR SUJETO PROCESAL',
                description: '¿Está seguro de eliminar este sujeto procesal?',
                confirmButtonText: 'Eliminar',
                confirm: true,
              };
            }

            this.consultaConfirmar(idSujetoCaso, data);
          },
          error: () => {
            this.mensajeService.verMensajeErrorServicio();
          },
        })
    );
  }

  consultarValidacionFiscal(idSujetoCaso: string){
    const data = {
      icon: 'warning',
      title: 'VALIDACIÓN MANUAL',
      description: 'Esta acción valida el número de documento registrado, bajo su responsabilidad ¿Desea continuar?',
      confirmButtonText: 'Continuar',
      confirm: true,
    };

    this.validacionConfirmada(idSujetoCaso, data)
  }

  private validacionConfirmada(idSujetoCaso: string, data: any) {
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      data: data,
      showHeader: false,
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: (resp) => {
          if (resp === 'confirm' && data.confirm) {
            this.referenciaModal.close();

            this.spinner.show();

            this.suscripciones.push(
              this.reusablesSujetoProcesalService.validarPorFiscal(idSujetoCaso)
                .pipe(finalize(() => { this.spinner.hide(); }))
                .subscribe({
                  next: (data) => {
                    if (data.coValidacion == 0) {
                      this.loadListaSujetosProcesales();

                      setTimeout(() => {
                        this.mensajeService.verMensajeNotificacion('Sujeto validado', 'La validación por el fiscal se ha realizado con éxito', 'success','Aceptar');
                      }, 300);
                    }
                  },
                  error: () => {
                    this.mensajeService.verMensajeErrorServicio();
                  },
                })
            );
          }
        },
      });

  }


  private consultaConfirmar(idSujetoCaso: string, data: any) {
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      data: data,
      showHeader: false,
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: (resp) => {
          if (resp === 'confirm' && data.confirm) {
            this.referenciaModal.close();

            this.spinner.show();

            this.suscripciones.push(
              this.reusablesSujetoProcesalService.eliminarSujetoProcesal(idSujetoCaso)
                .pipe(finalize(() => { this.spinner.hide(); }))
                .subscribe({
                  next: (data) => {
                    if (data.code === 200) {
                      this.loadListaSujetosProcesales();

                      setTimeout(() => {
                        this.mensajeService.verMensajeNotificacion('Sujeto Eliminado', 'Se eliminó correctamente el sujeto procesal', 'success');
                      }, 300);
                    }
                  },
                  error: () => {
                    this.mensajeService.verMensajeErrorServicio();
                  },
                })
            );
          }
        },
      });

  }

  public obtenerValidacionSujeto(parteValidada: string, validacion: string): any {
    let casoHtml;

    if (validacion === '1') {
      casoHtml = `<div class="cfe-validacion-sujeto-valido"><span>${parteValidada}</span></div>`;
    } else {
      casoHtml = `<div class="cfe-validacion-sujeto-no-valido"><span>${parteValidada}</span></div>`;
    }

    return this.sanitizer.bypassSecurityTrustHtml(casoHtml);
  }

  public obtenerClaseDeNumeroDocumento(name: string): string {
    const numeroDocumento = name.replaceAll(' ', '-').toLowerCase();
    return numeroDocumento;
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
    this.formSujetoProcesal.get('buscar')?.setValue(null);
    if(this.mostrarFiltros){
      this.formSujetoProcesal.get('buscar')?.disable();
    }else{
      this.formSujetoProcesal.get('buscar')?.enable();
      this.formSujetoProcesal.get('tipoSujetoProcesal')?.setValue(null);
      this.obtenerSujetoProcesalConFiltro();
    }
  }

  public limpiarFiltros(): void {
    this.formSujetoProcesal.reset();
    this.sujetosProcesalesFiltrados = this.sujetosProcesales;
  }

  public exportar(exportType: TipoArchivoType): void {

    this.suscripciones.push(
      this.reusablesSujetoProcesalService.getListaSujetoProcesal(this.caso.idCaso)
        .subscribe((result) => {
          this.sujetosProcesales = result ?? [];
          this.totalSujetosProcesales = this.sujetosProcesales.length;
          this.sujetosProcesalesFiltrados = [...this.sujetosProcesales];

          const documentosDenunciantes = new Set(
            this.sujetosProcesales
                .filter(sujeto => sujeto.tipoSujetoProcesal === "Denunciante" 
                  && sujeto.numeroDocumento !== "-")
                .map(sujeto => sujeto.numeroDocumento)
        );
        this.sujetosProcesales.forEach(sujeto => {
          if (sujeto.tipoSujetoProcesal === "Agraviado"
             && documentosDenunciantes.has(sujeto.numeroDocumento)
            ) {
              this.existeMismoAgraviado = true;
          }
        }); 
        
        if (this.sujetosProcesales.length > 0) {
          const headers = ['TIPO DE SUJETO PROCESAL', 'NÚMERO DE DOCUMENTO', 'TIPO DE DOCUMENTO', 'NOMBRES Y APELLIDOS / RAZÓN SOCIAL', 'ALIAS', 'VALIDACIÓN',];
          const data: any[] = [];
    
          this.sujetosProcesales.forEach((sp: SujetosProcesales) => {
            data.push({
              'TIPO DE SUJETO PROCESAL': sp.tipoSujetoProcesal ? sp.tipoSujetoProcesal.toUpperCase() : '-',
              'NÚMERO DE DOCUMENTO': sp.numeroDocumento ? sp.numeroDocumento.toUpperCase() : '-',
              'TIPO DE DOCUMENTO': sp.documentoIdentidad ? sp.documentoIdentidad.toUpperCase() : '-',
              'NOMBRES Y APELLIDOS / RAZÓN SOCIAL': sp.datosPersonales ? sp.datosPersonales.toUpperCase() : '-',
              'ALIAS': sp.alias ? sp.alias.toUpperCase() : '-',
              'VALIDACIÓN': sp.parteValidada ? sp.parteValidada.toUpperCase() : '-',
            });
          });
    
          exportType === 'PDF'
          ? this.exportarService.exportarAPdf(data, headers, 'sujetos_procesales', 'landscape')
          : this.exportarService.exportarAExcel(data, headers, 'sujetos_procesales');
    
          return;
        }
    
        this.messageService.add({
          severity: 'warn',
          detail: `No se encontraron registros para ser exportados a ${exportType}`,
        });
      })
    );
  }

  public obtenerIcono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  protected abrirCuadernosModal(sujetoProcesal: SujetosProcesales) {
    const verCuadernos = this.dialogService.open(ListarCuadernosModalComponent, {
      showHeader: false,
      width: '95%',
      contentStyle: { overflow: 'auto' },
      data: {
        idSujetoCaso: sujetoProcesal.idSujetoCaso,
        datosPersonales: sujetoProcesal.datosPersonales
      }
    });

    verCuadernos.onClose.subscribe({
      next: (data) => {
        console.log(data);
      },
    });
  }

  private esModoLecturaMonitoreado(): boolean {
    const esMonitoreado = this.casosMonitoreadosService.getEsMonitoreado(); 
    return esMonitoreado === '1';
  }

  public icono(name: string): string {
    return icono(name);
  }

  protected eventoOnPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.updatePagedItems(paginacion.data, paginacion.resetPage);
  }

  private updatePagedItems(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }
  
}
