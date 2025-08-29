export interface Denuncia {
  id: string | null; //id Denuncia
  numeroInformePolicial: string;
  codigoCip: string;
  numeroExpediente: string;
  medidaProteccion: MedidaProteccion | null;
  entidad: Entidad | null;
  lugarHecho: LugarHecho | null;
  delito: Delito | null;
  partesDenunciantes: Involucrado;
  partesAgraviadas: Involucrado;
  partesDenunciadas: Involucrado;
  anexosAsociados: AnexosAsociados;
  remitente: Remitente;
  anexo: Anexos;
  force?: boolean;
  coUsuarioCreacion?: String;
  origin: number;
  mesaDespacho?: MesaDespacho;
}

export interface MesaDespacho {
  idDespacho: number | null;
  nombreDespacho: string;
  coDespacho: string;
  idDependenciaFiscal: number | null;
  nombreDependenciaFiscal: string;
  coDependenciaFiscal: string;
  idDistritoFiscal: number | null;
  nombreDistritoFiscal: string;
  codDistritoFiscal: string;
}

// Medida Proteccion
export interface MedidaProteccion {
  idTipoRiesgo: number;
  tipoRiesgo: string;
  idsTipoViolencia: number[] | null;
  selectedVilecia: string;
  anexosAsociados: AnexosAsociados | null;
  medidaProteccion: boolean;
}

// Entidad
export interface Entidad {
  idTipoEntidad: number | null;
  idProcuradoria: number | null;
  idCentroEmergencia: number | null;
  idTipoDocumento?: number;
  ruc: string;
  nombreEntidad: string;
  razonSocial: string;
  representanteLegal: null;
  procurador: Procurador | null;
  direccion: Domicilio | null;
  anexosAsociados: AnexosAsociados | null;
}

export interface Procurador {
  nacionalidad: string| null;
  codigoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correoElectronico: string;
  numeroTelefono: string;
  consultaReniec?:any;
}

export interface LugarHecho {
  ubigeo: string;
  direccion: string;
  fechaHecho: string;
  horaHecho: string;
  hecho: string;
  longitud: number;
  latitud: number;
}

export interface Delito {
  especialidad: string | null;
  delitos: Delitos[];
}

export interface Delitos {
  idDelito: number;
  descripcion: string;
}

// Involucrado

export interface Involucrado {
  lqrr?: Lqrr[];
  entidad?: EntidadInvolucrada[];
  persona?: Persona[];
}

export interface Lqrr {
  tipoParticipacion: number;
}

export interface EntidadInvolucrada {
  id: string;
  idTipoEntidad: number;
  idProcuradoria?: number;
  idCentroEmergencia?: number;
  idTipoDocumento?: number;
  ruc?: string;
  nombreEntidad?: string;
  razonSocial?: string;
  representanteLegal?: string;
  procurador?: Procurador| null;
  direccion?: Direccion[]| null;
  validado: number;
}

export interface Persona {
  id: string;
  idTipoPersona: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  sexo?: string;
  fechaNacimiento?: string;
  edad?: number;
  idGradoInstruccion?: number;
  gradoInstruccion?: string;
  idTipoEstadoCivil?: number;
  numeroDigitoVerificacion?: number;
  idNacionalidad?: number;
  nombresMadre?: string;
  apellidoMaternoMadre?: string;
  apellidoPaternoMadre?: string;
  nombresPadre?: string;
  apellidoMaternoPadre?: string;
  apellidoPaternoPadre?: string;
  validado: number;
  lugarNacimiento?: string;
  foto?: string;
  idTipoActividadLaboral?: number;
  nombreOtraActividadLaboral?: string;
  domicilio?: Domicilio;
  contacto?: Contacto| null;
  otrosDatos?: OtrosDatos| null;
  direccion?: Direccion[];
}

