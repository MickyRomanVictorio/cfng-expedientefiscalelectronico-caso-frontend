import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FirmaIndividualCompartido } from '@interfaces/reusables/firma-digital/firma-individual-compartido.interface';
import { MenuTramiteComponent } from '../menu-tramite/menu-tramite.component';
import { TramiteResponse } from '@core/interfaces/comunes/crearTramite';
import { textoDecimales } from '@utils/string';
import { icono } from 'dist/ngx-cfng-core-lib';
import { obtenerTiempoTranscurrido } from '@utils/date';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DetalleFirmaComponent } from '@components/modals/detalle-firma/detalle-firma.component';

@Component({
  selector: 'app-visor',
  standalone: true,
  imports: [CommonModule, MenuTramiteComponent],
  templateUrl: './visor.component.html',
  styleUrl: './visor.component.scss',
})
export class VisorComponent implements OnInit, OnDestroy {
  @Input() firmaIndividual!: FirmaIndividualCompartido;
  @Input() tramiteResponse!: TramiteResponse;
  @ViewChild('pdfIframe') pdfIframe: any;

  protected readonly textoDecimales = textoDecimales;
  intervalIdMinutes: any;
  urlDocumento: any;
  ultimoModificado: string = '';

  referenciaModal!: DynamicDialogRef;

  constructor(private sanitizer: DomSanitizer,
              private readonly dialogService: DialogService,) {}

  ngOnInit(): void {
    this.urlDocumento = this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(this.firmaIndividual.documento)
    );
    this.calcularDiferencia();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalIdMinutes);
  }

  get nombreUsuario(): string {
    return this.tramiteResponse.nombreUsuario ?? '';
  }

  get nombreUsuarioFormato(): string {
    return this.nombreUsuario.split(' ')
      .map(nombre => nombre.charAt(0) + nombre.slice(1).toLowerCase())
      .join(' ');
  }

  public icono(name: string): string {
    return icono(name);
  }

  private calcularDiferencia(): void {
    if (!this.tramiteResponse.fechaModificacion) return;
    this.ultimoModificado = obtenerTiempoTranscurrido(new Date(this.tramiteResponse.fechaModificacion));
    this.intervalIdMinutes = setInterval(() => {
      if (!this.tramiteResponse.fechaModificacion) return;
      this.ultimoModificado = obtenerTiempoTranscurrido(new Date(this.tramiteResponse.fechaModificacion));
    }, 60000); // cada 1 minuto 60000
  }

  public verDetalleFirma(): void {
    this.referenciaModal = this.dialogService.open(
      DetalleFirmaComponent,
      {
        showHeader: false,
        data: {
          titulo: 'Detalle de Firmas',
          idDocumentoVersiones: this.tramiteResponse.idDocumentoVersiones,
        },
      }
    );
  }
}
