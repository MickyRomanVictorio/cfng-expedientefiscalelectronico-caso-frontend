import * as i0 from '@angular/core';
import { Injectable, NgModule, Pipe, inject, ElementRef, Directive, Renderer2, HostListener } from '@angular/core';
import { format, getHours, getMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import * as i1 from '@angular/platform-browser';
import { iFolderSearch, iTooltip, iChevronRight, iFilterShow, iFolderExclamation, iTable, iFileDownload, iPosit, iArrowRight, iFileAdd, iFiles, iFileSearch, iUsers, iFileInput, iClose, iDownload, iSearch, iFolderSolid, iAttach, iReAsign, iCheckCircle, iTrash, iEdit, iAdd, iCheck, iChevronLeft, iSend, iTrashCan, iSign, iDeny, iArrowLeft, iSave, iViewFile, iAddUser, iAlert, iFile, iAlertHexagonal, iCalendarClean, iClockDots, iFileRegister, iInfoCircle, iPlayCircle, iReset, iRestaurar, iEnviar, iFirmaMasiva, iSmartPhone, iTracing, iTrashMpe, iPhone, iMail, iPin, iDownloadFile, iFileUpload, iFolderMagnifyingGlass, iChevronUp, iChevronDown, iChevronOrder, iEye, iFileFull, iAlerta, iAltavoz, iEliminarBloqueado, iPrint, iBell, iTimer, iSearchMpe, iUsdCircle, iFileArrowUp, iFileImage } from 'ngx-mpfn-dev-icojs-regular';
import { fromEvent, shareReplay, Subject, EMPTY, merge, takeUntil } from 'rxjs';
import { NgControl } from '@angular/forms';

const DOMAIN_CDN = 'http://172.16.111.112:8085/assets';
const CDN = {
    CDN_ICON: `${DOMAIN_CDN}/icons`,
    CDN_IMAGES: `${DOMAIN_CDN}/images`
};

class IconAsset {
    // Ref cfng-core-lib - obtenerRutaIcono
    obtenerRutaIcono(name) {
        return `${CDN.CDN_ICON}/${name}.svg`;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: IconAsset, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: IconAsset, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: IconAsset, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class ImageAsset {
    obtenerRutaImageWithExtension(name) {
        return `${CDN.CDN_IMAGES}/${name}`;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ImageAsset, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ImageAsset, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ImageAsset, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class AssetsModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: AssetsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: AssetsModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: AssetsModule, providers: [
            IconAsset,
            ImageAsset
        ] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: AssetsModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        IconAsset,
                        ImageAsset
                    ],
                }]
        }] });

var TipoAlerta;
(function (TipoAlerta) {
    TipoAlerta["A_SOLUCIONAR"] = "A SOLUCIONAR";
    TipoAlerta["REGULARES"] = "REGULARES";
})(TipoAlerta || (TipoAlerta = {}));
var EstadoAlerta;
(function (EstadoAlerta) {
    EstadoAlerta["SOLUCIONADO"] = "SOLUCIONADO";
    EstadoAlerta["PENDIENTE"] = "PENDIENTE";
})(EstadoAlerta || (EstadoAlerta = {}));
var BandejaAlerta;
(function (BandejaAlerta) {
    BandejaAlerta["PLAZOS"] = "PLAZOS";
    BandejaAlerta["GENERICAS"] = "GENERICAS";
})(BandejaAlerta || (BandejaAlerta = {}));

var TRAMITE;
(function (TRAMITE) {
    TRAMITE[TRAMITE["FIRMADO"] = 1] = "FIRMADO";
    TRAMITE[TRAMITE["NO_FIRMADO"] = 0] = "NO_FIRMADO";
})(TRAMITE || (TRAMITE = {}));
var VALIDACION;
(function (VALIDACION) {
    VALIDACION[VALIDACION["PERMITIDO"] = 0] = "PERMITIDO";
    VALIDACION[VALIDACION["TRAMITE_ENVIADO_AL_GN"] = 1] = "TRAMITE_ENVIADO_AL_GN";
    VALIDACION[VALIDACION["TRAMITE_ENVIADO_A_CN"] = 2] = "TRAMITE_ENVIADO_A_CN";
    VALIDACION[VALIDACION["TRAMITE_ENVIADO_A_CN2"] = 3] = "TRAMITE_ENVIADO_A_CN2";
    VALIDACION[VALIDACION["TRAMITE_SUPERIOR_ACEPTADO"] = 4] = "TRAMITE_SUPERIOR_ACEPTADO";
    VALIDACION[VALIDACION["TRAMITE_SUPERIOR_NO_ACEPTADO"] = 5] = "TRAMITE_SUPERIOR_NO_ACEPTADO";
    VALIDACION[VALIDACION["TRAMITE_DISP_DESAGREGAR"] = 6] = "TRAMITE_DISP_DESAGREGAR";
})(VALIDACION || (VALIDACION = {}));
var ESTADO_TRAMITE;
(function (ESTADO_TRAMITE) {
    ESTADO_TRAMITE[ESTADO_TRAMITE["VISADO"] = 663] = "VISADO";
    ESTADO_TRAMITE[ESTADO_TRAMITE["BORRADOR"] = 433] = "BORRADOR";
    ESTADO_TRAMITE[ESTADO_TRAMITE["PENDIENTE_PARA_REVISION"] = 434] = "PENDIENTE_PARA_REVISION";
    ESTADO_TRAMITE[ESTADO_TRAMITE["PENDIENTE_PARA_VISAR"] = 435] = "PENDIENTE_PARA_VISAR";
    ESTADO_TRAMITE[ESTADO_TRAMITE["FIRMADO"] = 422] = "FIRMADO";
    ESTADO_TRAMITE[ESTADO_TRAMITE["MODIFICADO"] = 545] = "MODIFICADO";
})(ESTADO_TRAMITE || (ESTADO_TRAMITE = {}));
var ESTADO_REGISTRO;
(function (ESTADO_REGISTRO) {
    ESTADO_REGISTRO[ESTADO_REGISTRO["BORRADOR"] = 943] = "BORRADOR";
    ESTADO_REGISTRO[ESTADO_REGISTRO["FIRMADO"] = 946] = "FIRMADO";
    ESTADO_REGISTRO[ESTADO_REGISTRO["RECIBIDO"] = 963] = "RECIBIDO";
    ESTADO_REGISTRO[ESTADO_REGISTRO["PENDIENTE_COMPLETAR"] = 964] = "PENDIENTE_COMPLETAR";
})(ESTADO_REGISTRO || (ESTADO_REGISTRO = {}));
var TIPO_RESULTADO;
(function (TIPO_RESULTADO) {
    TIPO_RESULTADO[TIPO_RESULTADO["FUNDADO"] = 763] = "FUNDADO";
    TIPO_RESULTADO[TIPO_RESULTADO["FUNDADO_EN_PARTE"] = 764] = "FUNDADO_EN_PARTE";
    TIPO_RESULTADO[TIPO_RESULTADO["INFUNDADO"] = 765] = "INFUNDADO";
})(TIPO_RESULTADO || (TIPO_RESULTADO = {}));

const ESTADO_REGISTRO_ULTIMO = [
    {
        idEstado: ESTADO_REGISTRO.RECIBIDO,
        nombre: 'Recibido',
    },
    {
        idEstado: ESTADO_REGISTRO.PENDIENTE_COMPLETAR,
        nombre: 'Pendiente completar datos',
    },
];

var CATALOGO_NOM_GRUPO;
(function (CATALOGO_NOM_GRUPO) {
    CATALOGO_NOM_GRUPO["TIPO_ELEVACION"] = "ID_N_TIPO_ELEVACION";
})(CATALOGO_NOM_GRUPO || (CATALOGO_NOM_GRUPO = {}));

