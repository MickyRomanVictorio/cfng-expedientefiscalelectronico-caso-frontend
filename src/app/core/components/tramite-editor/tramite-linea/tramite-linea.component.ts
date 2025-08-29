import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TramiteResponse } from '@core/interfaces/comunes/crearTramite';
import { FirmaIndividualCompartido } from '@interfaces/reusables/firma-digital/firma-individual-compartido.interface';
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service';
import { MenuItem } from 'primeng/api';
import { StepsModule } from 'primeng/steps';
import { Subscription } from 'rxjs';
import { EditorComponent } from '../editor/editor.component';
import { VisorComponent } from '../visor/visor.component';
import { TramiteService } from '@services/provincial/tramites/tramite.service';

@Component({
  selector: 'app-tramite-linea',
  standalone: true,
  imports: [CommonModule, StepsModule, EditorComponent, VisorComponent],
  templateUrl: './tramite-linea.component.html',
})
export class TramiteLineaComponent implements OnInit, OnDestroy {
  @Input() tramiteResponse!: TramiteResponse;
  @Input() activeIndex: number = 0;
  @Input() esFirmado: boolean = false;
  public firmaIndividual!: FirmaIndividualCompartido;
  public subscriptions: Subscription[] = [];

  constructor(private firmaIndividualService: FirmaIndividualService,
              private tramiteService: TramiteService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe({
        next: (respuesta) => {
          //console.log('respuesta', respuesta);
          if (respuesta.esFirmado) {
            this.activeIndex = 1;
            this.firmaIndividual = respuesta;
          }
        },
        error: (error) => console.error(error),
      })
    );
    this.validarEstado();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  validarEstado(): void {
    if (this.esFirmado) {
      this.subscriptions.push(
        this.tramiteService.descargarDocumento(this.tramiteResponse.idDocumentoVersiones || '').subscribe({
          next: (resp) => {
            this.firmaIndividual = {
              esFirmado: true,
              documento: this.base64ToBlob(resp.archivo, 'application/pdf'),
              idMovimiento: "",
              idDocumentoVersiones: "",
              idDocumentoFirmante: "",
            };
            this.activeIndex = 1;
          }
        })
      );
    }
  }

  private base64ToBlob(base64: string, type: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: type });
  }

}
