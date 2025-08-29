import { Injectable } from '@angular/core';
import { Observable, filter, map } from 'rxjs';
import { ApiBaseService } from './api.base.service';
import { BACKEND } from '@environments/environment';
import { BiometriaSenasRequest } from '@core/interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/BiometriaSenasRequest';
import { TipoCedula } from '@core/types/tipo-cedula.type';
import { ConsultaReniec } from '@core/interfaces/mesa-unica-despacho/denuncia/datos-denuncia.interface';
import { CatalogoItem, GRUPOS_CATALOGO } from '@core/types/persona/reniec.type';
import { ImagenBiometriaRequest } from '@core/interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/ImagenBiometriaRequest';
import { CompresionImagenRequest } from '@core/interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/CompresionImagenRequest';
import { ordenar } from '@core/utils/string';
import { IApiTipoDocIdentidadResponse, IApiTipoCatalogoResponse, IApiTipoLenguaResponse, IApiTipoParentescoResponse, IApiTipoPuebloResponse, IApiTipoViaResponse, ITipoDocIdentidadModel, ITipoCatalogoModel, ITipoLenguaModel, ITipoParentescoModel, ITipoPuebloModel, ITipoViaModel } from '../generales/sujeto/sujeto-general.service';
import { GenericResponseList } from '@core/interfaces/comunes/GenericResponse';
import { Combo } from '@core/interfaces/comunes/combo';
import { Respuesta } from '@interfaces/comunes/genericos.interface';
import { Entidad, EscenarioSeis, EscenarioUno } from '@interfaces/maestros/escenarios.interface';
import { ComboNumber } from '@interfaces/maestros/combos.interface';

@Injectable({
  providedIn: 'root',
})
export class MaestroService {
  constructor(private apiBase: ApiBaseService) { }

