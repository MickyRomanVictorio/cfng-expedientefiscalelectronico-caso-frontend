import { Component, inject } from '@angular/core';
import { PagosService } from '@core/services/reusables/efe/pagos/pagos.service';
import { CmpLibModule } from 'dist/cmp-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { REPARACION_CIVIL } from '@core/types/reutilizable/reparacion-civil.type';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ListaSujetosReparacionPagos } from '@core/interfaces/reusables/pagos/pagos';

@Component({
  selector: 'app-listar-sujetos-procesales-pago',
  standalone: true,
  imports: [
    CmpLibModule,
    ButtonModule,
    TableModule,
  ],
  templateUrl: './listar-sujetos-procesales-pago.component.html',
  styleUrl: './listar-sujetos-procesales-pago.component.scss',
  providers:[DialogService,NgxCfngCoreModalDialogService]
})
export class ListarSujetosProcesalesPagoComponent {

  private readonly subscriptions: Subscription[] = [];

  private readonly pagosService = inject(PagosService)

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  protected readonly ref = inject(DynamicDialogRef)

  protected readonly config= inject(DynamicDialogConfig)

  protected participante!:number

  protected idReparacionCivil!:string

  protected listaSujetos:ListaSujetosReparacionPagos[]= [];

  protected REPARACION_CIVIL = REPARACION_CIVIL;

  constructor() {
    this.participante = this.config.data.participante;
    this.idReparacionCivil = this.config.data.idReparacionCivil;
  }

  protected get titulo():string{
    return this.participante == REPARACION_CIVIL.ACREEDOR ? 'Agraviados':'Deudores'
  }

  ngOnInit(): void {
    this.listarSujetosPagos()
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected listarSujetosPagos(){
    this.subscriptions.push(
        this.pagosService.listaSujetosReparaciones(this.idReparacionCivil,this.participante).subscribe({
          next: resp => {
            if(resp?.length>0){
              this.listaSujetos=resp as ListaSujetosReparacionPagos[];
            }
          },
          error:() => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar listar los sujetos procesales de la reparación civil`, 'Aceptar');
            this.ref.close()
          }
        })
      )
  }
}
