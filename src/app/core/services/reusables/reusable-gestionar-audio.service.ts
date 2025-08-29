import { Injectable } from '@angular/core'
import { BACKEND } from '@environments/environment'
import { ApiBaseService } from '@services/shared/api.base.service'
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Audios } from '@core/interfaces/reusables/gestionar-audios/audios'

@Injectable({ providedIn: 'root' })
export class ReusableGestionarAudioService {

  private readonly urlRepositorioDocumentoPrivado = `${BACKEND.REPOSITORIO_DOCUMENTO_PRIVADO}`
  private readonly urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/gestionaraudio`

  private readonly tamanoMaximoExcedidoSubject = new BehaviorSubject<boolean>(false)
  tamanoMaximoExcedidoObservable = this.tamanoMaximoExcedidoSubject.asObservable()

  private readonly reproducirPausarSubject = new BehaviorSubject<boolean>(false)
  reproducirPausarObservable = this.reproducirPausarSubject.asObservable()

  private readonly seEstaReproduciendoSubject = new BehaviorSubject<boolean>(false)
  seEstaReproduciendoObservable = this.seEstaReproduciendoSubject.asObservable()

  constructor(
    private readonly apiBase: ApiBaseService, 
    private readonly http: HttpClient
  ) {
    this.apiBase = apiBase
  }

  public buscarIdMovimiento(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.urlTramite}/movimiento/${idActoTramiteCaso}`)
  }

  public obtenerAudio(idMovimiento: string): Observable<any> {
    return this.apiBase.get(`${this.urlTramite}/obtenerarchivos/${idMovimiento}`)
  }

  public guardarEditarAudio(data: any, tipoFuncionalidad: 'registrar' | 'editar'): Observable<any> {
    const headers = new HttpHeaders()

    headers.set('Content-Type', 'multipart/form-data')

    return this.http.post<any>(`${this.urlTramite}/${tipoFuncionalidad}`, data, { headers })
  }

  public eliminarAudio(idDocumento: string): Observable<any> {
    return this.apiBase.delete(`${this.urlTramite}/eliminararchivo/${idDocumento}`)
  }

  public descargarAudio({ url, nuDocumento }: Audios): void {
    this.http.get(url, { responseType: 'blob' }).subscribe((blob) => {
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)

      link.download = nuDocumento || 'audio_descargado'

      link.click()
      window.URL.revokeObjectURL(link.href)
    })
  }

  public async urlToFile(url: string, fileName: string): Promise<File> {
    try {
      const blob = await firstValueFrom(this.http.get(url, { responseType: 'blob' }))

      if (!blob) {
        throw new Error('No se pudo obtener el archivo de la URL')
      }

      return new File([blob], fileName, { type: blob.type })

    } catch (error) {
      console.error('Error al convertir la URL a File:', error)
      throw error
    }
  }

  public getUrlVisualizar(idArchivo: string, nombreArchivo: string): string {
    return `${this.urlRepositorioDocumentoPrivado}/visualizar?archivoId=${idArchivo}&nombreArchivo=${nombreArchivo}`
  }

  public getUrlDescargar(idArchivo: any, nombreArchivo: any): string {
    return `${this.urlRepositorioDocumentoPrivado}?archivoId=${idArchivo}&nombreArchivo=${nombreArchivo}`
  }

  public notificarTamanoMaximoExcedido(excedido: boolean) {
    this.tamanoMaximoExcedidoSubject.next(excedido)
  }

  public reproducirPausarAudio(valor: boolean) {
    this.reproducirPausarSubject.next(valor)
  }

  public notificarSeEstaReproduciendo(reproduciendo: boolean) {
    this.seEstaReproduciendoSubject.next(reproduciendo)
  }

}