  obtenerOrigen(): Observable<Respuesta<EscenarioUno[]>> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipoorigen`);
  }

  obtenertipovia(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipovia`);
  }

  public obtenertipoviaNuevo(): Observable<ITipoViaModel[]> {
    return this.apiBase.getWithInterface<IApiTipoViaResponse>(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipovia`)
      .pipe(
        filter(response => { return response.code === 200 }),
        map(response => { return (response.data || []) })
      );
  }

  obtenerDepartamentosInei(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/inei/dptogeografica`
    );
  }

  obtenerProvinciasInei(dpto: any): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/inei/provgeografica/${dpto}`
    );
  }

  obtenerDistritosInei(dpto: any, prov: any): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/inei/distgeografica/${dpto}/${prov}`
    );
  }

  obtenerUbigeoPuebloInei(ubigeo: any): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/reniec/centropobladogeografica/${ubigeo}`
    );
  }

  obtenerDepartamentos(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/reniec/dptogeografica`
    );
  }

  obtenerProvincias(dpto: string | String): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/reniec/provgeografica/${dpto}`
    );
  }

  obtenerDistritos(dpto: string, prov: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/reniec/distgeografica/${dpto}/${prov}`
    );
  }

  obtenerUbigeoPueblo(ubigeo: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/reniec/centropobladogeografica/${ubigeo}`
    );
  }

  obtenerTipoDomicilio(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipodomicilio`);
  }

  obtenerPrefijo(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/catalogo/ID_N_TIPO_PREF_URB`
    );
  }

  obtenerTipoDocIdentidad(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipodocidentidad`);
  }

  /*fin ddchr*/

  getTipoPlazo(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipoplazo`);
  }

  getTipoAsignacion(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipoasignacion`);
  }

  public obtenerTipoLengua(): Observable<ITipoLenguaModel[]> {
    return this.apiBase.getWithInterface<IApiTipoLenguaResponse>
      (`${BACKEND.CFEMAESTROS}v1/cftm/e/tipolengua`)
      .pipe(
        filter(response => { return response.code === 200 }),
        map(response => { return (response.data || []) })
      );
  }

  public obtenerTipoPueblo(): Observable<ITipoPuebloModel[]> {
    return this.apiBase.getWithInterface<IApiTipoPuebloResponse>
      (`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopueblo`)
      .pipe(
        filter(response => { return response.code === 200 }),
        map(response => { return (response.data || []) })
      );
  }

  public obtenerTipoParentesco(): Observable<ITipoParentescoModel[]> {
    return this.apiBase.getWithInterface<IApiTipoParentescoResponse>
      (`${BACKEND.CFEMAESTROS}v1/cftm/e/tipoparentesco`)
      .pipe(
        filter(response => { return response.code === 200 }),
        map(response => { return (response.data || []) })
      );
  }

  public obtenerTipoDocumentoIdentidad(): Observable<ITipoDocIdentidadModel[]> {
    return this.apiBase.getWithInterface<IApiTipoDocIdentidadResponse>
      (`${BACKEND.CFEMAESTROS}v1/cftm/e/tipodocidentidad`)
      .pipe(
        filter(response => { return response.code === 200 }),
        map(response => { return (response.data || []) })
      );
  }

  obtenerTipoParteSujeto(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopartesujeto`);
  }

  obtenerTipoParteSujetoInvestigados(): Observable<GenericResponseList<Combo>> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopartesujeto/investigados`);
  }

  obtenerTipoProceso(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipoproceso`);
  }

  obtenerSubtipoProcesos(idTipoProceso: number): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/eftm/e/subtipos/${idTipoProceso}`
    );
  }

  obtenerEtapas(
    idTipoProceso: number,
    idSubtipoProceso: string
  ): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/eftm/e/etapas/${idTipoProceso}/${idSubtipoProceso}`
    );
  }

  obtenerActosProcesales(idEtapa: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/actos/${idEtapa}`);
  }

  listarJuzgadosPazLetrado(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/eftm/e/juzgadoPazLetrado`
    );
  }

  obtenerEtapasComun(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/etapa/1`);
  }

  obtenerActosProcesalesAnt(idEtapa: any): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/eftm/e/actoprocesal/${idEtapa}`
    );
  }

  obtenerTramites(idActoProcesal: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/eftm/e/tramite/${idActoProcesal}`
    );
  }

  obtenerTiposDocumentos(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipodocumento`);
  }

  obtenerTiposDocumentosBandejaTramite(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipodocumentoBandejaTramite`);
  }

  obtenerCatalogo(nombreGrupo: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/catalogo/${nombreGrupo}`
    );
  }

  enviarRegistroBiometrico(request: BiometriaSenasRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFEMAESTROSDOCUMENTOS}v1/cftm/t/gestion/registraregistrobiometrico`,
      request
    );
  }

  obtenerImagenBiometriaSenas(
    request: ImagenBiometriaRequest
  ): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFEMAESTROSDOCUMENTOS}v1/cftm/t/gestion/obtieneImagenBiometria`,
      request
    );
  }

  realizarCompresionImagen(request: CompresionImagenRequest): Observable<any> {
    return this.apiBase.post(`${BACKEND.CFEMAESTROSDOCUMENTOS}v1/cftm/t/gestion/compresion`, request);
  }
  obtenerEstadosApelacionCuadernos(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/estados-pestana-apelacion`);
  }

  // obtenerInformacionCatalogo(nombreGrupo: string): Observable<any> {
  //   return this.apiBase.get(
  //     `${BACKEND.CFEMAESTROS}v1/cftm/e/catalogo/${nombreGrupo}`
  //   );
  // }

  public obtenerTipoCatalogo(catalogo: string): Observable<ITipoCatalogoModel[]> {
    return this.apiBase.getWithInterface<IApiTipoCatalogoResponse>(`${BACKEND.CFEMAESTROS}v1/cftm/e/catalogo/${catalogo}`)
      .pipe(
        filter(response => { return response.code === 200 }),
        map(response => { return (response.data || []) })
      );
  }

  obtenerEtapa(idnaturaleza: any): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/eftm/e/etapa/${idnaturaleza}`
    );
  }

  public obtenerFiscaliasXEntidad(idEntidadPadre: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/fiscalias/superior/${idEntidadPadre}`);
  }

  public obtenerFiscaliaXDependencia(codDependencia: string): Observable<Respuesta<Entidad[]>> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/fiscalias/superior-fiscal/${codDependencia}`);
  }

  public obtenerFiscalesXDespacho(codDespacho: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/fiscal/despacho/${codDespacho}`);
  }

  /*********************************/
  /*    GENERADOR NOTIFICACIONES   */

  /*********************************/

  obtenerMediosNotificacion(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/notm/e/medionotificacion`
    );
  }

  obtenerEstadosCedula(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/notm/e/estadocedula`);
  }

  obtenerFinalidades(tipoCedula: TipoCedula): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/notm/e/tipofinalidad/${tipoCedula}`
    );
  }

  obtenerTipoUrgencias(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/notm/e/tipourgencia`);
  }

  obtenerCamarasGessel(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/notm/e/tipocamaragesell`);
  }

  obtenerTipoAnexo(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/notm/e/tipoanexo`);
  }

  obtenerEstadosCasilla(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/notm/e/estadocasilla`);
  }

  /*********************************/
  /*    MESA UNICA DESPACHO        */

  /*********************************/

  getDependenciaFiscal(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/dependenciafiscal`
    );
  }

  getDependenciaFiscalxDistrito(idDistritoFiscal: number): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/dependenciafiscal/distritofiscal/${idDistritoFiscal}`
    );
  }

  getDependenciaFiscalPorMup(codigoDependencia: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/dependenciafiscal/${codigoDependencia}`
    );
  }

  getDespacho(idDependenciaFiscal: number): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/despacho/${idDependenciaFiscal}`
    );
  }

  getFiscalias(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/fiscalias/1`);
  }

  getListTipoSujeto(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tiposujeto`);
  }

  getCatalogo(grupo: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/catalogo/${grupo}`
    );
  }

  getTipoDocumentoPerfil(idTipoSujeto: number): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/documento/${idTipoSujeto}`
    );
  }

  getTipoDocIdentidad(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipodocidentidad`);
  }

  getTipoDocumento(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipodocumento`);
  }

  consultaReniecApiMup(body: ConsultaReniec): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.MS_PERSONA}e/personanatural/consulta/general`,
      body
    );
  }

  getTipoDocIdentidadNatural(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/tipodocidentidad/1`
    );
  }

  getListTipoPersona(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopersona`);
  }

  documentosPorTipoNacionalidadList(tipoNacionalidad: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/tipopersona/${tipoNacionalidad}`
    );
  }

  getListaDistritoFiscal(): Observable<Respuesta<Array<EscenarioUno>>> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/distritofiscal`);
  }

  getDistritoFiscalPorCodigo(codDistritoFiscal: string): Observable<Respuesta<EscenarioSeis>> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/distritofiscal/codigo/${codDistritoFiscal}`);
  }

  getEspecialidadConsulta(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/especialidad`);
  }

  getEspecialidadMup(codigoDependencia: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/especialidad/mup/${codigoDependencia}`
    );
  }

  getEspecialidadDespacho(codigoDependencia: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/especialidad/despacho/${codigoDependencia}`
    );
  }

  getEtapa(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/etapa/1`);
  }

  getActoProcesal(value: any): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/eftm/e/actoprocesal/` + value
    );
  }

  getTramite(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tramite`);
  }

  getBusinessName(ruc: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.SUNAT}${ruc}`);
  }

  getListViolencias(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/mptm/e/tipoviolencia`);
  }

  getTipoRiesgo(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/mptm/e/tiporiesgo`);
  }

  getDistritoJudicial(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/distritojudicial`);
  }

  getJuzgadosPorDistritoJudicial(idDistritoJudicial: number): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/distritojudicial/juzgado/${idDistritoJudicial}`
    );
  }

  getOrganoJuridiccional(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/organojurisdiccional`
    );
  }

  getDependenciaJudicial(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/dependenciapjudicial`
    );
  }

  getPoliceDepartment(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/dependenciapolicial`
    );
  }

  getDelitos(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/delito/subgenerico/especifico`
    );
  }

  getListColegioAbogados(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/colegioabogados`);
  }

  /********************/
  /*    MESA TURNO    */

  /********************/

  tipoDocumentoIdentidad() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipodocidentidad`)
      .pipe(map((response) => response.data));
  }

  dependenciaPolicial() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/dependenciapolicial`)
      .pipe(map((response) => response.data));
  }

  departamento() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/reniec/dptogeografica`)
      .pipe(
        map((data) => {
          data.data.sort(ordenar('nombre', 'asc'));
          return data;
        })
      );
  }
  getTipoPena(pena: number) {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/eftm/e/tipopena/${pena}`
    );
  }

 getReglasConducta() {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/eftm/e/reglasconducta`
    );
  }
  provincia(departamento: string) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/cftm/e/reniec/provgeografica/${departamento}`
      )
      .pipe(
        map((data) => {
          data.data.sort(ordenar('nombre', 'asc'));
          return data;
        })
      );
  }

  distrito(departamento: string, provincia: string) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/cftm/e/reniec/distgeografica/${departamento}/${provincia}`
      )
      .pipe(
        map((data) => {
          data.data.sort(ordenar('nombre', 'asc'));
          return data;
        })
      );
  }

  tipoLugar() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/mptm/e/tipolugar`).pipe(
      map((data) => {
        data.data.sort(ordenar('nombre', 'asc'));
        return data;
      })
    );
  }

  tipoVia() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipovia`).pipe(
      map((data) => {
        data.data.sort(ordenar('nombre', 'asc'));
        return data;
      })
    );
  }

  medioComunicacion() {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/notm/e/medionotificacion`
    );
  }

  tipoHecho() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/mptm/e/tipohecho`);
  }

  fiscal() {
    return this.apiBase.get(
      `${BACKEND.CFEEXPEDIENTE}v1/e/caso/asignacion/fiscalesconasignacion`
    );
  }

  origenTurno() {
    return this.catalogo(GRUPOS_CATALOGO.ORIGEN_TURNO);
  }

  estadoCivil() {
    return this.catalogo(GRUPOS_CATALOGO.ESTADO_CIVIL);
  }

  getEstadoCivil() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/estadocivil`)
      .pipe(map((i) => i.data));
  }

  private catalogo(grupo: string): Observable<CatalogoItem[]> {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/catalogo/${grupo}`)
      .pipe(map(({ data }) => data));
  }

  listarPueblos() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopueblo`)
      .pipe(map((response) => response.data));
  }

  listarLenguasMaternas() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipolengua`)
      .pipe(map((response) => response.data));
  }

  listarTipoParteSujetoMUPD() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopartesujeto/MUP`)
      .pipe(map((response) => response.data));
  }

  listarGradoInstruccion() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/gradoinstruccion`)
      .pipe(map((response) => response.data));
  }

  listarProfesion() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/actividadLaboral`)
      .pipe(map((response) => response.data));
  }

  listarNacionalidad() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/nacionalidad`)
      .pipe(map((response) => response.data));
  }

  listarTipoActas() {
    return this.catalogo(GRUPOS_CATALOGO.TIPO_ACTA).pipe(
      map((response) =>
        response.map((item) => ({ id: item.id, nombre: item.noDescripcion }))
      )
    );
  }

  listarComplejidad() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipocomplejidad`)
      .pipe(map((response) => response.data));
  }

  listarSedeInvestigacion() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tiposedeinv`)
      .pipe(map((response) => response.data));
  }

  listarUnidadMedida() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipounidad`)
      .pipe(map((response) => response.data));
  }

  listarTipoEspecialidadXDistritoFiscal(
    idDistritoFiscal: number,
    codigoEntidad: string
  ) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/cftm/e/tipoespecialidad/${idDistritoFiscal}/${codigoEntidad}`
      )
      .pipe(map((response) => response.data));
  }

  listarTipoEspecialidad(codigoEntidad: string): Observable<Array<ComboNumber>> {
    return this.apiBase
      .getTyped<Respuesta<Array<ComboNumber>>>(
        `${BACKEND.CFEMAESTROS}v1/cftm/e/tipoespecialidad/0/${codigoEntidad}`
      )
      .pipe(map((response) => response.data));
  }

  listarEspecialidad(codigoEntidad: string, idTipoEspecialidad: number) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/cftm/e/especialidad/entidad/0/${codigoEntidad}/${idTipoEspecialidad}`
      )
      .pipe(map((response) => response.data));
  }

  listarDistrito(
    idDistritoFiscal: number,
    idTipoEspecialidad: number,
    idEspecialidad: string,
    idJerarquia: number
  ) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/cftm/e/distritogeografico/${idDistritoFiscal}/${idTipoEspecialidad}/${idEspecialidad}/${idJerarquia}`
      )
      .pipe(map((response) => response.data));
  }

  listarFiscalia(
    idDistritoFiscal: number,
    idTipoEspecialidad: number,
    idEspecialidad: string,
    idUbigeo: number,
    idJerarquia: number
  ) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/eftm/e/entidad/${idDistritoFiscal}/${idTipoEspecialidad}/${idEspecialidad}/${idUbigeo}/${idJerarquia}`
      )
      .pipe(map((response) => response.data));
  }

  listarPresidencia(codigoEntidad: string, idTipoEntidad: number) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/eftm/e/entidad/${codigoEntidad}/${idTipoEntidad}`
      )
      .pipe(map((response) => response.data));
  }

  listarFiscaliaSuperior(codigoEntidad: string, idTipoEntidad: number) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/eftm/e/entidad/hijas/${codigoEntidad}/${idTipoEntidad}`
      )
      .pipe(map((response) => response.data));
  }

  listarFiscalesAsignados(codigoEntidad: string, idTipoEntidad: number) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/cftm/e/fiscal/entidad/${codigoEntidad}/${idTipoEntidad}`
      )
      .pipe(map((response) => response.data));
  }

  public listarDespacho(codigoEntidad: string) {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/despacho/entidad/${codigoEntidad}`)
      .pipe(map((response) => response.data));
  }

  listarTipoContienda() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipocontienda`)
      .pipe(map((response) => response.data));
  }

  listarDistritoFiscal() {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/distritofiscal`)
      .pipe(map((response) => response.data));
  }

  getFiscalSuperiorAElevar(idActoTramiteCaso: string) {
    return this.apiBase
      .get(
        `${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${idActoTramiteCaso}/listarSujetos`
      )
      .pipe(map((response) => response.data));
  }

  obtenerMedidasCoercion(idTipoMedida: number) {
    return this.apiBase
      .get(
        `${BACKEND.CFEMAESTROS}v1/eftm/e/medidacoercion/${idTipoMedida}`
      )
      .pipe(map((response) => response));
  }

  obtenerEtapasCaso(idProcesoEtapa: string) {
    return this.apiBase
      .get(`${BACKEND.CFEMAESTROS}v1/eftm/e/etapas/procesoEtapa/${idProcesoEtapa}`)
      .pipe(map((response) => response.data));
  }

  obtenerSalidasAlternas() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/salidas-alternas`);
  }

  listaTipoAcuerdoActa() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/tipo-acuerdo-acta`);
  }

  listaBancos() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/bancos`);
  }

  listaActuaciones() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/actuaciones`);
  }

  public listarCargoFuncionario() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/cargofuncionario`)
      .pipe(map((response) => response.data));
  }
  
  public listarInstucionPublica() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/institucionpublica`)
      .pipe(map((response) => response.data));
  }

  public listarTipoDefensor() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipodefensor`)
      .pipe(map((response) => response.data));
  }

  public listarCargoAsociacion() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/cargoasociacion`)
      .pipe(map((response) => response.data));
  }

  public listarTipoViolencia() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/mptm/e/tipoviolencia`)
      .pipe(map((response) => response.data));
  }

  public listarFactorRiesgo() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/mptm/e/tiporiesgo`)
      .pipe(map((response) => response.data));
  }

  public listarTipoDiscapacidad() {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipodiscapacidad`)
      .pipe(map((response) => response.data));
  }

  public obtenerCondicionSujeto(notipoorigen: string, idTipoParte: number): Observable<any[]> {
    console.log('url = ', `${BACKEND.CFEMAESTROS}v1/cftm/e/sujeto/condicion/${notipoorigen}/${idTipoParte}`);
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/cftm/e/sujeto/condicion/${notipoorigen}/${idTipoParte}`)
      .pipe(map((response) => response.data));
  }
}