const Constants = {
    LOADING: 'loading',
    MSG_LOADING: 'msg_loading',
    TOKEN_NAME: 'access_token',
    TOKEN_PROFILE: 'access_token_profile',
    DECODE_TOKEN: 'decode_token',
    CALL_FAILED: 'call_failed',
    CODE_TIMER: 'code_timer',
    RESENT_TIMER: 'resent_timer',
    INFO: 'info',
    MAX_DOCUMENTS_PER_DEPENDENT: 5,
};
const semaforo = {
    ROJO: 'plazo-vencido',
    AMBAR: 'plazo-por-vencer',
    VERDE: 'dentro-del-plazo',
    AMBAR_PORCENTAJE: 75,
};
const TIPO_ETIQUETAS = Object.freeze({
    H3: 'h3',
    DIV: 'div',
});
const TIPO_SUJETO_PROCESAL = Object.freeze({
    DENUNCIADO: 'Denunciado',
    REMITENTE: 'Remitente',
    DENUNCIANTE: 'Denunciante',
    AGRAVIADO: 'Agraviado',
});
const RESPUESTA_HTTP = {
    OK: 'success',
};
const DOCUMENTOS_IDENTIDAD_ABOGADOS = Object.freeze({
    DNI: '1',
    CARNETEXT: '5',
    PASAPORTE: '4',
});
const ESTADO_ABOGADO = Object.freeze({
    DESHABILITADO: '0',
    HABILITADO: '1',
});
const CARGO = Object.freeze({
    FISCAL_NACION: '00000001',
    FISCAL_SUPERIOR: '00000006',
    FISCAL_SUPREMO: '00000002',
    FISCAL_PROVINCIAL: '00000008',
    FISCAL_PROVINCIAL_CESANTE: '00000305',
    FISCAL_ADJUNTO_PROVINCIAL: '00000009',
    FISCAL_ADJUNTO_SUPREMO: '00000003',
    FISCAL_ADJUNTO_SUPERIOR: '00000007',
    ASISTENTE_FUNCION_FISCAL: '00002113',
    ASISTENTE_ADMINISTRATIVO: '00002117',
});
const BANDEJA_ESTADO = Object.freeze({
    TRAMITES_NUEVOS: 569,
    TRAMITES_ENVIADOS_REVISAR: 568,
    TRAMITES_ENVIADOS_VISAR: 567,
    TRAMITES_PENDIENTES_REVISAR: 461,
    TRAMITES_PENDIENTES_VISAR: 462,
    TRAMITES_FIRMADOS: 564,
});
const ALERTAS = Object.freeze({
    BANDEJA_PLAZOS: 623,
    BANDEJA_GENERICAS: 624,
    BANDEJA_PENDIENTE: 625,
    BANDEJA_SOLUCIONADO: 626,
    ALERTAS_URGENTES: 627,
    NUMERO_REGISTROS: 2,
});
const ACTOS = Object.freeze({
    APELACION_TERMINACION_ANTICIPADA: '000094',
    APELACION_PROCESO_INMEDIATO: '000130',
    APELACION_PRINCIPIO_OPORTUNIDAD: '000164',
    APELACION_ACUERDO_REPARATORIO: '000165'
});
const TRAMITES = Object.freeze({
    ACTA: '000009',
    CONSTANCIA: '000010',
    DECLARACION: '000011',
    DISPOSICIÓN: '000012',
    ESCRITO: '000013',
    INFORME: '000014',
    OFICIO: '000015',
    PROVIDENCIA: '000016',
    RAZON: '000017',
    REQUERIMIENTO: '000018',
    RESULTADO_DE_OFICIO: '000019',
    RECIBE_DOCUMENTO: '000020',
    REMITE_DOCUMENTO: '000021',
    DISPOSICION_ACUMULACION: '022',
    SOLICITUD_ELEVACION_ACTUADOS: '026',
    DISPOSICION_ELEVACION_ACTUADOS: '000027',
    DISPOSICION_IMPROCEDENCIA_ELEVACION_ACTUADOS: '028',
    DISPOSICION_CONTIENDA_COMPETENCIA: '030',
    DISPOSICION_DERIVACION_INTERNA: '042',
    DISPOSICION_DERIVACION_EXTERNA: '043',
    DISPOSICION_DERIVACION_JUZGADO_PAZ_LETRADO: '044',
    DISPOSICION_IMPROCEDENCIA_ELEVACION_ACTUADOS2: '059',
    SOLICITUD_ACUERDO_REPARATORIA: '51',
    DISPOSICION_DESACUMULACION: '000260',
    OFICIO_DEVOLUCION_CASO: '261',
    DISPOSICION_PRORROGA_INVESTIGACION_PREPARATORIA: '000269',
    DISPOSICION_AMPLIACION_DILIGENCIAS_PREPARATORIA: '000060',
    REQUERIMIENTO_PRORROGA_INVESTIGACION_PREPARATORIA: '000271',
    RESOLUCION_AUTO_QUE_RESUELVE_PRORROGA: '000303',
    FORMALIZACION_DE_INVESTIGACION_PREPARATORIA: '000066',
    CONCLUSION_DE_INVESTIGACION_PREPARATORIA: '000083',
    CONCLUSION_DE_INVESTIGACION_SUPLEMENTARIA: '000084',
    INICIO_DILIGENCIAS_PRELIMINARES: '000045',
    REQUERIMIENTO_INCOACION: "000036",
    DISPOSICION_QUE_DECLARA_COMPLEJO_LA_INVESTIGACION_PRELIMINAR: '000062',
    DISPOSICION_DE_REAPERTURA_DE_CASO: '000608',
    DISPOSICION_DE_DECLARAR_COMPLEJO_LA_INVESTIGACION_PREPARATORIA: '000085',
    DISPOSICION_DE_PRORROGA_DE_INVESTIGACION_PREPARATORIA: '000551',
});
const TRAMITE_TIPO_DOCUMENTO = Object.freeze({
    ACTA: 5,
    AGENDA_FISCAL: 31,
    ANEXO_DENUNCIA: 28,
    ATESTADO_POLICIAL: 18,
    CARGO_CITACION: 13,
    CARGO_INGRESO_DENUNCIA: 8,
    CARGO_INGRESO_DOCUMENTO: 9,
    CARGO_INGRESO_DOCUMENTO_SUBSANADO: 24,
    CARGO_NOTIFICACION: 12,
    CARGO_OFICIO: 30,
    CARTA: 14,
    CEDULA_CITACION: 11,
    CEDULA_NOTIFICACION: 10,
    CONSTANCIA: 6,
    DECLARACION: 7,
    DISPOSICION: 1,
    ESCRITO: 21,
    EXPEDIENTE: 20,
    GUIA_DEVOLUCION: 27,
    GUIA_DIGITALIZACION: 26,
    GUIA_IMPRESION: 25,
    INFORME: 23,
    INFORME_POLICIAL: 19,
    OFICIO: 22,
    PARTE_POLICIAL: 17,
    PROVIDENCIA: 3,
    RAZON: 4,
    REQUERIMIENTO: 2,
    RESOLUCION: 16,
    RESPUESTA_OFICIO: 29,
    SIN_DOCUMENTO: 0,
    SOLICITUD: 15,
});
const COMPLEJIDAD = Object.freeze({
    COMPLEJIDAD_PRELIMINAR_SIMPLE: 2,
    COMPLEJIDAD_PRELIMINAR_COMPLEJO: 1,
    COMPLEJIDAD_PRELIMINAR_CRIMINALIDAD_ORGANIZADA: 3,
});
const ETAPA_TRAMITE = Object.freeze({
    ETAPA_CALIFICACION: '01',
    ETAPA_PRELIMINAR: '02',
    ETAPA_PREPARATORIA: '03',
    ETAPA_INTERMEDIA: '04',
    ETAPA_JUZGAMIENTO: '05',
    ETAPA_EJECUCION_SENTENCIA: '06',
    ETAPA_INCOACION_PROCESO_INMEDIATO: '07',
    ETAPA_JUICIO_INMEDIATO: '08',
    ETAPA_EJECUCION_SENTENCIA_ESPECIAL: '09',
    ETAPA_JUZGAMIENTO_PROGRAMACION: '10',
    ETAPA_JUZGAMIENTO_DESARROLLO: '11',
    ETAPA_JUZGAMIENTO_SENTENCIA: '12',
    ETAPA_JUICIO_INMEDIATO_PROGRAMACION: '13',
    ETAPA_JUICIO_INMEDIATO_DESARROLLO: '14',
    ETAPA_JUICIO_INMEDIATO_SENTENCIA: '15'
});
var TipoProceso;
(function (TipoProceso) {
    TipoProceso[TipoProceso["Comun"] = 1] = "Comun";
    TipoProceso[TipoProceso["Especial"] = 2] = "Especial";
})(TipoProceso || (TipoProceso = {}));
const COMPLEJIDAD_VALOR_MAX = Object.freeze({
    COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_DIA: 120,
    COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_MES: 4,
    COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_ANIO: 1,
    COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_DIA: 240,
    COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_MES: 8,
    COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_ANIO: 1,
    COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_DIA: 1080,
    COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_MES: 36,
    COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_ANIO: 3,
});
const UNIDAD_MEDIDA = Object.freeze({
    UNIDAD_MEDIDA_DIAS: 2,
    UNIDAD_MEDIDA_MESES: 3,
    UNIDAD_MEDIDA_ANIOS: 4,
});
const SEDES = Object.freeze({
    SEDE_FISCALIA: 1,
    SEDE_PNP: 2,
});
const COMPLIJIDAD_POR_DEFECTO = Object.freeze({
    COMPLIJIDAD_SIMPLE: 15,
    COMPLIJIDAD_COMPLEJO: 30,
    COMPLIJIDAD_CRIMEN_ORGANIZADA: 30,
});
const TIEMPO_CONSULTAS_CASOS = Object.freeze({
    SEISMESES: 180,
    TODOS: 0,
});
const ASIGNACION_TEMPORAL = 2;
const DISTRITO_FISCAL_LIMA_CENTRO = 2;
const TIPO_ESPECIALIDAD_PENAL = 1;
const ESPECIALIDAD_COMUN = '001';
const ESPECIALIDAD_VIOLENCIA_MUJER = '002';
const ESPECIALIDAD_TRATA_PERSONA = '003';
const ESPECIALIDAD_TRAFICO_ILICITO_DROGAS = '004';
const ESPECIALIDAD_TERRORISMO = '005';
const ESPECIALIDAD_LAVADO_ACTIVOS = '006';
const TIPO_DERIVACION = Object.freeze({
    DERIVACION_INTERNA: 783,
    ACUMULACION_INTERNA: 784,
    DERIVACION_EXTERNA: 823,
    ACUMULACION_EXTERNA: 785,
});
const ETAPAS_CASO = Object.freeze({
    PREPARATORIA: '18101011101020661',
});
const ID_TRAMITE_INICIO_DILIGENCIAS_PREELIMINARES = '045';
const ID_ACTO_PROC_CONFI_INICIO_DILIGENCIAS_PREELIMINARES = '1010101110101';
const ACTO_TRAMITE_ESTADO = Object.freeze({
    DISPOSICION_DESACUMULACION: '00004510100111010100026001000',
});
const TIPO_COPIA = Object.freeze({
    COPIA_DE_COPIA: '347',
    COPIA_AUTENTICADA: '348',
});
const CONSULTA_CASO_RANGO_FECHA = 6; /*6 Meses*/
var ActoProcesal;
(function (ActoProcesal) {
    ActoProcesal["ReaperturaDeInvestigacion"] = "000108101001110101,000108101001110102";
})(ActoProcesal || (ActoProcesal = {}));
const icono = (name) => {
    return `assets/icons/${name}.svg`;
};
const RES_1ERA_INSTANCIA = Object.freeze({
    FUNDADO: 1047,
    INFUNDADO: 1048,
    FUNDADO_PARTE: 1492,
});
const RSP_1ERA_INSTANCIA = Object.freeze({
    DENIEGA_APELACION: 1051,
    CONCEDE_APELACION: 1050,
    CONSENTIDO: 1049,
});
const TIPO_OFICIO = Object.freeze({
    NUEVO: 633,
    REITERATIVO: 634,
});
const TIPO_MEDIDA_COERCION = Object.freeze({
    PERSONAL: 1110,
    REAL: 1111,
});
const MEDIDA_COERCION = Object.freeze({
    ARRESTO_DOMICILIARIO: 1,
    COMPARECENCIA_RESTRICCIONES: 2,
    COMPARECENCIA_SIMPLE: 3,
    IMPEDIMENTO_SALIDA: 4,
    INTERNACION_PREVENTIVA: 5,
    PRISION_PREVENTIVA: 6,
    DESALOJO: 7,
    CAUCION: 8,
    EMBARGO: 9,
    INCAUTACION: 10
});

var TIPO_RESULTADO_INSTANCIA;
(function (TIPO_RESULTADO_INSTANCIA) {
    TIPO_RESULTADO_INSTANCIA["FUNDADO"] = "1047";
    TIPO_RESULTADO_INSTANCIA["INFUNDADO"] = "1048";
})(TIPO_RESULTADO_INSTANCIA || (TIPO_RESULTADO_INSTANCIA = {}));
var CUADERNO_TIPO_MEDIDA;
(function (CUADERNO_TIPO_MEDIDA) {
    CUADERNO_TIPO_MEDIDA["PRISION_PREVENTIVA"] = "PP";
    CUADERNO_TIPO_MEDIDA["PROLONGACION"] = "PR";
    CUADERNO_TIPO_MEDIDA["CESACION"] = "C";
    CUADERNO_TIPO_MEDIDA["ADECUACION"] = "A";
})(CUADERNO_TIPO_MEDIDA || (CUADERNO_TIPO_MEDIDA = {}));

const MODULE_CODE = Object.freeze({
    NO_ENCONTRADO: '00',
    INICIO: '26',
    ADMINISTRAR_CASOS: '28',
    DOCUMENTO_INGRESADOS: '50',
    DENUNCIA_MAGISTRADOS: '46',
    BANDEJA_TRAMITES: '24',
    REPORTES: '25',
    ASIGNACION: '26',
    NOTIFICACIONES: '31',
    MESA_TURNO: '28',
    MESA_DESPACHO: '28',
    MESA_UNICA: '28',
    ADMINISTRAR_CASOS_SUPERIOR: '28',
    INDICADOR: '40',
});
const modules = [
    { code: MODULE_CODE.NO_ENCONTRADO, name: 'notFound' },
    { code: MODULE_CODE.INICIO, name: 'inicio' },
    { code: MODULE_CODE.ADMINISTRAR_CASOS, name: 'administracion-casos' },
    { code: MODULE_CODE.DOCUMENTO_INGRESADOS, name: 'documentos-ingresados' },
    { code: MODULE_CODE.DENUNCIA_MAGISTRADOS, name: 'denuncias-magistrados' },
    { code: MODULE_CODE.BANDEJA_TRAMITES, name: 'bandeja-tramites' },
    { code: MODULE_CODE.REPORTES, name: 'reportes' },
    { code: MODULE_CODE.ASIGNACION, name: 'asignacion' },
    { code: MODULE_CODE.NOTIFICACIONES, name: 'notificaciones' },
    { code: MODULE_CODE.MESA_UNICA, name: 'mesa-unica' },
    { code: MODULE_CODE.MESA_TURNO, name: 'mesa-turno' },
    { code: MODULE_CODE.MESA_DESPACHO, name: 'mesa-despacho' },
    {
        code: MODULE_CODE.ADMINISTRAR_CASOS_SUPERIOR,
        name: 'administracion-casossuperior',
    },
    { code: MODULE_CODE.INDICADOR, name: 'indicador' },
];
// export const modules = [
//   { code: '00', name: 'notFound' },
//   { code: '26', name: 'inicio' },
//   { code: '28', name: 'administracion-casos' },
//   { code: '50', name: 'documentos-ingresados' },
//   { code: '46', name: 'denuncias-magistrados' },
//   { code: '24', name: 'bandeja-tramites' },
//   { code: '25', name: 'reportes' },
//   { code: '26', name: 'asignacion' },
//   { code: '31', name: 'notificaciones' },
//   { code: '28', name: 'mesa-turno' },
//   { code: '28', name: 'administracion-casossuperior' },
//   { code: '40', name: 'indicador' },
// ];

