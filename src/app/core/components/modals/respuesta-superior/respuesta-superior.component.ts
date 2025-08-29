import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { obtenerIcono } from '@core/utils/icon';
import { IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  ActoProcesalComponent
} from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/acto-procesal/acto-procesal.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { map, Subscription } from 'rxjs';
import { RespuestaSuperiorDetalleService } from '@core/services/provincial/respuesta-superior/respuesta-superior-detalle.service';
import { RespuestaSuperiorService } from '@core/services/provincial/respuesta-superior/respuesta-superior.service';
import { EtiquetaCasoComponent } from '@core/components/consulta-casos/components/carpeta-caso/etiqueta-caso/etiqueta-caso.component';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { TipoElevacionCodigo } from '@core/constants/superior';
import { UsuarioAuthService } from '@services/auth/usuario.service.ts.service';

@Component({
  selector: 'app-respuesta-superior',
  standalone: true,
  imports: [
    CmpLibModule,
    NgClass,
    ActoProcesalComponent,
    EtiquetaCasoComponent
  ],
  templateUrl: './respuesta-superior.component.html',
  styleUrl: './respuesta-superior.component.scss'
})
export class RespuestaSuperiorComponent implements OnInit, OnDestroy {

  protected obtenerIcono = obtenerIcono;
  protected mostrarDetalle  = signal<boolean>(false);
  protected idActoTramiteCasoTramite = signal<string>('');
  private readonly subscriptions = new Subscription();
  protected datosDetalle = signal<BandejaElevacionDetalle | null>(null);
  protected TipoElevacionCodigo = TipoElevacionCodigo;

  constructor(
    protected readonly ref: DynamicDialogRef,
    protected readonly iconUtil: IconUtil,
    protected readonly stringUtil: StringUtil,
    private readonly configuracion: DynamicDialogConfig,
    private readonly usuarioAuthService:UsuarioAuthService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly respuestaSuperiorDetalleService:RespuestaSuperiorDetalleService,
    private readonly respuestaSuperiorService:RespuestaSuperiorService,
    private readonly consultaCasosGestionService:ConsultaCasosGestionService
  ) {
  }

  ngOnInit(): void {
    //
    this.respuestaSuperiorService.obtenerDetalleRespuesta(this.configuracion.data.idActoTramiteCasoElevacion).subscribe({
      next: (rs) => {
        this.datosDetalle.set(rs);
      }
    })
    //
    this.subscriptions.add(this.gestionCasoService.obtenerCasoFiscalV2(this.configuracion.data.idCaso, { flgLectura:0 }).subscribe({
        next: (_) => {
          this.idActoTramiteCasoTramite.set(this.configuracion.data.idActoTramiteCasoRespuesta);
        }
      })
    );
    //
    this.subscriptions.add(this.respuestaSuperiorDetalleService.obtenerAccionFinalizada$().subscribe({
      next: (accionFinalizada:string) => {
        this.ref.close(accionFinalizada);
      }
    })
    );
  }

  private get codJerarquia(): string {
    return this.usuarioAuthService.obtenerDatosUsuario().codJerarquia;
  }

  protected get esSuperior(): boolean {
    return this.codJerarquia == '02';
  }

  protected eventoMostrarDetalle(): void {
    this.mostrarDetalle.set(!this.mostrarDetalle());
  }

  protected etiqueta(caso: any) {
    return this.consultaCasosGestionService.getEtiquetaXTipoElevacion(caso.idTipoElevacion.toString(), {
      etiqueta: caso.descTipoElevacion
    }, '2');
  }
  protected etiqueta2(caso: any) {
    return this.consultaCasosGestionService.getEtiquetaXTipoElevacion(caso.idTipoElevacion.toString(), {
      esContiendaCompetencia: caso.idTipoContienda.toString(),
      nuApelacion: caso.nuPestana,
      nuCuaderno: caso.nuCuaderno
    }, '2');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}


export interface BandejaElevacionDetalle {
  idBandejaElevacion: string;
  idActoTramiteCasoEleva: string;
  idActoTramiteCasoRespuesta: string;
  idCaso: string;
  codCaso: string;
  fiscal: string;
  esCaso: number;
  esCuaderno: number;
  esPestana: number;
  idTipoElevacion: number;
  descTipoElevacion: string;
  idTipoContienda?: number;
  noTipoContienda?: string;
  descResultado?: string;
  fechaResultado: string;
  idEtapa: string;
  descEtapa: string;
  descTramite: string;
  fechaElevacion: string;
  delitos: string;
  nuCuaderno: number;
  nuPestana: number;
  idClasificador: string;
  noClasificador: string;
  idTipoClasificador: string;
  noTipoClasificador: string;
  noTipoCuadernoIncidental: string | null;
}

