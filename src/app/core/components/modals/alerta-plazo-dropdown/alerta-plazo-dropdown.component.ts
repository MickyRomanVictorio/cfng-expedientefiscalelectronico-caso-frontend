import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Alerta
} from '@interfaces/comunes/alerta';
import { AlertaService } from '@services/shared/alerta.service';
import { tiempoSegundos } from '@pipes/tiempo.pipe';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { TabMenuModule } from 'primeng/tabmenu';
import { Subscription } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';

@Component({
  standalone: true,
  selector: 'app-alerta-plazo-dropdown',
  templateUrl: './alerta-plazo-dropdown.component.html',
  styleUrls: ['./alerta-plazo-dropdown.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    tiempoSegundos,
    TabMenuModule,
    MenuModule,
  ],
  providers: [DialogService],
})
export class AlertaPlazoDropdownComponent implements OnInit {
  @Input() isActiveMenuAlertasPlazos: Boolean = false;

  @Input() listaAlertasPendientes: Alerta[] = [];
  @Input() listaAlertasSolucionadas: Alerta[] = [];

  @Output() onActiveMenu = new EventEmitter<Boolean>();

  menuItemsAlertasPlazos: MenuItem[] | undefined;
  activeItemAlertaPlazo!: MenuItem;

  items: (data: Alerta) => MenuItem[] = (data: Alerta) => [];
  public subscriptions: Subscription[] = [];
  public obtenerIcono = obtenerIcono;

  constructor(
    private router: Router,
    public dialogService: DialogService,
    private sppiner: NgxSpinnerService,
    private alertaService: AlertaService
  ) {}

  ngOnInit() {
    this.menuItemsAlertasPlazos = [
      { label: 'Pendientes' },
      { label: 'Solucionadas' },
    ];
    this.activeItemAlertaPlazo = this.menuItemsAlertasPlazos[0];

    this.items = (data: Alerta) => [
      {
        label: 'Marcar como solucionada',
        icon: '',
        command: () => {
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
    ];
  }

  actualizarAlertas(alerta: Alerta) {
    this.sppiner.show();
    this.subscriptions.push(
      this.alertaService.actualizarAlerta(alerta).subscribe(
        (respuesta) => {
          this.sppiner.hide();
          console.log('Alerta actualizada con éxito:', respuesta);
        },
        (error) => {
          this.sppiner.hide();
          console.error('Error al actualizar la alerta:', error);
        }
      )
    );
  }

  async irAlerta(tipoAlerta: any, registro: any) {
    console.log(registro);
    if (registro.url && registro.url.length > 0) {
      await this.router.navigate([registro.url]);
    } else {
    }
  }

  onActiveItemAlertaPlazoChange(event: MenuItem) {
    this.activeItemAlertaPlazo = event;
  }

  closeMenuAlertas() {
    this.isActiveMenuAlertasPlazos = false;
    this.onActiveMenu.emit(false);
  }

  verAlertas() {
    this.closeMenuAlertas();
    this.router.navigate(['app/bandeja-alertas']).then(() => {
      window.location.reload();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
