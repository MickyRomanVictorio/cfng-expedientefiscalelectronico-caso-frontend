import {Component, ComponentRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import { concatMap, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import {CommonModule} from '@angular/common';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {TramiteService} from '@services/provincial/tramites/tramite.service';
import {MessagesModule} from 'primeng/messages';
import {MessageService} from 'primeng/api';
import {TokenService} from '@services/shared/token.service';
import {
  ActoProcesalComponent
} from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/acto-procesal/acto-procesal.component';
import { Expediente } from '@utils/expediente';
import {
  AcumulacionAsociarCaso
} from '@interfaces/provincial/tramites/comun/calificacion/acumulacion-asociar-caso/acumulacion-asociar-caso.interface';
import { tap } from 'rxjs/operators';
import { ID_ETAPA } from 'dist/ngx-cfng-core-lib';
import { DEVOLVER } from '@core/types/bandeja/devolver.type';
import { GestionCasoService } from '@services/shared/gestion-caso.service';

@Component({
  standalone: true,
  selector: 'app-tabpanel-acto-procesal',
  templateUrl: './tabpanel-acto-procesal.component.html',
  styleUrls: ['./tabpanel-acto-procesal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    MessagesModule,
    ActoProcesalComponent,
  ],
  providers: [DialogService, MessageService, TokenService],
})
export class TabpanelActoProcesalComponent implements OnInit, OnDestroy {

  @ViewChild('componenteACargar', { read: ViewContainerRef }) componenteACargar!: ViewContainerRef;
  private componenteCargado!: ComponentRef<any>;

  @Input() idCaso: string = '';
  @Input() devolverRecibidosPorRevisarHijo:any = null;

  public ocultarBotonTramite: boolean = false;
  public suscripciones: Subscription[] = [];
  public casoFiscal: Expediente | null = null;
  public tramiteDevolver: TramiteProcesal | null = null;
  public datosExtraFormulario: AcumulacionAsociarCaso = {};
  public usuario!: string;
  public idtramiteDevolver: string = '';
  public datosObtenidos: boolean = false;

  private desuscribir$ = new Subject<void>();

  constructor(private tokenService: TokenService,
              private spinner: NgxSpinnerService,
              private tramiteService: TramiteService,
              private gestionCasoService: GestionCasoService,
              public referenciaModal: DynamicDialogRef) {
    this.obtenerUsuario();
  }

  public ngOnInit(): void {
    this.iniciarValores();
    this.obtenerDatos();
  }

  public ngOnDestroy(): void {
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  get tramitePredefinido(): TramiteProcesal {
    return this.tramiteDevolver || {} as TramiteProcesal;
  }

  private iniciarValores() {
    this.casoFiscal = null;
    this.tramiteDevolver = null;
    this.datosObtenidos = false;
  }

  private obtenerDatos() {
    this.spinner.show();
    this.obtenerCaso().pipe(
      takeUntil(this.desuscribir$),
      concatMap(() => this.obtenerTramite())
    ).subscribe({
      next: () => {
        this.spinner.hide();
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  private obtenerCaso(): Observable<any> {
    return this.gestionCasoService.obtenerCasoFiscalV2(this.idCaso).pipe(
      takeUntil(this.desuscribir$),
      tap((resp) => {
        console.log('obtenerCaso');
        this.casoFiscal = resp;
        this.idtramiteDevolver = this.configurarIdTtramite();
      })
    );
  }

  private obtenerTramite(): Observable<any> {
    return this.tramiteService.obtenerActoTramiteEstado(this.idtramiteDevolver).pipe(
      takeUntil(this.desuscribir$),
      tap((resp) => {
        console.log('obtenerTramite');
        this.tramiteDevolver = resp;
        this.datosObtenidos = true;
      })
    );
  }

  private configurarIdTtramite(): string {
    switch(this.casoFiscal?.idEtapa) {
      case ID_ETAPA.CALI:
        return DEVOLVER.DEVOLVER_TRAMITE_CALIFICACION;
      case ID_ETAPA.PREL:
        return DEVOLVER.DEVOLVER_TRAMITE_PRELIMINAR;
      case ID_ETAPA.PREP:
        return DEVOLVER.DEVOLVER_TRAMITE_PREPARATORIA;
      default: return DEVOLVER.DEVOLVER_TRAMITE_CALIFICACION;
    }
  }

  public formularioValido(): boolean {
    return this.componenteCargado && this.componenteCargado.instance.formularioValido
  }

  public obtenerUsuario(): void {
    const datosToken = this.tokenService.getDecoded()?.usuario
    this.usuario = datosToken?.usuario;
  }

}
