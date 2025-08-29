import { CommonModule, DatePipe, NgClass, NgIf, TitleCasePipe } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Tab } from '@interfaces/comunes/tab'
import { DerivacionesEnviadosService } from '@services/provincial/bandeja-derivaciones/enviados/DerivacionesEnviadosService'
import { EnviadosFiltroRequest } from '@services/provincial/bandeja-derivaciones/enviados/EnviadosFiltroRequest'
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component'
import { DateMaskModule } from '@directives/date-mask.module'
import { obtenerIcono } from '@utils/icon'
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib"
import { MenuItem } from 'primeng/api'
import { CalendarModule } from 'primeng/calendar'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { RadioButtonModule } from 'primeng/radiobutton'
import { TabMenuModule } from 'primeng/tabmenu'
import { TabViewModule } from 'primeng/tabview'
import { Subscription } from 'rxjs'
import { AcumuladoAceptadosFiltroComponent } from "@modules/provincial/administracion-casos/bandeja-derivaciones/enviados/acumulado-aceptados-filtro/acumulado-aceptados-filtro.component"
import AcumuladoAceptadosComponent from "@modules/provincial/administracion-casos/bandeja-derivaciones/enviados/acumulado-aceptados/acumulado-aceptados.component"
import { BandejaDerivacionesAcumuladas } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-aceptados/AcumuladoAceptados'

@Component({
  standalone: true,
  imports: [CommonModule,
    TabViewModule,
    TabMenuModule,
    CmpLibModule,
    TabsViewComponent,
    CalendarModule,
    CmpLibModule,
    DateMaskModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    RadioButtonModule,
    AcumuladoAceptadosComponent,
    AcumuladoAceptadosFiltroComponent,
  ],
  selector: 'app-bandeja-derivaciones-enviados',
  templateUrl: './bandeja-derivaciones-enviados.component.html',
  styleUrls: ['./bandeja-derivaciones-enviados.component.scss'],
  providers: [DatePipe, TitleCasePipe],
})

export class BandejaDerivacionesEnviadosComponent implements OnInit {

  private readonly fb = inject(FormBuilder)
  private readonly datePipe = inject(DatePipe)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly enviadosService = inject(DerivacionesEnviadosService)

  protected derivacionesEnviadasList: BandejaDerivacionesAcumuladas[] = []
  protected formularioFiltrarDerivaciones!: FormGroup
  protected mostrarFiltros = false
  protected subscriptions: Subscription[] = []
  private readonly today = new Date()

  protected showFilterDate: boolean = true
  protected filterDateLabel: string = ''
  protected filterTipoDateLabel: string = ''
  protected readonly itemsDerivados: MenuItem[] | undefined = [
    {
      label: "Por revisar",
      routerLink: `derivado-a/derivado-por-revisar`,
    },
    {
      label: "Aceptados",
      routerLink: 'derivado-a/derivado-aceptados',
    },
    {
      label: "Devueltos",
      routerLink: `derivado-a/derivado-devueltos`,
    },
    {
      label: "Revertidos",
      routerLink: `derivado-a/derivado-revertidos`,
    }
  ]
  protected readonly itemsAcumulados: MenuItem[] | undefined = [
    {
      label: "Por revisar",
      routerLink: `acumulado-a/acumulado-por-revisar`,
    },
    {
      label: "Aceptados",
      routerLink: `acumulado-a/acumulado-aceptados`,
    },
    {
      label: "Devueltos",
      routerLink: `acumulado-a/acumulado-devueltos`,
    },
    {
      label: "Revertidos",
      routerLink: `acumulado-a/acumulado-revertidos`,
    }
  ]
  protected readonly  tabs: Tab[] = [
    {
      titulo: 'Derivado a',
      ancho: 220,
      rutaPadre: 'derivado-a',
      rutasHijas: 'derivado-por-revisar,derivado-aceptados,derivado-devueltos,derivado-revertidos',
    },
    {
      titulo: 'Acumulado a',
      ancho: 220,
      rutaPadre: 'acumulado-a',
      rutasHijas: 'acumulado-por-revisar,acumulado-aceptados,acumulado-devueltos,acumulado-revertidos',
    }
  ]
  protected tabActivo: number = 0
  protected activeItem: MenuItem | undefined

  constructor() {
    this.tabActivo = this.router.url.includes('acumulado-a') ? 1 : 0
  }

  ngOnInit(): void {

    this.formBuild()

    this.buscar()

  }

  cambiarTab(indiceTab: number) {

    this.tabActivo = indiceTab

    if (indiceTab == 0) {
      this.router.navigate(['derivado-a/derivado-por-revisar'], { relativeTo: this.route })
    }

    if (indiceTab == 1) {
      this.router.navigate(['acumulado-a/acumulado-por-revisar'], { relativeTo: this.route })
    }

    const event = { label: 'Por revisar' }

    this.changeTab(event)

  }


  private formBuild(): void {
    let fechaHasta = this.today
    let fechaDesde = new Date(fechaHasta)
    fechaDesde.setDate(fechaHasta.getDate() - 30)
    this.showFilterDate = false
    this.filterDateLabel = 'Fecha de derivación'
    this.formularioFiltrarDerivaciones = this.fb.group({
      buscar: [''],
      tipoFecha: ['1'],
      fechaDesde: [fechaDesde],
      fechaHasta: [fechaHasta]
    })
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros
  }

  public buscar() {
    const form = this.formularioFiltrarDerivaciones.getRawValue()
    const request: EnviadosFiltroRequest = {
      tipoFecha: form.tipoFecha,
      fechaDesde: form.fechaDesde ? this.datePipe.transform(form.fechaDesde, 'dd/MM/yyyy') : null,
      fechaHasta: form.fechaHasta ? this.datePipe.transform(form.fechaHasta, 'dd/MM/yyyy') : null,
    }
    this.enviadosService.enviarFiltroRequest(request)
  }

  buscarSegunTexto() {
    const texto = this.formularioFiltrarDerivaciones.get('buscar')!.value
    this.enviadosService.enviarTextoBuscado(texto)
  }

  navegar(event: any) {
    if (event.item.routerLink) {
      console.log(event.item.routerLink)
      this.router.navigate(event.item.routerLink)
    }
  }

  changeTab(event: any) {
    if (event.label === 'Por revisar') {
      this.showFilterDate = false
      this.filterDateLabel = 'Fecha de derivación'
      this.formularioFiltrarDerivaciones.patchValue({
        tipoFecha: '1'  // Valor para el primer tab (puedes ajustarlo según tu lógica)
      })
    } else {
      if (event.label === 'Aceptados') {
        this.filterTipoDateLabel = 'Fecha de aceptación'
      }
      if (event.label === 'Devueltos') {
        this.filterTipoDateLabel = 'Fecha de devolución'
      }
      if (event.label === 'Revertidos') {
        this.filterTipoDateLabel = 'Fecha de reversión'

      }
      this.showFilterDate = true
      this.filterDateLabel = 'Fecha:'
    }
  }

}
