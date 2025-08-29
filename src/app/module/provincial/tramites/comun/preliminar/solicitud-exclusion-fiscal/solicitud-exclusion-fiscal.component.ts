import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  SolicitudAcuerdoReparatorioService
} from '@services/provincial/tramites/comun/intermedia/solicitud-acuerdo-reparatorio.service';
import { Router } from '@angular/router';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { TokenService } from '@core/services/shared/token.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { Alerta } from '@core/interfaces/comunes/alerta';
import { ID_ETAPA } from '@core/constants/menu';

@Component({
  selector: 'app-solicitud-exclusion-fiscal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule
    ],
  templateUrl: './solicitud-exclusion-fiscal.component.html'
})
export class SolicitudExclusionFiscalComponent implements OnInit {

  @Input() idCaso: string = ''
  @Input() numeroCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() idActoTramiteCasoMesa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() iniTramiteCreado: boolean = false;

  public solicitudAcuerdoReparatorioEncontrada: boolean = false;
  private suscripciones: Subscription[] = [];

  private readonly desuscribir$ = new Subject<void>();

  constructor(
    private solicitudAcuerdoReparatorioService: SolicitudAcuerdoReparatorioService,
    private router: Router,
    private readonly tokenService: TokenService,
    private readonly alertaService: AlertaService,
  ) { }

  ngOnInit(): void {
    //resuleve las alertas del caso
    this.resolverAlertas();
    
    this.obtenerSolicitudAcuerdoReparatoria();
  }

  resolverAlertas() {
    if (this.iniTramiteCreado && (this.idEtapa==ID_ETAPA.PRELIMINAR)) {
      this.solucionarAlerta();
    }
  }

  solucionarAlerta(): void {


    const alerta: Alerta = {
      codigoCaso: this.numeroCaso,
      codigoDespacho: this.tokenService.getDecoded().usuario.codDespacho,
      fechaCreacion: '',
      codigoUsuarioDestino: this.tokenService.getDecoded().usuario.usuario,
      texto: '',
      idAsignado: this.tokenService.getDecoded().usuario.usuario
    }
    this.alertaService
      .solucionarAlerta(alerta)
      .pipe(takeUntil(this.desuscribir$))
  }

  ngOnDestroy(): void {
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  public obtenerSolicitudAcuerdoReparatoria() {
    this.suscripciones.push(
      this.solicitudAcuerdoReparatorioService.obtenerSolicitudAcuerdoReparatorio(
        this.tramiteSeleccionado!.idActoTramiteEstado,
        this.idCaso
      ).subscribe({
        next: solicitud => {
          if (solicitud.idDocumento) {
            this.solicitudAcuerdoReparatorioEncontrada = true;
          } else {
            this.solicitudAcuerdoReparatorioEncontrada = false;
          }
        },
        error: error => {
          console.error(error)
          this.solicitudAcuerdoReparatorioEncontrada = false
        }
      })
    )
  }

  public verDocumentosIngresados(): void {
    this.router.navigate(['/app/documentos-ingresados'])
  }
}