import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { AlertaData } from '@core/interfaces/comunes/alert';
import { AlertaService } from '@core/services/shared/alerta.service';
import { Alerta } from '@interfaces/comunes/alerta';
import { Carousel, CarouselModule } from 'primeng/carousel';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { Router } from '@angular/router';
import {textoTiempoSegundos} from "@pipes/tiempo.pipe";
import {MenuItem} from "primeng/api";

@Component({
  standalone: true,
  selector: 'app-alerta-static',
  templateUrl: './alerta-static.component.html',
  styleUrls: ['./alerta-static.component.scss'],
  imports: [CommonModule, MenuModule, CarouselModule, textoTiempoSegundos],
  providers: [DialogService],
})
export class AlertaStaticComponent {
  @ViewChild('carousel') carousel!: Carousel;
  @Input() listaAletasUrgentes: Alerta[] = [];
  protected currentPage: number = 0;
  protected items: (data: any) => MenuItem[];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private alertaService: AlertaService
  ) {
    this.items = (data: any) => [
      {
        label: '',
        icon: '',
        items: [
          {
            label: 'Marcar como solucionada',
            icon: '',
            command: (item) => {
              const ref = this.dialogService.open(AlertaModalComponent, {
                width: '600px',
                showHeader: false,
                data: {
                  icon: 'warning',
                  title: `Confirma solucionar la alerta?`,
                  description: ``,
                  confirmButtonText: 'Confirmar',
                  confirm: true,
                },
              });
              ref.onClose.subscribe({
                next: (resp) => {
                  if (resp === 'confirm') {
                    this.retirarAlerta(data);
                  }
                },
              });
            },
          },
        ],
      },
    ];
  }

  prev(event: any) {
    console.log('event', event);
    this.carousel.navBackward(event); // Moves to the previous slide
  }

  next(event: any) {
    console.log('event', event);
    this.carousel.navForward(event); // Moves to the next slide
  }

  /**
   * Maneja el evento de cambio de página.
   *
   * @param {any} event - El objeto de evento que contiene el nuevo número de página.
   * @return {void}
   */
  onPageChange(event: any) {
    this.currentPage = event.page;
  }

  /**
   * Soluciona una alerta utilizando el servicio de alertas.
   *
   * @param {Alerta} alerta - La alerta que se va a solucionar.
   * @return {void}
   */
  private retirarAlerta(alerta: Alerta) {
    this.alertaService.solucionarAlerta(alerta).subscribe({
      next: (resp) => {
        this.listaAletasUrgentes = this.listaAletasUrgentes.filter(
          (data) => data.id !== alerta.id
        );
        console.log('resp', resp);
      },
      error: (err) => {
        console.log('err', err);
      },
    });
  }

  protected eventoSolucionarAlerta(alerta: Alerta) {
    console.log(alerta);
    if (alerta.url && alerta.url.length > 0) {
      window.location.href = alerta.url;
    } else {
    }
  }
}
