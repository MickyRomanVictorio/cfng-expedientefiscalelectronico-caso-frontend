import { Nullable } from 'primeng/ts-helpers';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { obtenerIcono } from '@utils/icon';
import { SujetoQueja } from '@interfaces/provincial/tramites/comun/cuadernos-incidentales/queja-denegatoria-apelacion/sujeto-queja.interface';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
//import {RSP_1ERA_INSTANCIA} from 'ngx-cfng-core-lib';
import { PaginacionInterface } from '@interfaces/comunes/paginacion.interface';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DomSanitizer } from '@angular/platform-browser';
import { TokenService } from '@services/shared/token.service';
import { RespuestaRecursoApelacionEnum } from '@modules/provincial/tramites/cuaderno-incidental/respuesta-recurso-apelacion.enum';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sujetos-queja-modal',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    PaginatorComponent,
    SharedModule,
    TableModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './sujetos-queja-modal.component.html',
  styleUrls: ['./sujetos-queja-modal.component.scss'],
})
export class SujetosQuejaModalComponent implements OnInit {
  protected coCaso: string;
  protected sujetosQueja: SujetoQueja[] = [];
  protected sujetosSeleccionados: SujetoQueja[] = [];
  protected query: any = { limit: 10, page: 1, where: {} };
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected resetPage: boolean = false;
  protected listaRespuesta: { id: number; nombre: string }[] = [
    { id: 1502, nombre: 'Nulidad' },
    { id: 1503, nombre: 'Revoca' },
  ];
  protected readonly obtenerIcono = obtenerIcono;
  protected soloLectura: boolean = false;
  protected misApelaciones: number = 0;
  protected mostrarBtnAceptar: boolean = false;
  private idActoTramiteCaso: string = '0';
  protected todosSeleccionados: boolean = false;
  constructor(
    private tokenService: TokenService,
    private referenciaModal: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private sanitizer: DomSanitizer
  ) {
    this.coCaso = this.config.data.coCaso;
    this.idActoTramiteCaso = this.config.data.idActoTramiteCaso;
    this.sujetosQueja = this.config.data.sujetosQueja.sort((a: any, b: any) => {
      const getPriority = (item: any) => {
        if (item.idRespuestaInstancia === 1024 && item.flApelacionFiscal === true) return 1;
         if (item.flApelacionFiscal === false && item.idRespuestaInstancia == 1024) return 2;
        if (item.flApelacionFiscal === true && item.idRespuestaInstancia !== 1024) return 3;
        if (item.flApelacionFiscal === false && item.idRespuestaInstancia !== 1024) return 4;
        return 5;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      // Si tienen la misma prioridad, mantener el orden original
      return 0;

    });
    console.log('Sujetos queja:', this.sujetosQueja);

  }

  ngOnInit(): void {
    this.evaluarSujetos();
    this.iniciaPaginacion();
    if (this.config.data?.soloLectura) {
      this.soloLectura = true;
    }
    this.verificarCheckPadre();
  }

  private evaluarSujetos() {
    this.misApelaciones = this.sujetosQueja.filter(
      (sujeto: any) => sujeto.flApelacionFiscal
    ).length;
    this.sujetosSeleccionados = this.sujetosQueja.filter(
      (sujeto: SujetoQueja) => sujeto.estadoQueja == '1'
    );
  }

  get tieneSujetosSeleccionados(): boolean {
    return this.sujetosSeleccionados.length > 0;
  }

  protected verCheckbox(sujeto: SujetoQueja): boolean {
    if (sujeto.idActoTramiteCasoGuardado) {
      return (
        sujeto.idRespuestaInstancia ===
        RespuestaRecursoApelacionEnum.DENIEGA_APELACION &&
        sujeto.idActoTramiteCasoGuardado == this.idActoTramiteCaso
      );
    }
    return (
      sujeto.idRespuestaInstancia ===
      RespuestaRecursoApelacionEnum.DENIEGA_APELACION &&
      !sujeto.flConsentidoInstancia1
    );
  }

  protected esMiApelacion(sujeto: SujetoQueja): boolean {
    return (
      sujeto.usuarioApelacion === this.tokenService.getDecoded().usuario.usuario
    );
  }

  protected aceptar() {
    this.sujetosSeleccionados = this.sujetosSeleccionados.filter(
      (sujeto) => sujeto.estadoQueja === '1' && sujeto.idPetitorioQueja !== 0
    );
    console.log('Sujetos seleccionados:', this.sujetosSeleccionados);

    this.referenciaModal.close(this.sujetosSeleccionados);
  }

  iniciaPaginacion() {
    this.itemPaginado.data.data = this.sujetosQueja;
    this.itemPaginado.data.total = this.sujetosQueja.length;
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosQueja = data.slice(start, end);
  }

  protected formatearCodigoCaso(codigoCaso: string) {
    if (!codigoCaso) return '';
    codigoCaso = `${codigoCaso}-0`;
    const partes = codigoCaso.split('-');
    if (partes.length > 3) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `${partes[0]}-<span style="color:orange" >${partes[1]}-${partes[2]}</span>-${partes[3]}`
      );
    }
    return codigoCaso;
  }

  protected cerrarModal(): void {
    this.referenciaModal.close(this.sujetosSeleccionados);
  }
  onCheckboxChange(rowIndex: number, event: any) {
    const checkbox = event.target as HTMLInputElement;
    this.sujetosQueja[rowIndex].estadoQueja = checkbox.checked ? '1' : '0';
    if (!checkbox.checked) {
      this.sujetosQueja[rowIndex].idPetitorioQueja = 0;
    }
    this.verificarElementos();
  }
  onCheckboxPadreChange(event: any) {
    if (this.soloLectura) return;
    const checkbox = event.target as HTMLInputElement;
    this.sujetosSeleccionados = this.sujetosQueja.map((sujeto) => {
      if (sujeto.idRespuestaInstancia == 1024) {
        return {
          ...sujeto,
          estadoQueja: checkbox.checked ? '1' : '0',
          idPetitorioQueja: 0,
        };
      } else {
        return { ...sujeto };
      }
    });
    this.sujetosQueja = this.sujetosQueja.map((sujeto) => {
      if (sujeto.idRespuestaInstancia == 1024) {
        return {
          ...sujeto,
          estadoQueja: checkbox.checked ? '1' : '0',
          idPetitorioQueja: 0,
        };
      } else {
        return { ...sujeto };
      }
    });
    console.log('onCheckboxPadreChange', this.sujetosSeleccionados);
    this.verificarElementos();
  }
  onSelectionPetitorio(item: any, event: any): void {
    this.sujetosSeleccionados = this.sujetosQueja.map((sujeto) => {
      if (sujeto.idSujetoCaso === item.idSujetoCaso &&
        (!item.hasOwnProperty('idActoTramiteResultadoSujeto') || item.idActoTramiteResultadoSujeto === "" || sujeto.idActoTramiteResultadoSujeto === item.idActoTramiteResultadoSujeto)
      ) {
        sujeto.idPetitorioQueja = event.value ? item.idPetitorioQueja : 0;
      }
      return sujeto;
    });
    this.verificarElementos();
  }
  verificarElementos() {
    const totalSeleccionados = this.sujetosSeleccionados.length;
    const ccc = this.sujetosSeleccionados.filter(
      (sujeto) => sujeto.estadoQueja === '1'
    );
    if (ccc.length > 0) {
      this.todosSeleccionados = ccc.length === totalSeleccionados;
      this.mostrarBtnAceptar = ccc.every(
        (sujeto) => sujeto.idPetitorioQueja && sujeto.idPetitorioQueja !== 0
      );
      this.sujetosSeleccionados
        .filter((sujeto) => sujeto.estadoQueja === '1')
        .every(
          (sujeto) => sujeto.idPetitorioQueja && sujeto.idPetitorioQueja !== 0
        );
    } else {
      this.mostrarBtnAceptar = false;
    }
    if (this.soloLectura) {
      this.mostrarBtnAceptar = false;
    }
  }
  verificarCheckPadre() {
    const totalSeleccionados = this.sujetosSeleccionados.length;
    const ccc = this.sujetosSeleccionados.filter(
      (sujeto) => sujeto.estadoQueja === '1'
    );
    if (ccc.length > 0) {
      this.todosSeleccionados = ccc.length === totalSeleccionados;
    }
  }
}
