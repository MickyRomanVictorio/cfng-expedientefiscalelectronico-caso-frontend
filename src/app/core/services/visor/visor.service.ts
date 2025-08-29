import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaDocumentos } from '@core/interfaces/visor/visor-interface';
import { BACKEND } from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class VisorEfeService {

  constructor(private readonly http: HttpClient) {}

  /**
   * @deprecated
   * @param numeroCasoActual
   * @returns
   */
  getData(numeroCasoActual:string): Observable<RespuestaDocumentos> {
    return this.http.get<RespuestaDocumentos>(BACKEND.CFEMAESTROSDOCUMENTOS+'v1/cftm/t/gestion/consultadocumento/carpetaprincipal/' + numeroCasoActual);
  }

  /**
   * @deprecated
   * @param idDocumento
   * @returns
   */
  getPDF64(idDocumento:string):Observable<any> {
    return this.http.get(BACKEND.CFEMAESTROSDOCUMENTOS+'v1/cftm/t/gestion/obtienedocumento/' + idDocumento);
  }


  public getDatosArchivosCarpetaPrincipal(numeroCasoActual:string): Observable<RespuestaDocumentos> {
    if(numeroCasoActual==='') numeroCasoActual = '1D873C78D62E85A8E0650250569D508A';
    return this.http.get<RespuestaDocumentos>(BACKEND.CFEEXPEDIENTE+'v1/e/caso/visor/consultaarchivos/carpetaprincipal/' + numeroCasoActual);
  }

  public getArchivoUrl(id:string, nombre:string){
    return BACKEND.CFE_EFE_REPOSITORIO_PUBLICO+'/cfe/generales/repositorio/publico/v1/t/multimedia/descarga?archivoId='+id+'&nombreArchivo='+nombre
  }

  public getArchivo(id:string, nombre:string){
    return this.http.get( this.getArchivoUrl(id,nombre), {responseType: 'blob'});
  }

  public getDescargarArchivoZip(codigo:string):Observable<any> {
    return this.http.get(BACKEND.CFEMAESTROSDOCUMENTOS+'v1/cftm/t/visor/obtienedocumentoszip?codigos=' + encodeURIComponent(codigo), {responseType: 'blob'});
  }

  public getDescargarPdfTodo(codigo:string):Observable<any> {
    return this.http.get(BACKEND.CFEMAESTROSDOCUMENTOS+'v1/cftm/t/visor/descargardocumentosunidos?codigos=' + encodeURIComponent(codigo), {responseType: 'blob'});
  }

  public getDescargarArchivo(codigo:string):Observable<any> {
    return this.http.get(BACKEND.CFEMAESTROSDOCUMENTOS+'v1/cftm/t/visor/descargararchivo?codigo='+encodeURIComponent(codigo), {responseType: 'blob'});
  }

  public getArchivoPorCodigoDocumento(codigo:string):Observable<any> {
    return this.http.get(BACKEND.CFEMAESTROSDOCUMENTOS+'v1/cftm/t/gestion/obtienearchivo/'+ codigo, {responseType: 'blob'});
  }





}
