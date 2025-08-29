import { Component, inject, input, InputSignal, OnDestroy, OnInit, output } from '@angular/core'
import { DialogService } from 'primeng/dynamicdialog'
import { ModalAsociarSujetosDelitosComponent } from './modal-asociar-sujetos-delitos/modal-asociar-sujetos-delitos.component'
import { Subscription } from 'rxjs'
import { AsociarSujetosDelitosService } from '@core/services/reusables/efe/asociar-sujetos-delitos/asociar-sujetos-delitos.service'
import { CmpLibModule } from 'dist/cmp-lib'
import { IconAsset } from 'dist/ngx-cfng-core-lib'

@Component({
  selector: 'app-asociar-sujetos-delitos',
  standalone: true,
  imports: [
    ModalAsociarSujetosDelitosComponent,
    CmpLibModule,
  ],
  templateUrl: './asociar-sujetos-delitos.component.html',
  styleUrl: './asociar-sujetos-delitos.component.scss',
  providers: [
    DialogService
  ]
})
export class AsociarSujetosDelitosComponent implements OnInit, OnDestroy {

  public idActoTramiteCaso: InputSignal<string> = input.required<string>()
  public etapa: InputSignal<string> = input.required<string>()
  public modoLectura: InputSignal<boolean> = input.required<boolean>()
  public seHanRegistradoAsociaciones = output<boolean>()
  
  private readonly dialogService = inject(DialogService)
  protected readonly iconAsset = inject(IconAsset)
  private readonly asociarSujetosDelitosService = inject(AsociarSujetosDelitosService)

  protected existenRegistrosDeAsociacion: boolean = false
  private readonly suscripciones: Subscription[] = []

  ngOnInit(): void {
    this.validarSiExistenRegistrosDeAsociacion()
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach( suscripcion => suscripcion.unsubscribe())
  }

  protected abrirModalAsociarSujetosDelitos(): void {
    const asociarDelitosRef = this.dialogService.open(ModalAsociarSujetosDelitosComponent, {
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        idActoTramiteCaso: this.idActoTramiteCaso(),
        etapa: this.etapa(),
        modoLectura: this.modoLectura()
      },
    })
    asociarDelitosRef.onClose.subscribe({
      next: () => {
        this.validarSiExistenRegistrosDeAsociacion()
      },
    })
  }

  private validarSiExistenRegistrosDeAsociacion(): void {
    this.suscripciones.push(
      this.asociarSujetosDelitosService.validarAsociacionSujetosDelitos(this.idActoTramiteCaso())
      .subscribe({
        next: () => {
          this.existenRegistrosDeAsociacion = true
          this.seHanRegistradoAsociaciones.emit(true)
        },
        error: () => {
          this.existenRegistrosDeAsociacion = false
          this.seHanRegistradoAsociaciones.emit(false)
        }
      })
    )
  }

}