const TIPO_CEDULA = Object.freeze({
    NOTIFICACION: 'N',
    CITACION: 'C',
});
const MODALIDAD_CITACION = Object.freeze({
    PRESENCIAL: 'Presencial',
    VIRTUAL: 'Virtual',
});
const DATOS_INICIALES_ORDEN = {
    idCaso: '',
    idOrdenBD: '',
    idMovimientoCaso: '',
    codigoCaso: '',
    codigoFiscalia: '',
    anhoRegistro: '',
    numeroCaso: '',
    numeroCuaderno: '',
    nombreFiscalOrden: '',
    despachoFiscalOrden: '',
    fiscaliaOrden: '',
    direccionDespachoOrden: '',
    telefonoDespachoOrden: '',
    anexoDespachoOrden: '',
    idFinalidadOrden: 0,
    finalidadOrden: '',
    idTipoDocumentoOrden: 0,
    descripcionTipoDocumentoOrden: '',
    numeroDocumentoOrden: '',
    fechaEmisionDocumentoOrden: '',
    numeroFojasOrden: '',
    descripcionOrden: '',
    archivosAdjuntosEfe: [],
    archivosAdjuntosGenerador: [],
    personasANotificar: [],
};
const FINALIDAD_CITACION = Object.freeze({
    //Caso 1
    APERTURA_INVESTIGACION: 10,
    AUDIENCIA: 11,
    CITACION_DECLARACION: 20,
    CONSTATACIONES_INSPECCION: 22,
    DISPOSICION_INVESTIGACION: 23,
    PRINCIPIO_OPORTUNIDAD: 25,
    //Caso 2
    CAMARA_GESELL_ABOGADO_DETENIDO: 15,
    CAMARA_GESELL_AGRAVIADO_MAYOR_EDAD: 16,
    CAMARA_GESELL_AGRAVIADO_MENOR_EDAD: 17,
    CAMARA_GESELL_APODERADO: 18,
    //Caso 3
    AUDIENCIA_CONCILIACION: 12,
    //Caso 4
    CAMARA_GESELL: 13,
    //Caso 5
    CAMARA_GESELL_ABOGADO_DEFENSOR_IMPUTADO: 14,
    //Caso 6
    CAMARA_GESELL_IMPUTADO: 19,
    //Caso 7
    CITACION_PREEXISTENCIA: 21,
});
const NUMEROS_CITACION = [
    { id: 'Primera citación', nombre: 'Primera citación' },
    { id: 'Segunda citación', nombre: 'Segunda citación' },
];
const DATOS_INICIALES_CEDULA = {
    finalidad: null,
    urgencia: null,
    nombreFiscal: '',
    descripcion: '',
    modalidadCitacion: 'Presencial',
    direccionCitacion: '',
    direccionUrlCitacion: '',
    referenciaCitacion: '',
    camaraGesellCitacion: null,
    agraviadoCitacion: null,
    denunciadoCitacion: null,
    personaSolicitanteCitacion: null,
    motivoConciliacionCitacion: '',
    numeroCitacion: null,
    documentoARecibir: '',
    diasHabiles: '',
    fechaCitacion: undefined,
    horaCitacion: undefined,
};
const TIPO_SUJETOS_PROCESALES = Object.freeze({
    TODOS: 0,
    AGRAVIADOS: 1,
    DENUNCIADOS: 2,
    DENUNCIANTE: 3,
});
const FINALIDADES_CASO_1 = [
    FINALIDAD_CITACION.APERTURA_INVESTIGACION,
    FINALIDAD_CITACION.AUDIENCIA,
    FINALIDAD_CITACION.CITACION_DECLARACION,
    FINALIDAD_CITACION.CONSTATACIONES_INSPECCION,
    FINALIDAD_CITACION.DISPOSICION_INVESTIGACION,
    FINALIDAD_CITACION.PRINCIPIO_OPORTUNIDAD,
];
const FINALIDADES_CASO_2 = [
    FINALIDAD_CITACION.CAMARA_GESELL_ABOGADO_DETENIDO, //Caso 2
    FINALIDAD_CITACION.CAMARA_GESELL_AGRAVIADO_MAYOR_EDAD, //Caso 2
    FINALIDAD_CITACION.CAMARA_GESELL_AGRAVIADO_MENOR_EDAD, //Caso 2
    FINALIDAD_CITACION.CAMARA_GESELL_APODERADO, //Caso 2
];
const FINALIDADES_CASO_4_5_6 = [
    FINALIDAD_CITACION.CAMARA_GESELL, // Caso 4
    FINALIDAD_CITACION.CAMARA_GESELL_ABOGADO_DEFENSOR_IMPUTADO, //Caso 5
    FINALIDAD_CITACION.CAMARA_GESELL_IMPUTADO, // Caso 6
];
const FINALIDADES_GESELL = [
    ...FINALIDADES_CASO_2,
    ...FINALIDADES_CASO_4_5_6,
];
const RESPUESTA_MODAL = Object.freeze({
    OK: 'Ok',
    ERROR: 'Error',
});
const MEDIO_NOTIFICACION = Object.freeze({
    DESPACHO: '2',
});
const ESTADO_CEDULA = Object.freeze({
    POR_GENERAR: 0,
    GENERADO: 1,
    ENVIADO: 2,
    ANULADO: 3,
});
const DATOS_INICIALES_INFORMACION_ORDEN = {
    numeroCaso: '-',
    nombreFiscal: '-',
    numeroDocumento: '-',
    tipoDocumento: '-',
    tramite: '-',
    finalidad: '-',
    fechaEmision: '-',
    numeroFolios: '-',
    descripcion: '-',
};
const MENSAJE_ERROR_INESPERADO = 'HA OCURRIDO UN ERROR INESPERADO. INTENTE NUEVAMENTE.';
const ESTADOS_CEDULA = {
    GENERADO: 'Generado',
    ENVIADO: 'Enviado',
    DERIVADO: 'Derivado',
    RECUPERADO: 'Recuperado',
    RECHAZADO: 'Rechazado',
    DEVUELTO: 'Devuelto',
    OBSERVADO: 'Observado',
    PENDIENTE: 'Pendiente',
    PRIMERA_VISITA: 'Primera Visita',
    SEGUNDA_VISITA: 'Segunda Visita',
    BAJO_PUERTA: 'Bajo Puerta',
    LEIDO: 'Leído',
};
const DE_MEDIO_NOTIFICACION = {
    DESPACHO: 'EN DESPACHO',
    CENTRAL: 'CENTRAL DE NOTIFICACIONES',
    CASILLA: 'CASILLA ELECTRÓNICA',
};
const VISOR_ESTADO = {
    VISUALIZAR: 'visualizar',
    FIRMADO: 'firmado',
    NOFIRMADO: 'nofirmado',
};
const MEDIO_NOTIFICACION_ID = {
    DESPACHO: 2,
    CENTRAL: 3,
    CASILLA: 4,
};
const TIPO_DOCUMENTO = {
    CEDULA_NOTIFICACION: 10,
    CEDULA_CITACION: 11,
    CARGO_NOTIFICACION: 12,
    CARGO_CITACION: 13,
};
const SUBJECT_TYPES = {
    naturalPerson: 4,
    legalPerson: 9,
    stateEntity: 10,
};

const SYSTEM = Object.freeze({
    EFE: '145',
    MTU: '147',
    MDE: '203',
    MUP: '200',
    GEN: '155',
    CEN: '0009',
    CAS: 'XYZ',
    IOP: 'XYZ',
});
const SYSTEM_CODE = [
    SYSTEM.EFE,
    SYSTEM.MTU,
    SYSTEM.MDE,
    SYSTEM.MUP,
    SYSTEM.GEN,
    SYSTEM.CEN,
    SYSTEM.CAS,
    SYSTEM.IOP,
];

