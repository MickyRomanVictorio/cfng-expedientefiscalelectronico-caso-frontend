import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertaModalComponent } from '@core/components/modals/alerta-modal/alerta-modal.component';
import { Alerta } from '@core/interfaces/comunes/alerta';
import { AlertaService } from '@core/services/shared/alerta.service';
import { NgxCfngCoreLayoutHeaderComponent } from '@ngx-cfng-core-layout/header';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'ngx-cfng-core-lib';
import {textoTiempoSegundos, tiempoSegundos} from '@pipes/tiempo.pipe';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { TabMenuModule } from 'primeng/tabmenu';
import {DOMAIN_ASSETS} from "@environments/environment";
import {NgIf} from "@angular/common";

enum estadoAlertaPlazoEnum {
  PENDIENTES = 'Pendientes',
  SOLUCIONADAS = 'Solucionadas',
}

@Component({
  selector: 'app-alerta-generica',
  standalone: true,
  imports: [Button, TabMenuModule, MenuModule, CmpLibModule, tiempoSegundos, textoTiempoSegundos, NgIf],
  templateUrl: './alerta-generica.component.html',
  styleUrl: './alerta-generica.component.scss',
  providers: [DialogService],
})
export class AlertaGenericaComponent implements OnInit {
  @Input()
  public eventoCerrar!: () => void;
  @Input()
  public listaAlertasGenericaPorAtender: Alerta[] = [];
  @Input()
  public listaAlertasGenericaAtendidos: Alerta[] = [];

  @ViewChild(NgxCfngCoreLayoutHeaderComponent)
  protected ngxCfngCoreLayoutHeaderComponent!: NgxCfngCoreLayoutHeaderComponent;

  protected menuItemsAlertasPlazos: MenuItem[];
  protected activeItemAlertaPlazo: MenuItem;
  protected items: (data: any) => MenuItem[];
  protected estadoAlertaPlazoEnum = estadoAlertaPlazoEnum;

  constructor(
    private router: Router,
    protected iconUtil: IconUtil,
    private dialogService: DialogService,
    private alertaService: AlertaService
  ) {
    this.menuItemsAlertasPlazos = [
      { label: estadoAlertaPlazoEnum.PENDIENTES },
      { label: estadoAlertaPlazoEnum.SOLUCIONADAS },
    ];
    this.activeItemAlertaPlazo = this.menuItemsAlertasPlazos[0];

    this.items = (data: any) => [
      {
        label: 'Opciones',
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
                    data.estado = 'SOLUCIONADO';
                    this.actualizarAlertas(data);
                  }
                },
              });
            },
          },
        ],
        // command: () => {
        //   alert();
        //   const ref = this.dialogService.open(AlertaModalComponent, {
        //     width: '600px',
        //     showHeader: false,
        //     data: {
        //       icon: 'warning',
        //       title: `Confirma solucionar la alerta?`,
        //       description: ``,
        //       confirmButtonText: 'Confirmar',
        //       confirm: true,
        //     },
        //   });
        //   ref.onClose.subscribe({
        //     next: (resp) => {
        //       if (resp === 'confirm') {
        //         data.estado = 'SOLUCIONADO';
        //         this.actualizarAlertas(data);
        //       }
        //     },
        //   });
        // },
      },
    ];
  }

  ngOnInit() {}

  protected onActiveItemAlertaPlazoChange(event: MenuItem) {
    this.activeItemAlertaPlazo = event;
  }

  protected verAlertas() {
    this.router.navigate(['app/bandeja-alertas'], { queryParams: { 'tipo-alerta': '1' } }).then(() => {
      window.location.reload();
    });
  }

  protected eventoCerrarModal() {
    if (this.eventoCerrar) this.eventoCerrar();
  }
  private actualizarAlertas(alerta: Alerta) {
    this.alertaService.actualizarAlerta(alerta).subscribe({
      next: (data) => {
        this.listaAlertasGenericaAtendidos.push(this.listaAlertasGenericaPorAtender.filter(
          (alerta) => alerta.id === data.id
        )[0]);
        this.listaAlertasGenericaAtendidos.sort((a, b) => {
          const fechaA = new Date(a.fechaCreacion).getTime();
          const fechaB = new Date(b.fechaCreacion).getTime();
          return fechaB - fechaA;
        });
        this.listaAlertasGenericaPorAtender = this.listaAlertasGenericaPorAtender.filter(
          (alerta) => alerta.id !== data.id
        );
        console.log('Alerta actualizada con éxito:', data);
      },
      error: (err) => console.error('Error al actualizar la alerta:', err),
    });
  }

  async irAlerta(tipoAlerta: any, alerta: any) {
    if(alerta.tipo && alerta.tipo === 'INFORMATIVA'){
      this.actualizarAlertas(alerta);
    }
    if (alerta.url && alerta.url.length > 0) {
      await this.router.navigate([alerta.url]);
      window.location.reload();
    } else {
    }
  }


  presionado() {
    alert();
  }

  protected readonly DOMAIN_ASSETS = DOMAIN_ASSETS;
}
