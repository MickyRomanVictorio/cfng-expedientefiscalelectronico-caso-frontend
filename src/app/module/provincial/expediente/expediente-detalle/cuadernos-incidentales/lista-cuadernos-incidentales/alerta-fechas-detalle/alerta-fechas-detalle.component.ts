import { Component, OnDestroy, OnInit } from '@angular/core'
import { TableModule } from 'primeng/table'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { IconUtil, IconAsset } from 'ngx-cfng-core-lib'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { CuadernosIncidentalesService } from '@services/provincial/cuadernos-incidentales/cuadernos-incidentales.service'
import { CuadernoIncidental, TipoAlerta } from '@core/interfaces/provincial/cuaderno-incidental/cuaderno-incidental.interface'

@Component({
  selector: 'app-fechas-detalle',
  standalone: true,
  imports: [
    CmpLibModule,
    TableModule,
  ],
  templateUrl: './alerta-fechas-detalle.component.html',
  styleUrls: ['./alerta-fechas-detalle.component.scss']
})
export class AlertaFechasDetalleComponent implements OnInit, OnDestroy {

  protected datosEntrada:DatosEntrada
  protected listaImputados:Imputado[] = []
  protected iconoRelojSvg:SafeHtml | null = null
  private cronometroTiempo:ReturnType<typeof setInterval> | undefined  = undefined
  protected TipoAlertaEnum = TipoAlerta
  protected paginacionFilas = 10
  private paginacion = {
    first: 0,
    rows:this.paginacionFilas
  }

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly cuadernosIncidentalesService: CuadernosIncidentalesService,
    private readonly iconAsset: IconAsset,
    protected iconUtil: IconUtil
  ){
    this.datosEntrada = this.dynamicDialogConfig.data as DatosEntrada
  }

  ngOnInit(): void {
    this.iconoRelojPersonalizar()
    this.inicioDatos()
  }

  private inicioDatos(){
    let idTramite:string = ''
    if(this.datosEntrada.tipoAlerta === TipoAlerta.Apelacion){
      idTramite = this.datosEntrada.cuadernoIncidental.flagApelacion
    }else if(this.datosEntrada.tipoAlerta === TipoAlerta.Queja){
      idTramite = this.datosEntrada.cuadernoIncidental.flagQueja
    }
    this.cuadernosIncidentalesService.alertaFechaDetalle(this.datosEntrada.cuadernoIncidental.idCaso, idTramite).subscribe({
      next:(rs)=>{
        this.listaImputados = rs
        this.cronometro()
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }

  private iconoRelojPersonalizar(){
    fetch(this.iconAsset.obtenerRutaIcono('icon_clock').toString()).then(rs => rs.text()).then(r => {
      r = r.replaceAll('#333333','#2B8DE3')
      this.iconoRelojSvg = this.sanitizer.bypassSecurityTrustHtml(r)
    })
  }

  protected eventoPaginacion(p:any){
    this.paginacion = p
    this.cronometro()
  }

  private cronometro(){
    //
    clearInterval(this.cronometroTiempo)
    //
    //Validar si existe la fecha de vencimiento
    const primerImputado:Imputado = this.listaImputados[this.paginacion.first]
    if(primerImputado && primerImputado.fechaVencimiento===null){
      return
    }
    //
    //Si cuentan con fecha de vencimiento se genera el cronometro
    this.cronometroTiempo = setInterval(()=>{
      for(let i = this.paginacion.first;i < (this.paginacion.first + this.paginacion.rows); i++){
        const fila: any= this.listaImputados[i]
        if(fila){
          const tiempoDiferencia = this.calcularCronometroDiferencia(fila.fechaVencimiento)
          if(tiempoDiferencia <= fila.tiempoVencimiento){
            fila['plazoVencer'] = true
          }
          fila['cronometro'] = this.calcularCronometro(tiempoDiferencia)
        }
      }
    }, 1000)

  }

  protected calcularCronometroPorDefecto(fechaVencimientoIn:string){
    return this.calcularCronometro( this.calcularCronometroDiferencia(fechaVencimientoIn) )
  }

  private calcularCronometroDiferencia(fechaVencimientoIn:string){
    const fechaVencimiento = new Date(fechaVencimientoIn)
    const fechaActual =  new Date()
    return fechaVencimiento.getTime() - fechaActual.getTime()
  }

  private calcularCronometro(tiempoDiferencia:number){
    if (tiempoDiferencia > 0) {
      const segundos = Math.floor(tiempoDiferencia / 1000)
      const minutos = Math.floor(segundos / 60)
      const horas = Math.floor(minutos / 60)
      const dias = Math.floor(horas / 24)

      const segundosRestantes = segundos % 60
      const minutosRestantes = minutos % 60
      const horasRestantes = horas % 24

      return `${dias}d: ${horasRestantes}h: ${minutosRestantes}m: ${segundosRestantes}s`
    } else {
      return '0d: 0h: 0m: 0s'
    }
  }

  protected eventoCerrar(){
    clearInterval(this.cronometroTiempo)
    this.dynamicDialogRef.close()
  }

  ngOnDestroy(): void {
    clearInterval(this.cronometroTiempo)
  }

}
// Interfaces Locales
interface DatosEntrada{
  cuadernoIncidental: CuadernoIncidental,
  tipoAlerta: TipoAlerta
}
interface Imputado{
  fechaNotificacion:string
  fechaVencimiento:string | null
  nombreCompletoSujetos:string
  tiempoVencimiento:number
}