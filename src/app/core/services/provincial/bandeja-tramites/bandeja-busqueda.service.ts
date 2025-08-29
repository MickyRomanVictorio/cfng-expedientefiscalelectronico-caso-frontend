import { Injectable } from '@angular/core'
import { BandejaTramiteRequest } from '@core/interfaces/provincial/bandeja-tramites/BandejaTramiteRequest'
import { BehaviorSubject, Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class BandejaBusquedaService {

  public datos = { tipoCuadernoId:-1, filtroXTipoCuaderno:false, ejecutarNuevaBusqueda:false, nuevaBusquedaEjecutada:false, ejecutarNuevaBusquedaXTexto:false, ejecutarNuevaBusquedaXTextoValor:'' }

  private readonly buscarSubject = new BehaviorSubject<BandejaBusqueda>({...this.datos})
  public buscar$ = this.buscarSubject.asObservable()

  private readonly filtroRequestSubject = new Subject<BandejaTramiteRequest>()
  private readonly textoBuscadoSubject = new Subject<string>()

  public filtroRequest$ = this.filtroRequestSubject.asObservable()
  public textoBuscado$ = this.textoBuscadoSubject.asObservable()

  public get configuracion(): BandejaBusqueda {
    return this.buscarSubject.value
  }

  public set configuracionXDefecto(busqueda: Partial<BandejaBusqueda>) {
    const origen = {...this.datos}
    const datos = { ...origen, ...busqueda }
    this.buscarSubject.next(datos)
  }

  public configuracionReiniciar() {
    this.buscarSubject.next({...this.datos})
  }

  public enviarFiltroRequest(data: any) {
    this.filtroRequestSubject.next(data)
  }

  public enviarTextoBuscado(texto: string) {
    this.textoBuscadoSubject.next(texto)
  }

}

export interface BandejaBusqueda{
  tipoCuadernoId:number
  ejecutarNuevaBusqueda:boolean
  filtroXTipoCuaderno:boolean
  nuevaBusquedaEjecutada:boolean
  ejecutarNuevaBusquedaXTexto:boolean
  ejecutarNuevaBusquedaXTextoValor:string
}
