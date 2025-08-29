import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { VisorEfeService } from '@core/services/visor/visor.service';
import {
  ElevacionActuadosService
} from "@services/provincial/tramites/comun/calificacion/elevacion-actuados/elevacion-actuados.service";
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-solicitud-elevacion-actuados',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    CheckboxModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    MenuModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [MessageService, DialogService],
  templateUrl: './solicitud-elevacion-actuados.component.html',
  styleUrls: ['./solicitud-elevacion-actuados.component.scss']
})
export class SolicitudElevacionActuadosComponent implements OnInit {

  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Output() ocultarTitulo = new EventEmitter<boolean>();
  protected pdfUrlTramite!: SafeResourceUrl;
  protected existeDocumentoRecibido: boolean | null = false;

  constructor(
    private readonly tramiteService: TramiteService,
    private readonly router: Router,
    private readonly elevacionActuadosService: ElevacionActuadosService,
    private readonly sanitizer: DomSanitizer,
    private readonly visorEfeService: VisorEfeService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.ocultarTitulo.emit(false);
      console.log('ssss');
      this.tramiteService.validacionTramite.verDocumentos = false;
    }, 100);
    this.obtenerSolicitudAcuerdoReparatoria();
  }

  protected eventoDocumentosIngresados(): void {
    this.router.navigate(['/app/documentos-ingresados'])
  }

  private obtenerSolicitudAcuerdoReparatoria() {
    this.elevacionActuadosService.obtenerIdDocumentoSolicitudElevacionActuados(this.idCaso, this.etapa).subscribe({
      next: solicitud => {
        if (solicitud.length > 0) {
          this.existeDocumentoRecibido = true;
          this.obtenerDocumentoRecibido(solicitud);
        }
      },
      error: error => {
        if (error.status === 422) {
          this.existeDocumentoRecibido = false;
        }
      }
    })
  }

  private obtenerDocumentoRecibido(idNode: string) {
    console.log('obtenerDocumentoRecibido')
    this.visorEfeService.getArchivo(idNode, 'doc.pdf').subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.pdfUrlTramite = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      },
      error: (error) => {
        console.error('Error al obtener el documento:', error);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pdfUrlTramite) {
      const unsafeUrl = this.pdfUrlTramite as unknown as string; // Convertir de SafeResourceUrl a string
      URL.revokeObjectURL(unsafeUrl);
    }
  }

}
