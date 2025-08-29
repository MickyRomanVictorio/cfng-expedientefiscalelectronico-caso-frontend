import { REPARACION_CIVIL } from '@core/types/reutilizable/reparacion-civil.type';
import { CUOTAS } from './../../../../../core/types/efe/provincial/expediente/pago.type';
import { Component, inject } from '@angular/core';
import { TabsViewPagosComponent } from './tabs-view-pagos/tabs-view-pagos.component';
import { TabViewModule } from 'primeng/tabview';
import { CommonModule } from '@angular/common';
import { CmpLibModule } from 'dist/cmp-lib';
import { FiltroListaPago } from '@core/interfaces/reusables/pagos/FiltroListaPago';
import { ButtonModule } from 'primeng/button';
import { FILTRO_LISTA_PAGOS } from '@core/types/efe/provincial/expediente/pago.type';
import { TableModule } from 'primeng/table';
import { PagosService } from '@core/services/reusables/efe/pagos/pagos.service';
import { IconAsset } from 'dist/ngx-cfng-core-lib';
import { Subscription } from 'rxjs';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { SolPeruanoPipe } from '@core/pipes/sol-peruano.pipe';
import { ListaCuotaReparacionCivil, ListaReparacionCivilPagos, ReparacionCivilDetallePagos, TabPagos } from '@core/interfaces/reusables/pagos/pagos';
import { ListarSujetosProcesalesPagoComponent } from '@core/components/reutilizable/listar-sujetos-procesales-pago/listar-sujetos-procesales-pago.component';
import { capitalizedFirstWord } from '@core/utils/string';
import { RegistrarEditarPagosComponent } from '@core/components/reutilizable/registrar-editar-pagos/registrar-editar-pagos.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    TabsViewPagosComponent,
    TabViewModule,
    CommonModule,
    CmpLibModule,
    ButtonModule,
    TableModule,
    SolPeruanoPipe
  ],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.scss',
  providers: [DialogService, NgxCfngCoreModalDialogService]
})

export class PagosComponent {

  private idCaso: string = ''

  private readonly pagosService = inject(PagosService)

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly dialogService = inject(DialogService)

  protected readonly iconAsset = inject(IconAsset)

  protected readonly gestionCasoService = inject(GestionCasoService)

  private readonly subscriptions: Subscription[] = []

  protected CUOTAS = CUOTAS

  protected REPARACION_CIVIL = REPARACION_CIVIL

  protected tabs: TabPagos[] = []

  protected tabsSeleccionado!: TabPagos

  protected reparacionSeleccionada!: ReparacionCivilDetallePagos | null;

  protected filtroBandeja: FiltroListaPago[] = []

  protected capitalizedFirstWord = capitalizedFirstWord;

  protected filtrosTramiteSelec: number = 0

  protected get monedaSol(): string {
    return 'assets/icons/moneda_sol.svg'
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.pagosService.actualizarReparacionOb$.subscribe(() => {

      this.obtenerDetalleReparacionCivil(this.tabsSeleccionado.idReparacionCivil, this.filtrosTramiteSelec > 0 ? this.filtrosTramiteSelec : null)

    }))
    
    this.idCaso = this.gestionCasoService.casoActual.idCaso;

    this.filtroBandeja = FILTRO_LISTA_PAGOS

    this.listarReparacionesCiviles()

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected cambiarTab(indiceTab: number) {
    this.filtrosTramiteSelec = 0;

    this.tabsSeleccionado = this.tabs[indiceTab];

    this.obtenerDetalleReparacionCivil(this.tabsSeleccionado.idReparacionCivil, null)

  }

  private listarReparacionesCiviles(): void {

    this.subscriptions.push(

      this.pagosService.listarReparacionesCiviles(this.idCaso).subscribe({

        next: resp => {
          if (resp?.length > 0) {
            //LISTAR REPARACIONES CIVILES DE CASO
            const listaReparaciones: ListaReparacionCivilPagos[] = resp as ListaReparacionCivilPagos[]
            let tabs: TabPagos[] = [];
            listaReparaciones.forEach(reparacion => {
              tabs.push({
                titulo: reparacion.codReparacionCivil,
                idReparacionCivil: reparacion.idReparacionCivil,
                atrasado: reparacion.atrasado
              })
            });
            this.tabs = [...tabs];
            //OBTENER PRIMER DETALLE POR DEFECTO
            this.tabsSeleccionado = tabs[0];
            this.obtenerDetalleReparacionCivil(this.tabsSeleccionado.idReparacionCivil, null)
          }
        },
        error: () => {

          this.modalDialogService.error("Error", 
                                        `Se ha producido un error al intentar listar las reparaciones civiles`,
                                        'Aceptar');
        }
      })
    )
  }

  private obtenerDetalleReparacionCivil(idReparacionCivil: string, estadoCuota: number | null): void {
    this.subscriptions.push(
      this.pagosService.detalleReparacion(idReparacionCivil, estadoCuota).subscribe({
        next: resp => {
          if (resp) {

            this.reparacionSeleccionada = resp as ReparacionCivilDetallePagos;

            const cuotasMap = new Map(this.reparacionSeleccionada?.cuotas.map(cuota => [cuota.cuota, cuota]));

            this.reparacionSeleccionada?.cuotas.forEach(detalleCuota => {

              if (detalleCuota.cuota > 1) {

                const cuotaAnterior = cuotasMap.get(detalleCuota.cuota - 1);

                detalleCuota.activarPago = cuotaAnterior?.idEstadoCuota === CUOTAS.PAGADO;

              } else {

                detalleCuota.activarPago = true;

              }

            });
          }
          else {
            this.modalDialogService.error("Error",
                                          `No se ha encontrado la información de la reparación civil`,
                                          'Aceptar');
          }
        },
        error: () => {
          this.reparacionSeleccionada=null;
          this.modalDialogService.error("Error",
                                        `Se ha producido un error al intentar obtener la información de la reparación civil`,
                                        'Aceptar');
        }
      })
    )
  }

  protected filtrarListaCuotas(codigo: number): void {

    this.filtrosTramiteSelec = codigo;

    this.obtenerDetalleReparacionCivil(this.tabsSeleccionado.idReparacionCivil, codigo > 0 ? codigo : null)

  }

  protected abrirModalSujetos(participante: number): void {

    this.dialogService.open(ListarSujetosProcesalesPagoComponent, {
      showHeader: false,
      data: {
        participante: participante,
        idReparacionCivil: this.reparacionSeleccionada?.idReparacionCivil
      },
      contentStyle: { padding: '0', 'border-radius': '15px' }
    })

  }

  protected abrirModalRegistrarEditarPagos(detalle: ListaCuotaReparacionCivil): void {
    this.dialogService.open(RegistrarEditarPagosComponent, {
      showHeader: false,
      data: {
        cuota: {
          idCuota:detalle.idCuota,
          idPagoCuota:detalle.idPagoCuota,
          codReparacionCivil: this.reparacionSeleccionada?.codReparacionCivil,
          cuota:detalle.cuota
        },
        modoLectura:detalle.idEstadoCuota === CUOTAS.PAGADO && this.obtenerMontoPagadoPorCuota(detalle.cuota+1) > 0
      },
      contentStyle: { padding: '0', 'border-radius': '15px' }
    })
  }

  
  protected obtenerMontoPagadoPorCuota(numeroCuota: number): number  {
    const cuotaEncontrada = this.reparacionSeleccionada?.cuotas.find(
      item => item.cuota === numeroCuota
    );
    return cuotaEncontrada?.montoPagado ?? 0;
  }
  

}