export interface Direccion {
  tipoDireccion: String;
  ubigeo: string | null;
  idUbigeoPueblo: number| null;
  tipoVia: number | null;
  direccionResidencia: string| null;
  numeroResidencia: number| null;
  codigoPrefijoUrbanizacion: number| null;
  nombreUrbanizacion: string;
  descripcionPrefijoDpto: string;
  descripcionPrefijoBloque: string;
  descripcionBloque: string;
  descripcionInterior: string;
  descripcionEtapa: string;
  descripcionManzana: string;
  descripcionLote: string;
  descripcionReferencia: string;
  latitud: string;
  longitud: string;
  direccionCompleta: string;
}
export interface DireccionG {
  tipoDireccion: String;
  ubigeo: string;
  idUbigeoPueblo: number;
  prefijo:string,
  nombreUrb:string,
  nombreCalle:string,
  blokc:string,
  interior:string,
  etapa:string,
  manzana:string,
  lote:string,
  referencia:string,
  direccionResidencia: string;
  numeroResidencia: number;
  codigoPrefijoUrbanizacion: number;
  nombreUrbanizacion: string;
  descripcionPrefijoDpto: string;
  descripcionPrefijoBloque: string;
  descripcionBloque: string;
  descripcionInterior: string;
  descripcionEtapa: string;
  descripcionManzana: string;
  descripcionLote: string;
  descripcionReferencia: string;
  latitud: string;
  longitud: string;
  direccionCompleta: string;
  dpto: string;
  provincia: string;
  distrito: string;
  tipovia: string;
}

export type DireccionInvolucrado = {
  tipoDireccion?: number;
  tipoDireccionLabel?: string;
  pais?: number;
  paisLabel?: string;
  dpto?: string | null;
  departamento?: string;
  departamentoLabel?: string;
  provincia?: string;
  provinciaLabel?: string;
  distrito?: string;
  distritoLabel?: string;
  centroPoblado?: string | null;
  centroPobladoLabel?: string;
  tipoVia?: string;
  tipoViaLabel?: string;
  nombreCalle?: string;
  numeroDireccion?: string;
  tipoUrbanizacion?: string;
  tipoUrbanizacionLabel?: string;
  nombreUrbanizacion?: string;
  block?: string;
  interior?: string;
  etapa?: string;
  manzana?: string;
  lote?: string;
  referencia?: string| null;
  usarMaps?: boolean;
  latitud?: number;
  longitud?: number;
  direccionMaps?: string;
};

export interface Domicilio {
  ubigeo?: string;
  direccion?: string;
}

export interface Contacto {
  celularPrincipal?: string;
  correoPrincipal?: string;
  celularSecundario?: string;
  correoSecundario?: string;
}

export interface OtrosDatos {
  ocupacion?: string;
  idTipoDiscapacidad?: string;
  puebloIndigena?: number;
  idLenguaMaterna?: number;
  esRequiereTraductor?: number;
  afroperuvian?: string;
  disability?: string;
  privateLibertad?: string;
  vih?: string;
  worker?: string;
  lgtbiq?: string;
  advocate?: string;
  migrant?: string;
  victim?: string;
  server?: string;
}

// Anexos
export interface AnexosAsociados {
  observacion?: string;
  anexos?: Anexos[];
}

export interface Remitente {
  codigoPerfil: string; //id Denuncia
  nacionalidad: string;
  codigoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo?: string;
  fechaNacimiento?: string;
  edad?: number;
  correoElectronico: string;
  numeroTelefono: string;
  policiaNacional: PoliciaNacional | null;
  poderJudicail: PoderJudicail | null;
  entidad: Entidad | null;
  ministerioPublico: MinisterioPublico | null;
  abogado: Abogado  | null;
  consultaReniec?:any;
  validadoReniec?:number|0;
}