const Constante = {
    DENUNCIA_REGISTRADA: 'denunciaRegistrada',
};
const SLUG_PROFILE = Object.freeze({
    CIUDADANO: 1,
    PNP: 2,
    ENTIDAD: 3,
    PJ: 4,
    MP: 21,
});
const CODIGO_TIPO_DOCUMENTO = Object.freeze({
    DNI: 1,
    RUC: 2,
    PASAPORTE: 4,
    CE: 5,
});
function getGeneroAbreviado(id) {
    switch (id) {
        case 1:
            return 'M';
        case 211:
            return 'M';
        case 2:
            return 'F';
        case 212:
            return 'F';
        default:
            return '';
    }
}
const TIPO_PARTE = {
    3: 'DENUNCIANTE',
    2: 'DENUNCIADO',
    1: 'AGRAVIADO',
};
const SLUG_TIPO_PARTE = Object.freeze({
    DENUNCIANTE: 'DENUNCIANTE',
    DENUNCIADO: 'DENUNCIADO',
    AGRAVIADO: 'AGRAVIADO',
});
const SLUG_ERROR_RENIEC = Object.freeze({
    DNI_INVALIDO: '42202015',
    SERVICIO_RENIEC_NO_DISPONIBLE: '42202017',
});
const SLUG_TIPO_PARTE_CODE = Object.freeze({
    AGRAVIADO: 1,
    DENUNCIADO: 2,
    DENUNCIANTE: 3,
});
const SLUG_ERROR_RENIEC_CODE = Object.freeze({
    CODE_DNI_INVALIDO: '42202015',
});
const SLUG_ENTITY = Object.freeze({
    JURIDICA: 175,
    PROCURADURIA: 173,
    CEM: 174,
});
const SLUG_ENTITY_MP = Object.freeze({
    RAZON_SOCIAL: 'MINISTERIO PÚBLICO - GERENCIA GENERAL',
    RUC: '20131370301',
    MP: 2,
});
const SLUG_TIPO_RIESGOS_KEY = Object.freeze({
    LEVE: 'LEVE',
    MODERADO: 'MODERADO',
    SEVERO: 'SEVERO',
});
const SLUG_TIPO_RIESGOS = Object.freeze({
    LEVE: 'Leve',
    MODERADO: 'Moderado',
    SEVERO: 'Severo',
});
const SLUG_TIPO_VIOLENCIA = Object.freeze({
    FISICA: 'Física',
    PSICOLOGICA: 'Psicológica',
    SEXUAL: 'Sexual',
    PATRIMONIAL: 'Patrimonial',
});
const SLUG_TIPO_VIOLENCIA_KEY = Object.freeze({
    FISICA: 'FISICA',
    PSICOLOGICA: 'PSICOLOGICA',
    SEXUAL: 'SEXUAL',
    PATRIMONIAL: 'PATRIMONIAL',
});
const SLUG_PENDING_RESPONSE = Object.freeze({
    NEW: 'E',
    CONTINUE: 'C',
});
const SLUG_CONFIRM_RESPONSE = Object.freeze({
    OK: 'OK',
    CANCEL: 'CANCEL',
    ALL: 'ALL',
    VALIDATION: 'VALIDATION',
});
const SLUG_INVOLVED = Object.freeze({
    AGRAVIADO: 'agraviado',
    DENUNCIADO: 'denunciado',
    DENUNCIANTE: 'denunciante',
});
const SLUG_INVOLVED_CODE = Object.freeze({
    AGRAVIADO: 1,
    DENUNCIADO: 2,
    DENUNCIANTE: 3,
});
const SLUG_INVOLVED_ROL = Object.freeze({
    CONOCIDO: 'conocido',
    DESCONOCIDO: 'desconocido',
    // DENUNCIANTE: 'denunciante',
    // OTRO: 'otro',
    ENTIDAD: 'entidad',
    PERSONAN_NATURAL: 'persona-natural',
});
const SLUG_DOCUMENT = Object.freeze({
    DNI: 'DNI',
    RUC: 'RUC',
    CARNE_EXTRANJERIA: 'CARNE EXTRANJERIA',
    PASAPORTE: 'PASAPORTE',
    SIN_DOCUMENTO: 'SIN DOCUMENTO',
    LIBRETA_ELECTORAL: 'LIBRETA ELECTORAL',
    PERMISO_TEMPORAL_CPP: 'PERMISO TEMPORAL CPP',
    PERMISO_TEMPORAL_PTP: 'PERMISO TEMPORAL PTP',
    CARNE_IDENTIDAD: 'CARNE IDENTIDAD',
    CARNE_SOLICITANTE_REFUGIO: 'CARNE DE SOLICITANTE DE REFUGIO',
});
const SLUG_DOCUMENT_TYPE = Object.freeze({
    DNI: 1,
    RUC: 2,
    CARNE_EXTRANJERIA: 5,
    PASAPORTE: 4,
    SIN_DOCUMENTO: 3,
    LIBRETA_ELECTORAL: 6,
    PERMISO_TEMPORAL_CPP: 7,
    PERMISO_TEMPORAL_PTP: 8,
    CARNE_IDENTIDAD: 9,
    CARNE_SOLICITANTE_REFUGIO: 10,
});
const SLUG_PERSON_TYPE = Object.freeze({
    NATURAL: 1,
    JURIDICA: 2,
    ENTIDAD: 5,
    SOCIEDAD: 7,
    LQRR: 6,
    ESTADO: 4,
});
const SLUG_PERSON = Object.freeze({
    NATURAL: 'NATURAL',
    JURIDICA: 'JURIDICA',
    ENTIDAD: 'ENTIDAD',
    ESTADO: 'ESTADO',
    SOCIEDAD: 'SOCIEDAD',
    LQRR: 'LOS QUE RESULTEN RESPONSABLES (LQRR)',
});
const SLUG_OTHER = Object.freeze({
    CEM: 9999,
    PROCURADURIA: 9999,
});
const SLUG_COMPLETED = Object.freeze({
    LQRR: 'LOS QUE RESULTEN RESPONSABLES (LQRR)',
    NN: 'NN',
    PERU: 102,
});
const SLUG_INGRESO_DOCUMENTO = Object.freeze({
    NEW: 481,
    SUBSANAR: 482,
});
const SLUG_VALIDADO = Object.freeze({
    VALIDADO_SI: 1,
    VALIDADO_NO: 0,
});
const SLUG_MAX_LENGTH = Object.freeze({
    DNI: 8,
    RUC: 11,
    CARNE_EXTRANJERIA: 9, //e
    PASAPORTE: 9, //e 5-12
    LIBRETA_ELECTORAL: 7, //e
    PERMISO_TEMPORAL_CPP: 9, //e
    PERMISO_TEMPORAL_PTP: 9, //e
    CARNE_IDENTIDAD: 9, //e
    CARNE_SOLICITANTE_REFUGIO: 9, //e
    CELLPHONE: 9,
    OTHER: 15,
    BUSCAR_DELITO: 30,
});
const TIPO_PERSONA_DENUNCIA = Object.freeze({
    EXTRAJERO: 'EXT',
    PERUANO: 'PER',
});
const TIPO_NACIONALIDAD = Object.freeze({
    EXTRAJERO: 'EXTRANJERO',
    PERUANO: 'PERUANO',
});
const PARAMETRO_CONSULTA_RENIEC = Object.freeze({
    USUARIO_RENIEC: '10712325',
    CLIENTE_RENIEC: 'http/1',
    IP_RENIEC: '201.240.68.38',
});
const TIPO_PARTE_INVOLUCRADO = Object.freeze({
    DENUNCIANTE: 'Denunciante',
    AGRAVIADO: 'Agraviado',
    DENUNCIADO: 'Denunciado',
});
const DENUNCIANTE_SEXO = Object.freeze({
    MASCULINO: 'M',
    FEMENINO: 'F',
});
const DENUNCIANTE_GENERO = Object.freeze({
    MASCULINO: 'Masculino',
    FEMENINO: 'Femenino',
});
const SLUG_DENUNCIANTE_AGRAVIADO = Object.freeze({
    SI: 'SI',
    NO: 'NO',
});
const SLUG_IS_REMITENTE = Object.freeze({
    TRUE: true,
    FALSE: false,
});
const ES_TRADUCTOR = Object.freeze({
    TRADUCTOR_SI: 'SI',
    TRADUCTOR_NO: 'NO',
});
const TIPO_PERSONA_DENUNCIANTE = Object.freeze({
    PERSONA_JURIDICA: 'Persona Juridica',
    PERSONA_NATURAL: 'Persona Natural',
});
const PARAMETROS_CATALOGO_MUP = Object.freeze({
    ESTADOCIVIL: 'ID_N_EST_CIV',
    GRADOINSTRUCCION: 'ID_N_GRAD_INST',
    NACIONALIDAD: 'ID_N_NACIONALIDAD',
});
const DIGITALIZAR_DOCU = Object.freeze({
    DD: 'DIGITALIZAR_DOCU',
    PD: 'PENDIENTE_DIGITALIZAR',
});
const SLUG_COMPONENTE_MESA = Object.freeze({
    CASOS_REGISTRADOS: 1,
    PENDIENTES_DIGITALIZACION: 2,
    ADJUNTAR_DOCUMENTO: 3,
    PRESENTAR_DOCUMENTO: 4,
});
const SLUG_MOTIVO_COPIA = Object.freeze({
    COPIA_DE_COPIA: 347,
    COPIA_AUTENTICADA: 348,
});
const SLUG_NOMBRE_MOTIVO_COPIA = Object.freeze({
    ORIGINAL: 'ORIGINAL',
    COPIA_SIMPLE: 'COPIA SIMPLE',
});
const SLUG_CARGO_DIGITALIZADO = Object.freeze({
    FEDATARIO: 'Fedatario Institucional',
});
const SLUG_SIGN = Object.freeze({
    OK: 'OK',
    CANCEL: 'El proceso de firma se ha cancelado, revise el log local del ciente de firma',
});
function getProfile(id) {
    switch (id) {
        case SLUG_PROFILE.CIUDADANO === id:
            return 'CIUDADANO';
        case SLUG_PROFILE.PNP === id:
            return 'PNP';
        case SLUG_PROFILE.PJ === id:
            return 'PJ';
        case SLUG_PROFILE.ENTIDAD === id:
            return 'ENTIDAD';
        default:
            return 'CIUDADANO';
    }
}
function getTipoDocumento(id) {
    switch (id) {
        case SLUG_DOCUMENT_TYPE.DNI:
            return SLUG_DOCUMENT.DNI;
        case SLUG_DOCUMENT_TYPE.RUC:
            return SLUG_DOCUMENT.RUC;
        case SLUG_DOCUMENT_TYPE.CARNE_EXTRANJERIA:
            return SLUG_DOCUMENT.CARNE_EXTRANJERIA;
        case SLUG_DOCUMENT_TYPE.PASAPORTE:
            return SLUG_DOCUMENT.PASAPORTE;
        default:
            return SLUG_DOCUMENT.SIN_DOCUMENTO;
    }
}
function getTipoDocumentoCode(text) {
    switch (text) {
        case SLUG_DOCUMENT.DNI:
            return SLUG_DOCUMENT_TYPE.DNI;
        case SLUG_DOCUMENT.RUC:
            return SLUG_DOCUMENT_TYPE.RUC;
        case SLUG_DOCUMENT.CARNE_EXTRANJERIA:
            return SLUG_DOCUMENT_TYPE.CARNE_EXTRANJERIA;
        case 'CARNE EXTRANJERÍA':
            return SLUG_DOCUMENT_TYPE.CARNE_EXTRANJERIA;
        case SLUG_DOCUMENT.LIBRETA_ELECTORAL:
            return SLUG_DOCUMENT_TYPE.LIBRETA_ELECTORAL;
        case SLUG_DOCUMENT.PERMISO_TEMPORAL_CPP:
            return SLUG_DOCUMENT_TYPE.PERMISO_TEMPORAL_CPP;
        case SLUG_DOCUMENT.PERMISO_TEMPORAL_PTP:
            return SLUG_DOCUMENT_TYPE.PERMISO_TEMPORAL_PTP;
        case SLUG_DOCUMENT.CARNE_IDENTIDAD:
            return SLUG_DOCUMENT_TYPE.CARNE_IDENTIDAD;
        case SLUG_DOCUMENT.CARNE_SOLICITANTE_REFUGIO:
            return SLUG_DOCUMENT_TYPE.CARNE_SOLICITANTE_REFUGIO;
        case SLUG_DOCUMENT.PASAPORTE:
            return SLUG_DOCUMENT_TYPE.PASAPORTE;
        case SLUG_DOCUMENT.SIN_DOCUMENTO:
            return SLUG_DOCUMENT_TYPE.SIN_DOCUMENTO;
        default:
            return 0;
    }
}
function getTipoParte(id) {
    switch (id) {
        case SLUG_TIPO_PARTE_CODE.DENUNCIANTE:
            return SLUG_TIPO_PARTE.DENUNCIANTE;
        case SLUG_TIPO_PARTE_CODE.DENUNCIADO:
            return SLUG_TIPO_PARTE.DENUNCIADO;
        case SLUG_TIPO_PARTE_CODE.AGRAVIADO:
            return SLUG_TIPO_PARTE.AGRAVIADO;
        default:
            return '';
    }
}
function getTipoParteCode(text) {
    switch (text) {
        case SLUG_TIPO_PARTE.DENUNCIANTE:
            return SLUG_TIPO_PARTE_CODE.DENUNCIANTE;
        case SLUG_TIPO_PARTE.DENUNCIADO:
            return SLUG_TIPO_PARTE_CODE.DENUNCIADO;
        case SLUG_TIPO_PARTE.AGRAVIADO:
            return SLUG_TIPO_PARTE_CODE.AGRAVIADO;
        default:
            return 0;
    }
}
const SLUG_MESA_PARTES = Object.freeze({
    ELECTRONICA: 1,
    UNICA: 2,
    DESPACHO: 3,
});
function getErrorReniec(id) {
    switch (id) {
        case SLUG_ERROR_RENIEC_CODE.CODE_DNI_INVALIDO:
            return SLUG_ERROR_RENIEC.DNI_INVALIDO;
        default:
            return '';
    }
}
const TIPO_DOCUMENTO_IDENTIDAD = Object.freeze({
    DNI: 1,
    RUC: 2,
    SD: 3,
    PASAPORTE: 4,
    CE: 5,
    CPP: 6,
    LE: 7,
    PARTIDA: 8,
    CI: 9,
    LM: 11,
    CEPR: 13,
    PTP: 14,
});
const TIPO_EXTENSION_DOCUMENTO = Object.freeze({
    PDF: 438,
    DOC: 436,
});
const TIPO_TRAMITE = Object.freeze({
    NUEVO_DOCUMENTO: 481,
    SUBSANAR_DOCUMENTO: 482,
});
const TIPO_ACCION_ESTADO = Object.freeze({
    REGISTRA_DOCUMENTO_DESPACHO: 65,
    REGISTRA_DOCUMENTO_ELECTRONICA: 64,
});
const TIPO_ACCION_FIRMA = Object.freeze({
    FIRMADO: 468,
    VISADO: 469,
});
const TIPO_MESA = Object.freeze({
    POR_ASIGNAR: 'POR ASIGNAR',
    MD: 'MD',
    MUP: 'MUP',
});
const MOTIVO_INGRESOS = Object.freeze({
    MOTIVO_INGRESO_PN: ' – POLICÍA NACIONAL DEL PERÚ',
    MOTIVO_INGRESO_CIU: ' – DENUNCIANTE DE PARTE',
    MOTIVO_INGRESO_PJ: ' – PODER JUDICIAL',
    MOTIVO_INGRESO_ENTIDAD: ' – ENTIDAD',
    MOTIVO_INGRESO_MP: ' – MINISTERIO PÚBLICO',
});
const validMaxLengthCustom = (field = 'dni', root) => {
    let value = '';
    let maxLength = 0;
    let control = null;
    switch (field) {
        case 'txtAbogadoDni':
            control = root.formAbogado.get(field);
            maxLength = 8;
            break;
        case 'txtNombreAbogado':
            control = root.formAbogado.get(field);
            maxLength = 60;
            break;
        case 'txtApePatAbogado':
            control = root.formAbogado.get(field);
            maxLength = 40;
            break;
        case 'txtApeMatAbogado':
            control = root.formAbogado.get(field);
            maxLength = 40;
            break;
        case 'dni':
        case 'dnipnp':
        case 'dnipj':
        case 'dniMp':
        case 'dniEntidad':
            if (root.TIPO_USUARIO_DENUNCIANTE === 'CIU') {
                control = root.validarFormCiudadano.get(field);
            }
            if (root.TIPO_USUARIO_DENUNCIANTE === 'PNP') {
                control = root.validarFormPerfilPNP.get(field);
            }
            if (root.TIPO_USUARIO_DENUNCIANTE === 'PJU') {
                control = root.poderJudicialForm.get(field);
            }
            if (root.TIPO_USUARIO_DENUNCIANTE === 'ENT') {
                control = root.validarFormEntidad.get(field);
            }
            if (root.TIPO_USUARIO_DENUNCIANTE === 'MIN') {
                control = root.validarFormMP.get(field);
            }
            maxLength = 8;
            break;
        case 'ce':
        case 'txtNombreCiudadano':
            control = root.validarFormCiudadano.get(field);
            maxLength = 60;
            break;
        case 'txtApePaternoCiudadano':
            control = root.validarFormCiudadano.get(field);
            maxLength = 40;
            break;
        case 'txtApeMaternoCiudadano':
            control = root.validarFormCiudadano.get(field);
            maxLength = 40;
            break;
        case 'documCe':
            if (root.TIPO_USUARIO_DENUNCIANTE === 'CIU') {
                control = root.validarFormCiudadano.get(field);
            }
            maxLength = 12;
            break;
        case 'collegeCode':
        case 'collegeCodePj':
        case 'codigoCip':
        case 'entidadCollegeCodePeJu':
        case 'numeroExpediente':
            if (root.TIPO_USUARIO_DENUNCIANTE === 'CIU') {
                control = root.validarFormCiudadano.get(field);
            }
            if (root.TIPO_USUARIO_DENUNCIANTE === 'PNP') {
                control = root.validarFormPerfilPNP.get(field);
            }
            if (root.TIPO_USUARIO_DENUNCIANTE === 'PJU') {
                control = root.poderJudicialForm.get(field);
            }
            if (root.TIPO_USUARIO_DENUNCIANTE === 'ENT') {
                control = root.validarFormEntidad.get(field);
            }
            maxLength = 30;
            break;
        case 'informePolicial':
            control = root.validarFormPerfilPNP.get(field);
            maxLength = 60;
            break;
        case 'numeroDependencia':
            control = root.validarFormPerfilPNP.get(field);
            maxLength = 5;
            break;
        case 'ruc':
            control = root.validarFormEntidad.get(field);
            maxLength = 11;
            break;
        case 'txtEmailAbogado':
            control = root.formAbogado.get(field);
            maxLength = 100;
            break;
        case 'txtColegioAbogado':
            control = root.formAbogado.get(field);
            maxLength = 5;
            break;
        case 'txtDocExtrajero':
        case 'txtDocExtrajeroPn':
        case 'txtDocExtrajeroPj':
        case 'dniEntidadPasaporte':
            control = root.validarFormCiudadano.get(field);
            if (root.TIPO_USUARIO_DENUNCIANTE === 'PNP') {
                control = root.validarFormPerfilPNP.get(field);
            }
            if (root.TIPO_USUARIO_DENUNCIANTE === 'PJU') {
                control = root.poderJudicialForm.get(field);
            }
            if (root.TIPO_USUARIO_DENUNCIANTE === 'ENT') {
                control = root.validarFormEntidad.get(field);
            }
            maxLength = 20;
            break;
        case 'txtAnexos':
        case 'txtFolios':
            control = root.anexosForm.get(field);
            maxLength = 6;
            break;
        case 'obsAnexos':
            control = root.anexosForm.get(field);
            maxLength = 1000;
            break;
        case 'txtCelularAbogado':
            control = root.formAbogado.get(field);
            maxLength = 9;
            break;
        case 'anexoPnp':
        case 'phoneCiudadanoPn':
            control = root.validarFormPerfilPNP.get(field);
            maxLength = 9;
            break;
        case 'phone':
            control = root.validarFormCiudadano.get(field);
            maxLength = 9;
            break;
        case 'celularEntidad':
            control = root.validarFormEntidad.get(field);
            maxLength = 9;
            break;
        case 'phoneMp':
            control = root.validarFormMP.get(field);
            maxLength = 9;
            break;
        case 'nroOficioMp':
            control = root.validarFormMP.get(field);
            maxLength = 30;
            break;
        case 'anexoComisaria':
            control = root.validarFormPerfilPNP.get(field);
            maxLength = 4;
            break;
        case 'email':
            control = root.validarFormCiudadano.get(field);
            maxLength = 100;
            break;
        case 'emailEntidad':
            control = root.validarFormEntidad.get(field);
            maxLength = 100;
            break;
        case 'emailPj':
            control = root.poderJudicialForm.get(field);
            maxLength = 100;
            break;
        case 'emailCiudadanoPn':
            control = root.validarFormPerfilPNP.get(field);
            maxLength = 100;
            break;
        case 'emailPnp':
            control = root.validarFormPerfilPNP.get(field);
            maxLength = 100;
            break;
        case 'phonePj':
        case 'txtCelularPj':
            control = root.poderJudicialForm.get(field);
            maxLength = 9;
            break;
        default:
            control = root.dynamicValidationForm.get(field);
            maxLength = field === 'dniDigit' ? 1 : 6;
            break;
    }
    value = control.value;
    value.length > maxLength && control.setValue(value.slice(0, maxLength));
};

