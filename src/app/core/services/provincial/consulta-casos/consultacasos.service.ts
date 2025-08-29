import { CasoFiscal, CasoFiscalResponse, NotaRequest } from '@core/interfaces/comunes/casosFiscales';
import { Nota } from '@core/interfaces/comunes/casosFiscales';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, from } from 'rxjs';
import { BACKEND } from '@environments/environment';
import { TokenService } from '@services/shared/token.service';
import { switchMap, tap } from 'rxjs/operators';
import { TramiteDetalle } from '@interfaces/comunes/tramiteProcesal';

@Injectable({ providedIn: 'root' })
export class Casos {
  private readonly deleteEvent = new Subject<Nota>();
  private readonly updateEvent = new Subject<Nota>();
  onDeletePostIt$ = this.deleteEvent.asObservable();
  onUpdatePostIt$ = this.updateEvent.asObservable();

  deletePostItEvent(nota: Nota) {
    this.deleteEvent.next(nota);
  }

  updatePostItEvent(nota: Nota) {
    this.updateEvent.next(nota);
  }

  getSexos() {
    return this.http.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/genero`)
  }

  constructor(
    private readonly http: HttpClient,
    private readonly tokenservice: TokenService
  ) { }

  getUserSession() {
    return this.tokenservice.getDecoded()
  }

  getCaso(id: string) {
    return this.http.get(`${BACKEND.CFE_EFE_SUJETOS}/v1/e/gestionarinformaciongeneral/${id}`)
  }

  saveSujeto(data: any): Observable<any> {
    const url = `${BACKEND.CFE_EFE_SUJETOS}/v1/e/gestionarinformaciongeneral/agregar`;
    return this.http.post(url, data);
  }

  editSujeto(data: any): Observable<any> {
    const url = `${BACKEND.CFE_EFE_SUJETOS}/v1/e/gestionarinformaciongeneral/modificar`;
    return this.http.put(url, data);
  }

  getEstadoCivil() {
    return this.http.get(`${BACKEND.CFEMAESTROS}/v1/cftm/e/estadocivil`)
  }

  getRuc(ruc: string) {
    return this.http.get(`${BACKEND.CFEPERSONA}/v1/e/padronsunat/${ruc}`)
  }

  getInstrucción() {
    return this.http.get(`${BACKEND.CFEMAESTROS}/v1/cftm/e/gradoinstruccion`)
  }

  actoTramiteDetalleCaso(idActoTramiteCaso: string): Observable<TramiteDetalle> {
    return this.http.get<TramiteDetalle>(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/consulta/actotramitedetallecaso/${idActoTramiteCaso}`)
  }

  getDni(dni: string): Observable<any> {
    // Convertimos la promesa de fetch en un observable de RxJS
    return from(fetch('https://api.ipify.org?format=json')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('No se pudo obtener la IP');
        }
      })
    ).pipe(
      switchMap(ip_res => {
        const url = `${BACKEND.CFEPERSONA}/v1/e/personanatural/consulta/general`;
        const dataPeticion = {
          ip: ip_res.ip,
          numeroDocumento: dni
        };
        return this.http.post(url, dataPeticion);
      })
    );
  }

  getCasosFiscales(filter: any): Observable<CasoFiscalResponse<CasoFiscal[]>> {
    let params = new HttpParams({ fromObject: { ...filter } });
    return this.http.get<CasoFiscalResponse<CasoFiscal[]>>( `${BACKEND.CFE_EFE}/v1/e/caso/consulta`, { params } );
  }

  getConsultarCasos(idCaso: string): Observable<CasoFiscalResponse<CasoFiscal[]>> {
    return this.http.get<CasoFiscalResponse<CasoFiscal[]>>(
      `${BACKEND.CFE_EFE}/v1/e/caso/consulta/${idCaso}`,
    );
  }
  obtenerCasoFiscal(idCaso: String): Observable<any> {
    return this.http.get(`${BACKEND.CFE_EFE}/v1/e/caso/consulta/${idCaso}`)
      .pipe(tap((response: any) => { return response.data }))
  }

  getEtapas() {
    return this.http.get(`${BACKEND.CFE_EFE}v1/eftm/e/etapa/1`)
  }

  getActoProcesal(id: string) {
    return this.http.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/actoprocesal/${id}`)
  }

  getTramite() {
    return this.http.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tramite`)
  }

  getTramiteByActoProcesal(idActoProcesal: string) {
    console.log('idActoProcesal', `${BACKEND.CFEMAESTROS}v1/eftm/e/tramite/${idActoProcesal}`);
    return this.http.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tramite/${idActoProcesal}`)
  }

  getPaises() {
    return this.http.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/nacionalidad`)
  }

  getTipoSujetoProcesal() {
    return this.http.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopartesujeto`)
  }

  getPersona() {
    return this.http.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopersona`)
  }

  getTipoDni() {
    return this.http.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipodocidentidad`)
  }

  deleteNote(numeroCaso: any, noteId: any): Observable<any> {
    return this.http.put(`${BACKEND.CFE_EFE}/v1/e/caso/consulta/${numeroCaso}/nota/d/${noteId}`, { idNota: noteId, numeroCaso: numeroCaso });
  }

  createNote(requestNote: NotaRequest): Observable<CasoFiscalResponse<Nota>> {
    return this.http.post<CasoFiscalResponse<Nota>>(`${BACKEND.CFE_EFE}/v1/e/caso/consulta/${requestNote.numeroCaso}/nota`, requestNote);

  }

  actualizarNota(notaCaso: NotaRequest): Observable<CasoFiscalResponse<Nota>> {
    return this.http.put<CasoFiscalResponse<Nota>>(`${BACKEND.CFE_EFE}/v1/e/caso/consulta/${notaCaso.numeroCaso}/nota/${notaCaso.idNota}`, notaCaso);

  }

  delitosyPartesInfo() {
    return this.http.get<any>(`http://localhost:3000/info`);
  }

  updateEstadoLeido(numeroCaso: string) {
    return this.http.post(`${BACKEND.CFE_EFE}/v1/e/caso/consulta/leido`, { numeroCaso: numeroCaso });
  }

  consultaRapida(numeroCaso: string) {
    return this.http.get(`${BACKEND.CFE_EFE}/v1/e/caso/consulta/consultarapida/${numeroCaso}`)
  }
  obtenerApelaciones(data: any) {
    return this.http.post(`${BACKEND.CFE_EFE}/v1/e/caso/apelacion/pestanas/listar`,data)
  }

}