export interface PoliciaNacional {
  numeroTelefono: string;
  codidgoDependenciaPoli: number;
  descripDependenciaPoli: String | null;
  anexoComisaria: string;
  correoElectronicoPnp: string;
  nroInformePolicial: string;
  fechaDenumPolicial: string | null;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

export interface PoderJudicail {
  mailPj: string;
  celularPj: string;
  codigoDistritoJudicial: string;
  codigoEspecialidad: string;
  descripEspecialidad: string | null;
  codigoOrganoJurisdiccional: string;
  descripOrganoJuris: string | null;
  codigoDependenciaJudicial: string;
  descripDependenJudicial: string | null;
  nroExpediente: string;
  medidaProteccion: MedidaProteccion | null;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

export interface MinisterioPublico {
  codigoTipoSujeto: string; //id Denuncia
  emailMinisterioPub: string;
  celMinesterioPub: string;
  nroOficioMp: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

export interface Abogado {
  codigoDocuAbogado: string;
  numeroDocuAbogado: string;
  codigoColegioAbogado: string;
  nombreAbogado: string;
  apePatAbogado: string;
  apeMatAbogado: string;
  mailAbogado: string;
  celAbogado: string;
  nroColegiatura: string;
  validadoReniec?: number|0;
  consultaReniec?: any;
}

export interface ConsultaReniec {
  ip: string;
  numeroDocumento?: string;
  usuarioConsulta?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  tipoVinculo?: string;
  apoderado?: string;
  dniFiscal?: string;
}

export interface HechosCasos {
  depaId: string;
  provId: string;
  distId: string;
  direccion: string;
  fechaHecho: string;
  horaHecho: string;
  hecho: string;
  descHecho: string;
}

export interface delitos {
  id: string;
  articulo: string;
  delitoGenerico: string;
  delitoSubGenerico: string;
  delitoEspecifico: string;
}

export interface Anexos {
  norAexos: string;
  nroFolios: string;
  observation: string;
}

export interface PartesInvolucradas {
  numero: string;
  tipoParte: string;
  nombrePersona: string;
  apePaterno: string;
  apeMaterno: string;
  razonSocial: string;
  representante: string;
  denunciante: string;
  sexo: string;
  edad: string;
  tipoPersona: string;
  tipoDocumento: string;
  nroDocumento: string;
  fechaNaci: string;
  codEstadoCivil: string;
  estadoCivil: string;
  codGradoInstruc: string;
  descGradoInstruc: string;
  codNacionadliad: string;
  descNacionadliad: string;
  codDepart: string;
  nombreDepart: string;
  codProv: string;
  nombreProv: string;
  codDist: string;
  nombreDist: string;
  direccion: string;
  correoPrin: string;
  correoSec: string;
  nroContactoPrin: string;
  nroContactoSec: string;
  txtProfesion: string;
  codDiscapacidad: string;
  descDiscapacidad: string;
  codLgbti: string;
  descLgbti: string;
  esTraductor: string;
  codCondicion: string;
  descCondicion: string;
  fechaDetencion: string;
  codViolencia: string;
  descViolencia: string;
  fechaLiberacion: string;
}

export interface DatosAdicionalesAbogado {
  tipoDocuAbogado: string;
  numeroDocuAbogado: string;
  nombreAbogado: string;
  apellidoPaternoAbogado: string;
  apellidoMaternoAbogado: string;
  sexoAbogado: string;
  fechaNacimiento: string;
  estadoCivil: string;
  nacionalidad: string;
  paísDomicilio: string;
  departamentoDomicilioAbogado: string;
  distritoDomicilio: string;
  ubigeoDomicilio: string;
  prefijoDomicilio: string;
  direcciónDomicilio: string;
  numeroDomicilio: string;
  etapaDomicilio: string;
  interiorDomicilio: string;
  tipoUrbanización: string;
  urbanizaciónDomicilio: string;
  block: string;
  fotografía: string;
  nombreMadre: string;
  apellidoPaternoMadre: string;
  apellidoMaternoMadre: string;
  nombrePadre: string;
  apellidoPaternoPadre: string;
  apellidoMaternoPadre: string;
}
export type ListItemResponseUbigeo = {
  codigo: number,
  nombre: string,

}