const ID_ETAPA = Object.freeze({
    CALI: '01',
    PREL: '02',
    PREP: '03',
    INTE: '04',
    JUZG: '05',
    EJEC: '06',
});
var TipoOpcionCasoFiscal;
(function (TipoOpcionCasoFiscal) {
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["Ninguna"] = 0] = "Ninguna";
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["Calificacion"] = 1] = "Calificacion";
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["Preliminar"] = 2] = "Preliminar";
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["Preparatoria"] = 3] = "Preparatoria";
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["Intermedia"] = 4] = "Intermedia";
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["Juzgamiento"] = 5] = "Juzgamiento";
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["Ejecucion"] = 6] = "Ejecucion";
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["Impugnacion"] = 7] = "Impugnacion";
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["ProcesosEspeciales"] = 8] = "ProcesosEspeciales";
    TipoOpcionCasoFiscal[TipoOpcionCasoFiscal["Concluidos"] = 9] = "Concluidos";
})(TipoOpcionCasoFiscal || (TipoOpcionCasoFiscal = {}));
const ETAPA = [
    {
        id: ID_ETAPA.CALI,
        nombre: 'Calificación',
        path: 'calificacion',
        tipoOpcion: TipoOpcionCasoFiscal.Calificacion,
    },
    {
        id: ID_ETAPA.PREL,
        nombre: 'Preliminar',
        path: 'preliminar',
        tipoOpcion: TipoOpcionCasoFiscal.Preliminar,
    },
    {
        id: ID_ETAPA.PREP,
        nombre: 'Preparatoria',
        path: 'preparatoria',
        tipoOpcion: TipoOpcionCasoFiscal.Preparatoria,
    },
    {
        id: ID_ETAPA.INTE,
        nombre: 'Intermedia',
        path: 'intermedia',
        tipoOpcion: TipoOpcionCasoFiscal.Intermedia,
    },
    {
        id: ID_ETAPA.JUZG,
        nombre: 'Juzgamiento',
        path: 'juzgamiento',
        tipoOpcion: TipoOpcionCasoFiscal.Juzgamiento,
    },
    {
        id: ID_ETAPA.EJEC,
        nombre: 'Ejecución',
        path: 'ejecucion',
        tipoOpcion: TipoOpcionCasoFiscal.Ejecucion,
    },
];
function etapaInfo(id) {
    return ETAPA.find((etapa) => etapa.id === id);
}
// BANDEJA DE TRÁMITES
const TRAMITE_TIPO_CUADERNO = Object.freeze({
    TRAMITE_CUADERNOS_INCIDENTALES: 541,
    TRAMITE_CUADERNOS: 542,
    TRAMITE_CUADERNOS_EJECUCION: 543,
    TRAMITE_CARPETA_PRINCIPAL: 683,
});
const TRAMITE_TIPO_CUADERNO_FILTRO = [
    { codigo: 0, descripcion: 'Todos', color: '', seleccionado: false },
    {
        codigo: TRAMITE_TIPO_CUADERNO.TRAMITE_CARPETA_PRINCIPAL,
        descripcion: 'Trámites en carpeta principal',
        color: '',
        seleccionado: false,
    },
    {
        codigo: TRAMITE_TIPO_CUADERNO.TRAMITE_CUADERNOS_INCIDENTALES,
        descripcion: 'Trámites de cuadernos incidentales',
        color: 'blue',
        seleccionado: false,
    },
    {
        codigo: TRAMITE_TIPO_CUADERNO.TRAMITE_CUADERNOS,
        descripcion: 'Trámites de cuadernos',
        color: 'orange',
        seleccionado: false,
    },
    {
        codigo: TRAMITE_TIPO_CUADERNO.TRAMITE_CUADERNOS_EJECUCION,
        descripcion: 'Trámites de cuadernos de ejecución',
        color: 'red',
        seleccionado: false,
    },
];
const TipoOpcionCasoFiscalRuta = {
    [TipoOpcionCasoFiscal.Concluidos]: 'concluidos',
};

