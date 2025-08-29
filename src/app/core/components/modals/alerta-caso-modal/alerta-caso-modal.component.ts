import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, OnChanges, OnDestroy, OnInit, SimpleChanges,} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {Tab} from '@interfaces/comunes/tab';
import {ReusablesAlertas} from '@services/reusables/reusable-alertas.service';
import {TabsViewComponent} from '@components/tabs-view/tabs-view.component';
import {ALERTAS} from 'ngx-cfng-core-lib';
import {tiempoSegundos} from '@pipes/tiempo.pipe';
import {MenuItem} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {CheckboxModule} from 'primeng/checkbox';
import {DropdownModule} from 'primeng/dropdown';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MenuModule} from 'primeng/menu';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TabViewModule} from 'primeng/tabview';
import {Subscription} from 'rxjs';
import {EncabezadoModalComponent} from '../encabezado-modal/encabezado-modal.component';

@Component({
  standalone: true,
  selector: 'alerta-caso-modal',
  templateUrl: './alerta-caso-modal.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    EncabezadoModalComponent,
    CheckboxModule,
    tiempoSegundos,
    CommonModule,
    ButtonModule,
    CalendarModule,
    RadioButtonModule,
    TabsViewComponent,
    TabViewModule,
    MenuModule,
  ],
})
export class AlertaCasoModalComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  public razon = new FormControl('', [Validators.required]);

  public itemTipoAlerta;

  public subscriptions: Subscription[] = [];
  public listaTipoAlerta = ['Plazos', 'Genericas'];
  public nombreAlerta: String = '';
  public tabs: Tab[] = [
    {
      titulo: 'Pendientes',
      ancho: 210,
    },
    {
      titulo: 'Solucionadas',
      ancho: 210,
    },
  ];
  public indexActivo: number = 0;

  items!: (data: any) => MenuItem[];

  constructor(
    public referenciaModal: DynamicDialogRef,
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,

    private reusablesAlertas: ReusablesAlertas
  ) {
    this.itemTipoAlerta = this.config.data.tipoAlerta;
  }
  ngAfterViewInit(): void {}

  bandejaPLazosPendiente: any = [];
  bandejaPLazosSolucionadas: any = [];
  bandejaGenericasPendiente: any = [];
  bandejaGenericasSolucionadas: any = [];
  async ngOnInit() {
    this.items = () => [
      {
        label: 'Marcar como solucionada',
        icon: '',
        command: () => {
          console.log('se soluciono');
        },
      },
    ];

    this.nombreAlerta = this.listaTipoAlerta[this.itemTipoAlerta];
    this.bandejaPLazosPendiente = await this.bandejaAlertas(
      ALERTAS.BANDEJA_PLAZOS,
      ALERTAS.BANDEJA_PENDIENTE
    );
    this.bandejaPLazosSolucionadas = await this.bandejaAlertas(
      ALERTAS.BANDEJA_PLAZOS,
      ALERTAS.BANDEJA_SOLUCIONADO
    );

    this.bandejaGenericasPendiente = await this.bandejaAlertas(
      ALERTAS.BANDEJA_GENERICAS,
      ALERTAS.BANDEJA_PENDIENTE
    );
    this.bandejaGenericasSolucionadas = await this.bandejaAlertas(
      ALERTAS.BANDEJA_GENERICAS,
      ALERTAS.BANDEJA_SOLUCIONADO
    );
  }

  getLabelById(value: any, list: any[]): string {
    const selectedItem = list.find((item) => item.value === value);
    return selectedItem ? selectedItem.label : '';
  }

  bandejaAlertas(bandeja: any, estado: any) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.reusablesAlertas.obtenerAlertas(bandeja, estado).subscribe({
          next: (resp) => {
            console.log('nro registros');
            let data = resp.data;
            var nueva_data: any = [];
            let cont = 0;
            if (data.length > ALERTAS.NUMERO_REGISTROS) {
              data.forEach((x: any) => {
                if (cont < ALERTAS.NUMERO_REGISTROS) {
                  nueva_data.push(x);
                }
                if (cont == ALERTAS.NUMERO_REGISTROS) {
                  resolve(nueva_data);
                }
                cont += 1;
              });
            } else {
              resolve(resp.data);
            }
          },
        })
      );
    });
  }

  ngOnChanges(changes: SimpleChanges) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  close() {
    this.dialogRef.close();
  }
}
