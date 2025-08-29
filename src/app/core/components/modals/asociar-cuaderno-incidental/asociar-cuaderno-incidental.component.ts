import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { IconUtil, IconAsset, StringUtil } from 'ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { AlertaData } from '@core/interfaces/comunes/alert';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { CuadernoIncidentalResponse } from '@core/interfaces/provincial/documentos-ingresados/CuadernoIncidental';
import { AtenderDocumentosService } from '@core/services/provincial/documentos-ingresados/atender-documentos.service';
import { Subscription } from 'rxjs';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-asociar-cuaderno-incidental',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './asociar-cuaderno-incidental.component.html',
  styleUrl: './asociar-cuaderno-incidental.component.scss',
})
export class AsociarCuadernoIncidentalComponent implements OnInit {
  protected subscriptions: Subscription[] = [];
  protected tipoAccion: string = 'R'; //R: REGISTRAR , E: EDITAR
  protected idCaso: string  = '';
  protected nombreTramite: string | null = null;
  protected nombreCuaderno: string | null = null;
  protected tipoCuaderno: string = ''; 
  protected listaCuadernosInicidentales: CuadernoIncidentalResponse[] = [];
  protected cuadernoAsociado: CuadernoIncidentalResponse | null = null;
  protected cuadernoAsociadoInicial: CuadernoIncidentalResponse | null = null;
  protected tipo: number = 1; //1: CUADERNO , 2: PESTANIA

  constructor(
    private ref: DynamicDialogRef,
    private dialogConfig: DynamicDialogConfig,
    protected iconUtil: IconUtil,
    protected iconAsset: IconAsset,
    protected stringUtil: StringUtil,
    private dialogService: DialogService,
    private dialogModalService: NgxCfngCoreModalDialogService,
    private atenderDocumentoService: AtenderDocumentosService
  ) {
    this.nombreTramite = this.dialogConfig.data!.nombreTramite;
    this.nombreCuaderno = this.dialogConfig.data!.nombreCuaderno;
    this.tipoCuaderno = this.dialogConfig.data!.tipoCuaderno;
    this.tipoAccion = this.dialogConfig.data!.tipoAccion;
    this.cuadernoAsociadoInicial = this.dialogConfig.data!.codigoCasoCuaderno;
    this.idCaso = this.dialogConfig.data!.idCaso;
    this.tipo =  this.dialogConfig.data!.tipo;
  }

  ngOnInit(): void {
    if (this.tipoAccion === 'E') {
      this.cuadernoAsociado = this.cuadernoAsociadoInicial;
    }

    if (this.tipo === 1) {
      this.listarCuadernos();
    } else {
      this.listarPestaniasApelacion();
    }
  }

  protected listarCuadernos() {
    this.subscriptions.push(
      this.atenderDocumentoService
        .listarCuadernosIncidentales(this.idCaso, this.tipoCuaderno)
        .subscribe({
          next: (resp) => {
            this.listaCuadernosInicidentales = resp;
          },
        })
    );
  }

  protected listarPestaniasApelacion() {
    this.subscriptions.push(
      this.atenderDocumentoService
        .listarPestaniasApelaciones(this.idCaso)
        .subscribe({
          next: (resp) => {
            this.listaCuadernosInicidentales = resp;
          },
        })
    );
  }

  protected obtenerNumeroCaso(numeroCaso: string): string {
    return this.stringUtil.obtenerNumeroCaso(numeroCaso);
  }

  protected cerrarModal() {
    this.ref.close(null);
  }

  protected nuevoCuaderno() {}

  protected asociar() {
    if (this.cuadernoAsociado === null) {
      this.dialogModalService.error(
        'Validación Incorrecta',
        'Debe seleccionar un cuaderno incidental para continuar',
        'Ok'
      );
      return;
    }

    if (
      this.tipoAccion === 'E' &&
      this.cuadernoAsociado === this.cuadernoAsociadoInicial
    ) {
      this.dialogModalService.error(
        'Validación Incorrecta',
        'No se selecciono un cuaderno distinito para actualizar',
        'Ok'
      );
      return;
    }

    const alert = this.dialogService.open(AlertaModalComponent, {
      width: '500px',
      showHeader: false,
      data: {
        ocultarCierre: true,
        icon: 'success',
        title:
          this.tipoAccion === 'E'
            ? 'Asociación actualizada'
            : 'Trámite asociado correctamente',
        description:
          this.tipoAccion === 'E'
            ? 'Se actualizó la asociación correctamente del trámite <strong>' +
              this.nombreTramite +
              '</strong> al cuaderno <strong>' +
              this.nombreCuaderno +
              '</strong>'
            : 'Se asoció correctamente el trámite <strong>' +
              this.nombreTramite +
              '</strong> al cuaderno <strong>' +
              this.nombreCuaderno +
              '</strong>',
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
    alert.onClose.subscribe({
      next: () => {
        this.cuadernoAsociado!.tipo = this.tipo;
        this.ref.close(this.cuadernoAsociado);
      },
      error: (error) => console.error(error),
    });
  }
}