class DateUtil {
    constructor() {
        /**
        * Permite formatear una fecha en formato YYYY-MM-DD HH:mm:ss a una cadena en formato DD MM YYYY HH:mm a.m./p.m.
        * Ejemplo: 2023-05-15 14:30:00 a 15 May 2023 02:30 p.m.
        *
        * @param fechaHora
        * @returns string
        */
        this.formatearFechaHoraAbreviada = (fechaHora) => {
            if (fechaHora === null || fechaHora === undefined) {
                return '-';
            }
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const fecha = new Date(fechaHora);
            if (isNaN(fecha.getTime())) {
                throw new Error(`Formato de fecha no válido: "${fechaHora}". Se esperaba un formato como 'YYYY-MM-DD' o 'YYYY-MM-DD HH:mm:ss'.`);
            }
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = meses[fecha.getMonth()];
            const anio = fecha.getFullYear();
            const horas = fecha.getHours();
            const minutos = fecha.getMinutes().toString().padStart(2, '0');
            const periodo = horas >= 12 ? 'p.m.' : 'a.m.';
            const horasFormateadas = (horas % 12 || 12).toString().padStart(2, '0');
            if (fechaHora.length <= 10) {
                return `${dia} ${mes} ${anio}`;
            }
            return `${dia} ${mes} ${anio} ${horasFormateadas}:${minutos} ${periodo}`;
        };
    }
    // TODO: Ref cfng-core-lib - obtenerTiempoTranscurrido_DHS
    obtenerTiempoTranscurrido_DHS(fechaInicio) {
        const start = new Date(fechaInicio);
        const end = new Date();
        let difference = Math.abs(end.valueOf() - start.valueOf());
        let days = Math.floor(difference / (1000 * 60 * 60 * 24));
        let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        return days + 'd ' + hours + 'h ' + minutes + 'm';
    }
    // TODO: Ref cfng-core-lib - obtenerFormatoFecha_DDMMYYYY
    obtenerFormatoFecha_DDMMYYYY(date) {
        if (typeof date === 'string') {
            const partesFecha = date.split('/');
            const dia = parseInt(partesFecha[0], 10);
            const mes = parseInt(partesFecha[1], 10) - 1;
            const anio = parseInt(partesFecha[2], 10);
            date = new Date(dia, mes, anio);
        }
        if (!isNaN(date.getTime())) {
            const day = ("0" + date.getDate()).slice(-2);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        else {
            console.error('Formato de fecha inválida: :', date);
            return '-';
        }
    }
    // TODO: Ref cfng-core-lib - validarFormatoHora
    validarFormatoHora(event) {
        const code = (event.which) ? event.which : event.keyCode;
        if (code == 8) {
            return true;
        }
        else
            return code >= 48 && code <= 58;
    }
    // TODO: Ref cfng-core-lib - calcularDiasFecha
    calcularDiasFecha(date) {
        let dateArray = date.split("/");
        return (dateArray[0] * 1) + (dateArray[1] * 1) * 30 + (dateArray[2] * 1) * 360;
    }
    obtenerFormatoFechaFromDate_DDMMYYYY(fecha) {
        if (fecha !== undefined || fecha !== null) {
            let fe = new Date(fecha);
            const dia = fe.getDate();
            const mes = fe.getMonth() + 1;
            const anio = fe.getFullYear();
            const mesFormateado = mes < 10 ? `0${mes}` : mes.toString();
            const diaFormateado = dia < 10 ? `0${dia}` : dia.toString();
            const fechaFormateada = `${diaFormateado}/${mesFormateado}/${anio}`;
            return fechaFormateada;
        }
        else {
            return '-';
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DateUtil, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DateUtil, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DateUtil, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });
const formatDateToAbbreviated = (input) => {
    if (input === '' || input === undefined)
        return '';
    const months = {
        '01': 'Ene.',
        '02': 'Feb.',
        '03': 'Mar.',
        '04': 'Abr.',
        '05': 'May.',
        '06': 'Jun.',
        '07': 'Jul.',
        '08': 'Ago.',
        '09': 'Sep.',
        '10': 'Oct.',
        '11': 'Nov.',
        '12': 'Dic.',
    };
    const [day, month, year] = input.split('/');
    const formattedMonth = months[month];
    return `${parseInt(day)} ${formattedMonth} ${year}`;
};
const convertTo12HourFormat = (input) => {
    if (input === '' || input === undefined)
        return '';
    const [hour, minutes] = input.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${hour12}:${minutes} ${ampm}`;
};
const convertTo24HourFormat = (input) => {
    const [hours, minutes] = input.split(':').map(Number);
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    if (hours === 0 && minutes < 60) {
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')} ${ampm}`;
    }
    let hours12 = hours % 12;
    hours12 = hours12 ? hours12 : 12;
    return `${hours12.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')} ${ampm}`;
};
const obtenerFechaLetras = (fecha) => {
    const nombreDiaSemana = format(fecha, 'EEEE', { locale: es });
    const dia = format(fecha, 'd', { locale: es });
    const mes = format(fecha, 'MMMM', { locale: es });
    const anho = format(fecha, 'y', { locale: es });
    return `${nombreDiaSemana} ${dia} DE ${mes.toUpperCase()} DE ${anho}`?.toUpperCase();
};
const obtenerHoraAMPM = (fecha) => {
    const hora = getHours(fecha);
    const minutos = getMinutes(fecha);
    const ampm = hora >= 12 ? 'P.M.' : 'A.M.';
    const hora12 = hora > 12 ? hora - 12 : hora === 0 ? 12 : hora;
    return `${hora12.toString().padStart(2, '0')}:${minutos
        .toString()
        .padStart(2, '0')} ${ampm}`;
};
const getYYMMDDDashedToDDMMYYSlash = (dateStr) => {
    if (!dateStr)
        return null;
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};
const obtenerFechaDDMMYYYY = (fecha) => {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anho = fecha.getFullYear();
    return `${dia}/${mes}/${anho}`;
};
const obtenerFechaTipoDate = (fecha) => {
    const partes = fecha.split('/');
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const anho = parseInt(partes[2], 10);
    return new Date(anho, mes, dia);
};
const obtenerHoraHH24MI = (fecha) => {
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
};
const obtenerHoraTipoDate = (hora) => {
    const [horas, minutos] = hora
        .split(':')
        .map((partes) => parseInt(partes, 10));
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), horas, minutos);
};
const getLeadingZero = (number) => {
    return `${number < 10 ? '0' : ''}${number}`;
};
const getDDMMYYSlashToDDMMYYDashed = (date = null) => {
    const today = date ? new Date(date) : new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `${getLeadingZero(day)}-${getLeadingZero(month)}-${year}`;
};
const calcularTiempoRestante = (fechaFinDetencion) => {
    const fechaFinTimestamp = new Date(fechaFinDetencion?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')).getTime();
    const ahora = new Date().getTime();
    const tiempoRestanteMillis = fechaFinTimestamp - ahora;
    if (tiempoRestanteMillis <= 0) {
        return 'Completado';
    }
    const dias = Math.floor(tiempoRestanteMillis / (1000 * 60 * 60 * 24));
    const horas = Math.floor((tiempoRestanteMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoRestanteMillis % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((tiempoRestanteMillis % (1000 * 60)) / 1000);
    let tiempoRestante = '';
    if (dias > 0) {
        tiempoRestante += `${dias}d`;
    }
    if (horas > 0 && tiempoRestante?.split(' ').length < 2) {
        tiempoRestante += ` ${horas}h`;
    }
    if (minutos > 0 && tiempoRestante?.trim()?.split(' ').length < 2) {
        tiempoRestante += ` ${minutos}m`;
    }
    if (segundos > 0 && tiempoRestante?.trim()?.split(' ').length < 2) {
        tiempoRestante += ` ${segundos}s`;
    }
    return `${tiempoRestante?.trim() || '0s'} faltantes`;
};
const string2DateReniec = (fechaReniec) => {
    const [dia, mes, anio] = fechaReniec.split('/');
    return new Date(+anio, +mes - 1, +dia);
};
const obtenerFechaHoraDDMMYYYYHHMMA = (fecha) => {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anho = fecha.getFullYear();
    const horas = (fecha.getHours() % 12 || 12).toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = fecha.getHours() >= 12 ? 'PM' : 'AM';
    return `${dia}/${mes}/${anho} ${horas}:${minutos} ${ampm}`;
};
function dateTimeValidator(control) {
    const dateControl = control.get('fechaLlamada');
    const timeControl = control.get('horaLlamada');
    if (dateControl && timeControl && dateControl.value && timeControl.value) {
        const date = new Date(dateControl.value);
        const time = new Date(timeControl.value);
        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
        // Current datetime for comparison
        const currentDateTime = new Date();
        if (date > currentDateTime) {
            // If the combined datetime is in the future, return an error
            return { invalidDateTime: true };
        }
    }
    return null; // If validation passes
    const inputDate = new Date(control.value);
    const currentDate = new Date();
    console.log(inputDate, currentDate, inputDate > currentDate);
    if (inputDate > currentDate) {
        return { futureDate: true };
    }
    return null;
}
const obtenerTiempoTranscurrido = (fechaInicial) => {
    let timeAgo = '';
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - fechaInicial.getTime();
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        timeAgo = `hace ${days} día(s)`;
    }
    else if (hours > 0) {
        timeAgo = `hace ${hours} hora(s)`;
    }
    else if (minutes > 0) {
        timeAgo = `hace ${minutes} minuto(s)`;
    }
    else {
        timeAgo = `hace ${seconds} segundo(s)`;
    }
    return timeAgo;
};
/**
 * Valida el rango de fechas máximo 1 mes. Usado para los formularios reactivos
 *
 * @param group
 * @returns null | object
 */
const validarRangoFechaForm = (group) => {
    const fechaDesde = group.get('fechaDesde')?.value;
    const fechaHasta = group.get('fechaHasta')?.value;
    if (!fechaDesde || !fechaHasta) {
        return null; // No validar si una de las fechas no está definida
    }
    const inicio = new Date(fechaDesde);
    const fin = new Date(fechaHasta);
    const hoy = new Date();
    if (!(fin <= hoy)) {
        return { rangoFechaInvalidoMax: true };
    }
    // Calcular la diferencia en meses y días
    const diferenciaMeses = fin.getMonth() -
        inicio.getMonth() +
        (fin.getFullYear() - inicio.getFullYear()) * 12;
    const diferenciaDias = fin.getDate() - inicio.getDate();
    // Verificar si la diferencia es exactamente un mes o menos
    const rangoValido = (diferenciaMeses === 1 && diferenciaDias <= 0) ||
        (diferenciaMeses === 0 && diferenciaDias >= 0);
    return rangoValido ? null : { rangoFechaInvalido: true };
};
/**
 * Valida el rango de fechas máximo 6 meses. Usado para los formularios reactivos
 *
 * @param group
 * @returns null | object
 */
const validarRangoUltimo6MesesForm = (group) => {
    const fechaDesde = group.get('fechaDesde')?.value;
    const fechaHasta = group.get('fechaHasta')?.value;
    if (!fechaDesde || !fechaHasta) {
        return null; // No validar si una de las fechas no está definida
    }
    const inicio = new Date(fechaDesde);
    const fin = new Date(fechaHasta);
    const hoy = new Date();
    if (!(fin <= hoy)) {
        return { rangoFechaInvalidoMax: true };
    }
    // Calcular la diferencia en meses y días
    let diferenciaMeses = fin.getMonth() -
        inicio.getMonth() +
        (fin.getFullYear() - inicio.getFullYear()) * 12;
    let diferenciaDias = fin.getDate() - inicio.getDate();
    // Ajustar la diferencia de días si es negativa
    if (diferenciaDias < 0) {
        diferenciaMeses -= 1;
        diferenciaDias += 30;
    }
    // Verificar si la diferencia es de 6 meses o menos y los días no exceden el rango
    const rangoValido = diferenciaMeses < 6 || (diferenciaMeses === 6 && diferenciaDias <= 0);
    return rangoValido ? null : { rangoFechaInvalido: true };
};
function rangoFechaXDefecto() {
    const meses = CONSULTA_CASO_RANGO_FECHA; /*Se resta 6 meses a la fecha actual */
    const fechaFin = new Date();
    const fechaInicio = new Date(fechaFin);
    const mesInicio = fechaInicio.getMonth();
    fechaInicio.setMonth(fechaFin.getMonth() - meses);
    // Ajuste para casos en los que restar meses cambie el año y cause un problema de desbordamiento
    if (fechaInicio.getMonth() !== (((mesInicio - meses) % 12) + 12) % 12) {
        fechaInicio.setDate(0); // Establece al último día del mes anterior
    }
    return {
        inicio: fechaInicio,
        fin: fechaFin,
    };
}

class StringUtil {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    // TODO: Ref cfng-core-lib - formatearCodigoCaso
    //  - Se debera llamar a la librería de estilo(cfng-core-cdn), para referenciar el color del texto sobre el código de caso.
    formatearCodigoCaso(codigoCaso) {
        codigoCaso = `${codigoCaso}-0`;
        const partes = codigoCaso.split('-');
        if (partes.length > 3) {
            return this.sanitizer.bypassSecurityTrustHtml(`${partes[0]}-<span style="color:orange" >${partes[1]}-${partes[2]}</span>-${partes[3]}`);
        }
        return codigoCaso;
    }
    // TODO: Ref cfng-core-lib - obtenerNumeroCaso
    obtenerNumeroCaso(numeroCaso) {
        const caso = numeroCaso.split('-');
        return `<div class="cfe-caso">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</div>`;
    }
    // TODO: Ref cfng-core-lib - obtenerClaseDeOrigen
    obtenerPlazo(plazo) {
        let semaforo = 'dentro-del-plazo';
        if (plazo == "2") {
            semaforo = 'plazo-por-vencer';
        }
        else if (plazo == "3") {
            semaforo = 'plazo-vencido';
        }
        return semaforo;
    }
    obtenerPlazoItem(plazo) {
        let semaforo = 'dentro-del-plazo';
        if (plazo == "2") {
            semaforo = 'plazo-por-vencer';
        }
        else if (plazo == "3") {
            semaforo = 'plazo-vencido';
        }
        return `<span class="plazo-item ${semaforo}"></span>`;
    }
    formatearNombre(nombre) {
        if (nombre !== undefined && nombre !== null) {
            return nombre
                .toLowerCase()
                .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
        }
        else {
            return '-';
        }
    }
    mostrarDelitosFromArray(delitoArray) {
        if (delitoArray && delitoArray.length > 0) {
            return delitoArray
                .map((item) => item.nombre.toLowerCase())
                .join(' / ');
        }
        else {
            return '-';
        }
    }
    getColor(indSemaforo) {
        switch (indSemaforo) {
            case 1:
                return 'greenbar';
            case 2:
                return 'yellowbar';
            case 3:
                return 'redbar';
            default:
                return 'yellowbar';
        }
    }
    capitalizedFirstWord(texto = '') {
        if (typeof texto !== 'string' || texto.length === 0) {
            return texto;
        }
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StringUtil, deps: [{ token: i1.DomSanitizer }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StringUtil, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StringUtil, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.DomSanitizer }] });

class InputUtil {
    constructor() { }
    // TODO: Ref cfng-core-lib - validarSoloNumeros
    validarSoloNumeros(event) {
        const input = event.target;
        const valorActual = input.value;
        input.value = valorActual.replace(/[^0-9]/g, '');
    }
    // TODO: Ref cfng-core-lib - validarSoloLetras
    validarSoloLetras(event) {
        const input = event.target;
        const valorActual = input.value;
        input.value = valorActual.replace(/[^a-zA-Z]/g, '');
    }
    // TODO: Ref cfng-core-lib - validarSoloLetrasNumeros
    validarSoloLetrasNumeros(event) {
        const input = event.target;
        const valorActual = input.value;
        input.value = valorActual.replace(/[^a-zA-Z0-9]/g, '');
    }
    // TODO: Ref cfng-core-lib - contarTotalPalabras
    contarTotalPalabras(inputText, maxLength) {
        const words = inputText.value ?? '';
        let wordCount = words.length;
        if (wordCount >= maxLength) {
            const newValue = words.substring(0, maxLength);
            inputText.setValue(newValue);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: InputUtil, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: InputUtil, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: InputUtil, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

const FILTRO_TIEMPO = {
    ULTIMOS_MESES: '1',
    TODO: '0'
};
const MENSAJE = {
    SELECT_FISCAL_ASIGNADO: 'Debe seleccionar un fiscal asignado para realizar la reasignación',
    SELECT_TIPO_REASIGNACION: 'Debe seleccionar el tipo de reasignación para realizar la reasignación',
    SELECT_MINIMO_UN_CASO: 'Debe seleccionar al menos un caso para realizar la reasignación',
    SELECT_FISCAL_REASIGNAR: 'Debe seleccionar un fiscal a reasignar para realizar la reasignación',
    SELECT_MOTIVO_REASIGNACION: 'Debe ingresar el motivo para realizar la reasignación',
    SELECT_FECHA_INICIO: 'Debe seleccionar una fecha de inicio para la reasignación temporal',
    SELECT_FECHA_FIN: 'Debe seleccionar una fecha de fin para la reasignación temporal'
};
const MENSAJE_CONFIRM_RESASIGNACION = `Por favor confirme la acción de reasignación de casos. Recuerde que el Fiscal inicial ya no tendrá acceso a los casos que serán reasignados; el sistema le enviará una alerta informando la acción.`;
const SE_ASIGNO_CASO = 'Se asignó el caso correctamente';
const SE_ASIGNO_CASOS = 'Se asignaron los casos correctamente';
const HEADER_REASIGNACION = ['Número de caso', 'Etapa', 'Acto Procesal', 'Trámite', 'Fiscal Asignado', 'Fecha Ingreso', 'Fecha Asignación'];
const NOMBRE_ARCHIVO = 'Casos para reasignar';
const TAMANIO_ARCHIVO = 1024;
const LAPSO_TIEMPO = 4000;
const OPCIONES_MENU = [
    { ID: 1, LABEL: 'Visor documental', ICONO: 'file-search-icon' },
    { ID: 2, LABEL: 'Detalles del caso', ICONO: 'file-search-icon' }
];

class MathUtil {
    constructor() {
        this.formatearPesoArchivo = (bytes, decimalPoint = 2) => {
            if (bytes == 0)
                return '0 Bytes';
            let k = 1024;
            let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i];
        };
        this.bytesAMegabytes = (bytes, decimalPoint = 2) => {
            const megabytes = bytes / (1024 * 1024); // 1 MB = 1024 * 1024 bytes
            return `${megabytes.toFixed(decimalPoint)} MB`;
        };
    }
    calcularPorcentaje(initialValue, difference) {
        if (initialValue > difference || initialValue === difference) {
            return 100;
        }
        return Math.round((initialValue / difference) * 100);
    }
    obtenerPesoFormateado(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        let k = TAMANIO_ARCHIVO;
        let sizes = ['Bytes', 'KB', 'MB'];
        let i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i] ?? 'MB'}`;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MathUtil, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MathUtil, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MathUtil, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class FileUtil {
    constructor() {
        this.base64ToFile = (base64String) => {
            const binaryData = atob(base64String);
            const array = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                array[i] = binaryData.charCodeAt(i);
            }
            const blob = new Blob([array], { type: 'application/octet-stream' });
            try {
                return new File([blob], `${new Date().getTime()}.pdf`, {
                    type: 'application/octet-stream',
                });
            }
            catch (e) {
                console.error('Error creating File:', e);
                return null;
            }
        };
        this.descargarArchivoB64 = (archivoB64, nombreArchivo) => {
            const caracteresBase64 = atob(archivoB64);
            const numerosBytes = new Array(caracteresBase64.length);
            for (let i = 0; i < caracteresBase64.length; i++) {
                numerosBytes[i] = caracteresBase64.charCodeAt(i);
            }
            const arregloBytes = new Uint8Array(numerosBytes);
            const archivo = new Blob([arregloBytes], { type: 'application/pdf' });
            const enlaceDescarga = document.createElement('a');
            enlaceDescarga.href = URL.createObjectURL(archivo);
            enlaceDescarga.download = `${nombreArchivo}.pdf`;
            document.body.appendChild(enlaceDescarga);
            enlaceDescarga.click();
            document.body.removeChild(enlaceDescarga);
        };
        this.archivoFileToB64 = async (archivo) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(archivo);
                reader.onload = () => {
                    const archivoB64 = reader.result;
                    resolve(archivoB64.replace('data:application/pdf;base64,', ''));
                };
                reader.onerror = () => {
                    reject('');
                };
            });
        };
        this.trustUrlB64 = (archivoB64) => {
            return `data:application/pdf;base64,${archivoB64}`;
        };
        this.onlyB64File = (trustArchivoB64) => {
            return trustArchivoB64.replace('data:application/pdf;base64,', '');
        };
        this.formatoPesoArchivo = (bytes, decimalPoint = 2) => {
            if (bytes == 0)
                return '0 Bytes';
            let k = 1024;
            let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let i = Math.floor(Math.log(bytes) / Math.log(k));
            return (parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i]);
        };
        this.superaPesoPermitido = (archivo, persoPermitido) => {
            return (archivo.size > persoPermitido);
        };
        this.nombreArchivoExtenso = (archivo, longitudMaxima) => {
            return (archivo.name.length > longitudMaxima);
        };
        this.esExtensionValida = (archivo, extensionesPermitidas) => {
            let extensionArchivo = extensionesPermitidas.split(',').map((type) => type.trim());
            for (let type of extensionArchivo) {
                let acceptable = this.isWildcard(type) ?
                    this.getTypeClass(archivo.type) === this.getTypeClass(type) :
                    archivo.type == type || this.getFileExtension(archivo.name).toLowerCase() === type.toLowerCase();
                if (acceptable)
                    return true;
            }
            return false;
        };
    }
    getTypeClass(fileType) {
        return fileType.substring(0, fileType.indexOf('/'));
    }
    isWildcard(fileType) {
        return fileType.indexOf('*') !== -1;
    }
    getFileExtension(fileName) {
        return '.' + fileName.split('.').pop();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FileUtil, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FileUtil, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FileUtil, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class UtilModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: UtilModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: UtilModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: UtilModule, providers: [
            DateUtil,
            FileUtil,
            InputUtil,
            MathUtil,
            StringUtil,
        ] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: UtilModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        DateUtil,
                        FileUtil,
                        InputUtil,
                        MathUtil,
                        StringUtil,
                    ],
                }]
        }] });

const ICONOS = [
    { nombre: 'iFolderSearch', icono: iFolderSearch },
    { nombre: 'iTooltip', icono: iTooltip },
    { nombre: 'iChevronRight', icono: iChevronRight },
    { nombre: 'iFilterShow', icono: iFilterShow },
    { nombre: 'iFolderExclamation', icono: iFolderExclamation },
    { nombre: 'iTable', icono: iTable },
    { nombre: 'iFileDownload', icono: iFileDownload },
    { nombre: 'iPosit', icono: iPosit },
    { nombre: 'iArrowRight', icono: iArrowRight },
    { nombre: 'iFileAdd', icono: iFileAdd },
    { nombre: 'iFiles', icono: iFiles },
    { nombre: 'iFileSearch', icono: iFileSearch },
    { nombre: 'iUsers', icono: iUsers },
    { nombre: 'iFileInput', icono: iFileInput },
    { nombre: 'iClose', icono: iClose },
    { nombre: 'iDownload', icono: iDownload },
    { nombre: 'iSearch', icono: iSearch },
    { nombre: 'iFolderSolid', icono: iFolderSolid },
    { nombre: 'iAttach', icono: iAttach },
    { nombre: 'iReAsign', icono: iReAsign },
    { nombre: 'iCheckCircle', icono: iCheckCircle },
    { nombre: 'iTrash', icono: iTrash },
    { nombre: 'iEdit', icono: iEdit },
    { nombre: 'iAdd', icono: iAdd },
    { nombre: 'iCheck', icono: iCheck },
    { nombre: 'iChevronLeft', icono: iChevronLeft },
    { nombre: 'iSend', icono: iSend },
    { nombre: 'iTrashCan', icono: iTrashCan },
    { nombre: 'iSign', icono: iSign },
    { nombre: 'iDeny', icono: iDeny },
    { nombre: 'iArrowLeft', icono: iArrowLeft },
    { nombre: 'iSave', icono: iSave },
    { nombre: 'iViewFile', icono: iViewFile },
    { nombre: 'iAddUser', icono: iAddUser },
    { nombre: 'iAlert', icono: iAlert },
    { nombre: 'iFile', icono: iFile },
    { nombre: 'iAlertHexagonal', icono: iAlertHexagonal },
    { nombre: 'iCalendarClean', icono: iCalendarClean },
    { nombre: 'iClockDots', icono: iClockDots },
    { nombre: 'iFileRegister', icono: iFileRegister },
    { nombre: 'iInfoCircle', icono: iInfoCircle },
    { nombre: 'iPlayCircle', icono: iPlayCircle },
    { nombre: 'iReset', icono: iReset },
    { nombre: 'iRestaurar', icono: iRestaurar },
    { nombre: 'iEnviar', icono: iEnviar },
    { nombre: 'iFirmaMasiva', icono: iFirmaMasiva },
    { nombre: 'iSmartPhone', icono: iSmartPhone },
    { nombre: 'iTracing', icono: iTracing },
    { nombre: 'iTrashMpe', icono: iTrashMpe },
    { nombre: 'iPhone', icono: iPhone },
    { nombre: 'iMail', icono: iMail },
    { nombre: 'iPin', icono: iPin },
    { nombre: 'iArrowLeft', icono: iArrowLeft },
    { nombre: 'iDownloadFile', icono: iDownloadFile },
    { nombre: 'iFileUpload', icono: iFileUpload },
    { nombre: 'iFolderMagnifyingGlass', icono: iFolderMagnifyingGlass },
    { nombre: 'iChevronUp', icono: iChevronUp },
    { nombre: 'iChevronDown', icono: iChevronDown },
    { nombre: 'iChevronOrder', icono: iChevronOrder },
    { nombre: 'iEye', icono: iEye },
    { nombre: 'iFileFull', icono: iFileFull },
    { nombre: 'iAlerta', icono: iAlerta },
    { nombre: 'iAltavoz', icono: iAltavoz },
    { nombre: 'iEliminarBloqueado', icono: iEliminarBloqueado },
    { nombre: 'iPrint', icono: iPrint },
    { nombre: 'iBell', icono: iBell },
    { nombre: 'iTimer', icono: iTimer },
    { nombre: 'iSearchMpe', icono: iSearchMpe },
    { nombre: 'iUsdCircle', icono: iUsdCircle },
    { nombre: 'iFileArrowUp', icono: iFileArrowUp },
    { nombre: 'iFileImage', icono: iFileImage },
];
class IconUtil {
    constructor() {
        this.obtenerIcono = (nombre) => {
            return ICONOS.find(icono => icono.nombre === nombre)?.icono;
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: IconUtil, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: IconUtil, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: IconUtil, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

const cleanEmptyFields = (object) => {
    const request = Object.fromEntries(Object.entries(object).filter(([_, valor]) => valor !== null && valor !== undefined && valor !== ''));
    return request;
};
const obtenerCasoHtml = (numeroCaso) => {
    const caso = numeroCaso?.split('-');
    return `<span class="cfe-caso" style="white-space: nowrap">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</span>`;
};
const obtenerRutaParaEtapa = (etapa) => {
    return etapaInfo(etapa).path;
};
const obtenerTipoOpcionEtapa = (etapa) => {
    return etapaInfo(etapa).tipoOpcion;
};
const urlEditarTramite = (tramite) => {
    return `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(tramite.idEtapa)}/caso/${tramite.idCaso}/acto-procesal/${tramite.idActoTramiteCaso}`;
};
function limmpiarTildes(str) {
    return str.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '');
}
const noQuotes = (event) => {
    const charCode = event.charCode || event.keyCode || 0;
    const key = String.fromCharCode(charCode);
    if (key === "'" || key === '"') {
        return false;
    }
    return true;
};
const validOnlyNumbers = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
};
const validLongitud = (event, maxLen) => {
    const input = event.target;
    const inputLength = input.value.length;
    const isArrowKey = event.key === 'ArrowRight' || event.key === 'ArrowLeft';
    const isBackspaceOrTab = event.key === 'Backspace' || event.key === 'Tab';
    const isDeleteKey = event.key === 'Delete';
    // Permitir Supr (Delete) independientemente de la longitud máxima
    if (isDeleteKey) {
        return;
    }
    if (!isArrowKey && inputLength >= maxLen && !isBackspaceOrTab) {
        event.preventDefault();
    }
};
const validAlfanumerica = (event) => {
    const tecla = event.key;
    const esAlfanumerico = /^[a-zA-Z0-9]$/;
    if (!esAlfanumerico.test(tecla)) {
        event.preventDefault(); // Evita que se ingrese el carácter
    }
};
const obtenerCodigoCasoHtml = (numeroCaso) => {
    const caso = numeroCaso?.split('-');
    return `<div class="cfe-caso">${caso[0]}-${caso[1]}-<span>${caso[2]}-${caso[3]}</span></div>`;
};
const formatDate = (date) => {
    return date
        ? date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : '';
};
const formatDatetime = (date) => {
    return date
        ? date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '';
};
const formatStringDatetime = (date, hour) => {
    const dateFormatted = date
        ? date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : '';
    const hourFormatted = hour
        ? `${hour.getHours().toString().padStart(2, '0')}:${hour
            .getMinutes()
            .toString()
            .padStart(2, '0')}`
        : '';
    const format = `${dateFormatted} ${hourFormatted}`;
    return format;
};
const formatTime = (hour) => {
    const hourFormatted = hour
        ? `${hour.getHours().toString().padStart(2, '0')}:${hour
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${hour.getSeconds().toString().padStart(2, '0')}`
        : '';
    return hourFormatted;
};
const formatTimeHHMM = (hour) => {
    const hourFormatted = hour
        ? `${hour.getHours().toString().padStart(2, '0')}:${hour
            .getMinutes()
            .toString()
            .padStart(2, '0')}`
        : '';
    return hourFormatted;
};
const getValidString = (value) => {
    return value !== null && value !== undefined
        ? String(value).trim() !== ''
            ? String(value).trim().toUpperCase()
            : null
        : null;
};
const validText = (event, customPattern = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/) => {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 8) {
        return true;
    }
    const pattern = customPattern;
    const character = String.fromCharCode(charCode);
    return pattern.test(character);
};
const validOnlyTextOnPaste = (event) => {
    const clipboardData = event.clipboardData || window['clipboardData'];
    const pastedText = clipboardData.getData('text');
    const validText = pastedText.match(/[A-Za-zÁÉÍÓÚáéíóúñÑ ]+/g)?.join('');
    const newPastedText = validText ?? '';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(pastedText)) {
        event.preventDefault();
        const element = event.target;
        if (element.isContentEditable) {
            const selection = window.getSelection();
            if (selection) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(newPastedText));
            }
        }
        else {
            element.value = newPastedText;
            element.dispatchEvent(new Event('input'));
        }
    }
};
const validOnlyNumberOnPaste = (event) => {
    const clipboardData = event.clipboardData || window['clipboardData'];
    const pastedText = clipboardData.getData('text');
    const numericText = pastedText.match(/\d+/g)?.join('');
    const newPastedText = numericText ?? '';
    if (!/^\d+$/.test(pastedText)) {
        event.preventDefault();
        const element = event.target;
        if (element.isContentEditable) {
            const selection = window.getSelection();
            if (selection) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(newPastedText));
            }
        }
        else {
            element.value = newPastedText;
            element.dispatchEvent(new Event('input'));
        }
    }
};
const validAlfanumericaOnPaste = (event) => {
    const textoPegado = event.clipboardData?.getData('text');
    const esAlfanumerico = /^[a-zA-Z0-9]*$/;
    if (textoPegado && !esAlfanumerico.test(textoPegado)) {
        event.preventDefault();
    }
};
const formatDateText = (value) => {
    const [date, time] = value.split(' ');
    const [hour, minute] = time.split(':');
    let formattedHour = Number(hour);
    let meridiem = 'AM';
    if (formattedHour >= 12) {
        formattedHour = formattedHour % 12;
        meridiem = 'PM';
    }
    if (formattedHour === 0) {
        formattedHour = 12;
    }
    return `${date} a las ${formattedHour
        .toString()
        .padStart(2, '0')}:${minute} ${meridiem}`;
};
const getDateFromString = (value) => {
    if (value === null)
        return null;
    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date;
};
const formatDateString = (value) => {
    const [year, month, day] = value.split('-');
    const date = day + '/' + month + '/' + year;
    return date;
};
const validateDateTime = (dateTimeString) => {
    const [dateComponents, timeComponents] = dateTimeString.split(' ');
    const [day, month, year] = dateComponents.split('/');
    const [hours, minutes, seconds] = timeComponents.split(':');
    const selectedDateTime = new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);
    const currentDateTime = new Date();
    return selectedDateTime <= currentDateTime;
};
function getCapitalized(text = '') {
    if (typeof text !== 'string') {
        return '';
    }
    const word = text.toLowerCase().split(' ');
    for (let i = 0; i < word.length; i++) {
        word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
    }
    return word.join(' ');
}
function actualizarContadorInputTextArea(maximo, texto) {
    return 1000 - texto.length;
}
var utilsUtil = {
    getCapitalized,
};

class CapitalizePipe {
    transform(value) {
        if (!value)
            return '';
        const palabras = value.split(' ');
        const palabrasCapitalizadas = palabras.map((palabra) => {
            if (!palabra) {
                return '';
            }
            return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
        });
        return palabrasCapitalizadas.join(' ');
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: CapitalizePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: CapitalizePipe, isStandalone: true, name: "capitalizar" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: CapitalizePipe, decorators: [{
            type: Pipe,
            args: [{
                    standalone: true,
                    name: 'capitalizar',
                }]
        }] });

class DateFormatPipe {
    transform(value, type = 'date') {
        let date = '';
        switch (type) {
            case 'date':
                date = formatDateToAbbreviated(value);
                break;
            case 'hour':
                date = convertTo12HourFormat(value);
                break;
            case 'hour24':
                date = convertTo24HourFormat(value);
                break;
            default:
                return value;
        }
        return date;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DateFormatPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: DateFormatPipe, isStandalone: true, name: "dateformat" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DateFormatPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'dateformat',
                    standalone: true,
                }]
        }] });

class formatoCampoPipe {
    transform(value) {
        let texto = value;
        if (texto == '-') {
            return '';
        }
        else {
            return texto;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: formatoCampoPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: formatoCampoPipe, isStandalone: true, name: "formatoCampo" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: formatoCampoPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'formatoCampo',
                    standalone: true,
                }]
        }] });

class formatoFechaPartesPipe {
    transform(value, args) {
        var arg1 = args[0];
        console.log('arg');
        console.log(value);
        if (value === null) {
            return '-';
        }
        else {
            let texto = value.split(' ');
            if (texto.length > 4 && arg1 === 'f') {
                return `${texto[0]} ${texto[1]} ${texto[2]} `;
            }
            if (texto.length > 4 && arg1 === 'h') {
                return ` ${texto[3]} ${texto[4]} `;
            }
            else {
                return value;
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: formatoFechaPartesPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: formatoFechaPartesPipe, isStandalone: true, name: "formatoFechaPartesPipe" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: formatoFechaPartesPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'formatoFechaPartesPipe',
                    standalone: true,
                }]
        }] });

const CAN_CEROS = 3;
class NumRowPipe {
    transform(row, param) {
        if (!param) {
            return String(row).padStart(CAN_CEROS, '0');
        }
        else if (param) {
            if (param.page == 1) {
                return String(row).padStart(CAN_CEROS, '0');
            }
            else if (param?.page > 1) {
                const num = (param.page - 1) * param.perPage + row;
                return String(num).padStart(CAN_CEROS, '0');
            }
            else {
                return String(1).padStart(CAN_CEROS, '0');
            }
        }
        return null;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: NumRowPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: NumRowPipe, isStandalone: true, name: "numrow" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: NumRowPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'numrow',
                    standalone: true,
                }]
        }] });

class SafeUrlPipe {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    transform(url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: SafeUrlPipe, deps: [{ token: i1.DomSanitizer }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: SafeUrlPipe, isStandalone: true, name: "safeUrl" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: SafeUrlPipe, decorators: [{
            type: Pipe,
            args: [{
                    standalone: true,
                    name: 'safeUrl',
                }]
        }], ctorParameters: () => [{ type: i1.DomSanitizer }] });

class tiempoSegundos {
    transform(value) {
        let tiempo = Number(value);
        if (tiempo >= 5 && tiempo <= 59) {
            return 'hace 5 segundos';
        }
        if (tiempo >= 60 && tiempo <= 3559) {
            return 'hace 1 minuto';
        }
        if (tiempo >= 3600 && tiempo <= 86359) {
            return 'hace 1 hora';
        }
        if (tiempo >= 86400 && tiempo <= 518359) {
            return 'hace 1 día';
        }
        if (tiempo >= 518400 && tiempo <= 604799) {
            return 'hace 6 días';
        }
        if (tiempo >= 604800 && tiempo <= 86400 * 30 - 1) {
            return 'hace 1 semana';
        }
        if (tiempo >= 86400 * 30) {
            return 'hace 1 mes';
        }
        else {
            return 'hace más de un mes';
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: tiempoSegundos, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: tiempoSegundos, isStandalone: true, name: "tiempoSegundos" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: tiempoSegundos, decorators: [{
            type: Pipe,
            args: [{
                    name: 'tiempoSegundos',
                    standalone: true,
                }]
        }] });

class CasoFiscal {
}
;
;
var ColoresPostIt;
(function (ColoresPostIt) {
    ColoresPostIt["GREEN"] = "#9BDCCB";
    ColoresPostIt["ORANGE"] = "#FFBCB2";
    ColoresPostIt["YELLOW"] = "#FAEFA2";
    ColoresPostIt["BLUE"] = "#A4A0D2";
    ColoresPostIt["RED"] = "#FFE5E2";
})(ColoresPostIt || (ColoresPostIt = {}));

class FormSubmitDirective {
    constructor() {
        this.host = inject(ElementRef);
        this.submit$ = fromEvent(this.element, 'submit').pipe(shareReplay(1));
    }
    get element() {
        return this.host.nativeElement;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FormSubmitDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: FormSubmitDirective, selector: "form", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FormSubmitDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'form' }]
        }] });

class FormValidationDirective {
    constructor() {
        this.ngControl = inject(NgControl);
        this.form = inject(FormSubmitDirective, { optional: true });
        this.destroy$ = new Subject();
        this.elementRef = inject(ElementRef);
        this.blurEvent$ = fromEvent(this.elementRef.nativeElement, 'blur');
        this.submit$ = this.form ? this.form.submit$ : EMPTY;
        this.renderer = inject(Renderer2);
    }
    onBlur() {
        this.handlerInput();
    }
    ngOnInit() {
        merge(this.submit$, this.ngControl.statusChanges ?? EMPTY)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.updateClass();
        });
        // merge(this.blurEvent$, this.clickEvent$)
        merge(this.blurEvent$)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.handlerInput();
        });
    }
    handlerInput() {
        const control = this.ngControl.control;
        if (control?.invalid) {
            control.markAsTouched();
            control.markAsDirty();
        }
        this.updateClass();
    }
    updateClass() {
        if (this.ngControl?.control) {
            const nativeElement = this.elementRef.nativeElement;
            const control = this.ngControl.control;
            // Actualizar las clases ng-dirty y ng-invalid
            if ((control.dirty && control.invalid) || (control.touched && control.invalid)) {
                this.renderer.addClass(nativeElement, 'ng-dirty');
                this.renderer.addClass(nativeElement, 'ng-invalid');
                this.renderer.removeClass(nativeElement, 'ng-valid');
            }
            else {
                this.renderer.removeClass(nativeElement, 'ng-dirty');
                this.renderer.removeClass(nativeElement, 'ng-invalid');
                this.renderer.addClass(nativeElement, 'ng-valid');
            }
            // Actualizar la clase ng-pristine
            if (control.pristine) {
                this.renderer.addClass(nativeElement, 'ng-pristine');
            }
            else {
                this.renderer.removeClass(nativeElement, 'ng-pristine');
            }
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FormValidationDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: FormValidationDirective, selector: "[formControl], [formControlName]", host: { listeners: { "onBlur": "onBlur()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FormValidationDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[formControl], [formControlName]' }]
        }], propDecorators: { onBlur: [{
                type: HostListener,
                args: ['onBlur']
            }] } });

class ValidationModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ValidationModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: ValidationModule, declarations: [FormSubmitDirective, FormValidationDirective], exports: [FormSubmitDirective, FormValidationDirective] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ValidationModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ValidationModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [FormSubmitDirective, FormValidationDirective],
                    exports: [FormSubmitDirective, FormValidationDirective]
                }]
        }] });

/* ASSETS */

/**
 * Generated bundle index. Do not edit.
 */

export { ACTOS, ACTO_TRAMITE_ESTADO, ALERTAS, ASIGNACION_TEMPORAL, ActoProcesal, AssetsModule, BANDEJA_ESTADO, BandejaAlerta, CARGO, CATALOGO_NOM_GRUPO, CDN, CODIGO_TIPO_DOCUMENTO, COMPLEJIDAD, COMPLEJIDAD_VALOR_MAX, COMPLIJIDAD_POR_DEFECTO, CONSULTA_CASO_RANGO_FECHA, CUADERNO_TIPO_MEDIDA, CapitalizePipe, CasoFiscal, ColoresPostIt, Constante, Constants, DATOS_INICIALES_CEDULA, DATOS_INICIALES_INFORMACION_ORDEN, DATOS_INICIALES_ORDEN, DENUNCIANTE_GENERO, DENUNCIANTE_SEXO, DE_MEDIO_NOTIFICACION, DIGITALIZAR_DOCU, DISTRITO_FISCAL_LIMA_CENTRO, DOCUMENTOS_IDENTIDAD_ABOGADOS, DOMAIN_CDN, DateFormatPipe, DateUtil, ESPECIALIDAD_COMUN, ESPECIALIDAD_LAVADO_ACTIVOS, ESPECIALIDAD_TERRORISMO, ESPECIALIDAD_TRAFICO_ILICITO_DROGAS, ESPECIALIDAD_TRATA_PERSONA, ESPECIALIDAD_VIOLENCIA_MUJER, ESTADOS_CEDULA, ESTADO_ABOGADO, ESTADO_CEDULA, ESTADO_REGISTRO, ESTADO_REGISTRO_ULTIMO, ESTADO_TRAMITE, ES_TRADUCTOR, ETAPA, ETAPAS_CASO, ETAPA_TRAMITE, EstadoAlerta, FINALIDADES_CASO_1, FINALIDADES_CASO_2, FINALIDADES_CASO_4_5_6, FINALIDADES_GESELL, FINALIDAD_CITACION, FileUtil, FormSubmitDirective, FormValidationDirective, ID_ACTO_PROC_CONFI_INICIO_DILIGENCIAS_PREELIMINARES, ID_ETAPA, ID_TRAMITE_INICIO_DILIGENCIAS_PREELIMINARES, IconAsset, IconUtil, ImageAsset, InputUtil, MEDIDA_COERCION, MEDIO_NOTIFICACION, MEDIO_NOTIFICACION_ID, MENSAJE_ERROR_INESPERADO, MODALIDAD_CITACION, MODULE_CODE, MOTIVO_INGRESOS, MathUtil, NUMEROS_CITACION, NumRowPipe, PARAMETROS_CATALOGO_MUP, PARAMETRO_CONSULTA_RENIEC, RESPUESTA_HTTP, RESPUESTA_MODAL, RES_1ERA_INSTANCIA, RSP_1ERA_INSTANCIA, SEDES, SLUG_CARGO_DIGITALIZADO, SLUG_COMPLETED, SLUG_COMPONENTE_MESA, SLUG_CONFIRM_RESPONSE, SLUG_DENUNCIANTE_AGRAVIADO, SLUG_DOCUMENT, SLUG_DOCUMENT_TYPE, SLUG_ENTITY, SLUG_ENTITY_MP, SLUG_ERROR_RENIEC, SLUG_ERROR_RENIEC_CODE, SLUG_INGRESO_DOCUMENTO, SLUG_INVOLVED, SLUG_INVOLVED_CODE, SLUG_INVOLVED_ROL, SLUG_IS_REMITENTE, SLUG_MAX_LENGTH, SLUG_MESA_PARTES, SLUG_MOTIVO_COPIA, SLUG_NOMBRE_MOTIVO_COPIA, SLUG_OTHER, SLUG_PENDING_RESPONSE, SLUG_PERSON, SLUG_PERSON_TYPE, SLUG_PROFILE, SLUG_SIGN, SLUG_TIPO_PARTE, SLUG_TIPO_PARTE_CODE, SLUG_TIPO_RIESGOS, SLUG_TIPO_RIESGOS_KEY, SLUG_TIPO_VIOLENCIA, SLUG_TIPO_VIOLENCIA_KEY, SLUG_VALIDADO, SUBJECT_TYPES, SYSTEM, SYSTEM_CODE, SafeUrlPipe, StringUtil, TIEMPO_CONSULTAS_CASOS, TIPO_ACCION_ESTADO, TIPO_ACCION_FIRMA, TIPO_CEDULA, TIPO_COPIA, TIPO_DERIVACION, TIPO_DOCUMENTO, TIPO_DOCUMENTO_IDENTIDAD, TIPO_ESPECIALIDAD_PENAL, TIPO_ETIQUETAS, TIPO_EXTENSION_DOCUMENTO, TIPO_MEDIDA_COERCION, TIPO_MESA, TIPO_NACIONALIDAD, TIPO_OFICIO, TIPO_PARTE, TIPO_PARTE_INVOLUCRADO, TIPO_PERSONA_DENUNCIA, TIPO_PERSONA_DENUNCIANTE, TIPO_RESULTADO, TIPO_RESULTADO_INSTANCIA, TIPO_SUJETOS_PROCESALES, TIPO_SUJETO_PROCESAL, TIPO_TRAMITE, TRAMITE, TRAMITES, TRAMITE_TIPO_CUADERNO, TRAMITE_TIPO_CUADERNO_FILTRO, TRAMITE_TIPO_DOCUMENTO, TipoAlerta, TipoOpcionCasoFiscal, TipoOpcionCasoFiscalRuta, TipoProceso, UNIDAD_MEDIDA, UtilModule, VALIDACION, VISOR_ESTADO, ValidationModule, actualizarContadorInputTextArea, calcularTiempoRestante, cleanEmptyFields, convertTo12HourFormat, convertTo24HourFormat, dateTimeValidator, etapaInfo, formatDate, formatDateString, formatDateText, formatDateToAbbreviated, formatDatetime, formatStringDatetime, formatTime, formatTimeHHMM, formatoCampoPipe, formatoFechaPartesPipe, getCapitalized, getDDMMYYSlashToDDMMYYDashed, getDateFromString, getErrorReniec, getGeneroAbreviado, getProfile, getTipoDocumento, getTipoDocumentoCode, getTipoParte, getTipoParteCode, getValidString, getYYMMDDDashedToDDMMYYSlash, icono, limmpiarTildes, modules, noQuotes, obtenerCasoHtml, obtenerCodigoCasoHtml, obtenerFechaDDMMYYYY, obtenerFechaHoraDDMMYYYYHHMMA, obtenerFechaLetras, obtenerFechaTipoDate, obtenerHoraAMPM, obtenerHoraHH24MI, obtenerHoraTipoDate, obtenerRutaParaEtapa, obtenerTiempoTranscurrido, obtenerTipoOpcionEtapa, rangoFechaXDefecto, semaforo, string2DateReniec, tiempoSegundos, urlEditarTramite, validAlfanumerica, validAlfanumericaOnPaste, validLongitud, validMaxLengthCustom, validOnlyNumberOnPaste, validOnlyNumbers, validOnlyTextOnPaste, validText, validarRangoFechaForm, validarRangoUltimo6MesesForm, validateDateTime };
//# sourceMappingURL=ngx-cfng-core-lib.mjs.map
