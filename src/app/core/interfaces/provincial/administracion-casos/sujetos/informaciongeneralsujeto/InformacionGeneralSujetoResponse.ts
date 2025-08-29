import { ListItemResponseForm } from "@core/types/mesa-turno/response/Response";
import { FormControl } from "@angular/forms";

export interface InformacionGeneralSujetoResponseFormType {
  index?: number;
  idSujetoCaso?: string;
  idCasoFiscal?: string;
  tipoParteSujeto?: FormControl<ListItemResponseForm>;
  tipoPartePersona?: FormControl<ListItemResponseForm>;
  condicionSujeto?: FormControl<ListItemResponseForm>;
  tipoDocumentoNatural?: FormControl<ListItemResponseForm>;
  registroManual?: boolean;
  registroJuridicaManual?: boolean;
  registroJuridicaDeclaranteManual?: boolean;
  tipoDocumentoDeclarante?: FormControl<ListItemResponseForm>;

  nuDocumento?: string;
  nuDocumentoJuridica?: string;
  imagenBase64?: string;
  paternoSujeto?: string;
  maternoSujeto?: string;
  nombresSujeto?: string;
  fechaNacimiento?: Date;
  edadSujeto?: number;
  estadoCivil?: number;
  gradoInstruccion?: number;
  oficioProfesion?: string;
  sexoSujeto?: number;
  flgExtranjero?: string;
  flgVerficiadoReniec?: boolean;
  flgVerficiadoSunat?: boolean;
  paisSujeto?: FormControl<ListItemResponseForm>;
  razonSocial?: string;
  correoDeclaranteSujeto?: string;
  telefonoDeclaranteSujeto?: string;
  nuDocumentoDeclarante?: string;
  nombresDeclaranteSujeto?: string;
  paternoDeclaranteSujeto?: string;
  maternoDeclaranteSujeto?: string;
  listaDirecciones?: any;
  consultaReniec?: DatosReniec;
}

export interface InformacionGeneralSujetoResponse {
  index?: number;
  idSujetoCaso?: string;
  idCasoFiscal?: string;
  tipoParteSujeto?: ListItemResponseForm;
  tipoPartePersona?: ListItemResponseForm;
  condicionSujeto?: ListItemResponseForm;
  tipoDocumentoNatural?: ListItemResponseForm;
  tipoDocumentoExtranjero?: ListItemResponseForm;
  registroManual?: boolean;
  registroJuridicaManual?: boolean;
  registroJuridicaDeclaranteManual?: boolean;
  tipoDocumentoDeclarante?: ListItemResponseForm;

  nuDocumento?: string;
  nuDocumentoJuridica?: string;
  imagenBase64?: string;
  paternoSujeto?: string;
  maternoSujeto?: string;
  nombresSujeto?: string;
  fechaNacimiento?: Date;
  edadSujeto?: number;
  estadoCivil?: ListItemResponseForm;
  gradoInstruccion?: ListItemResponseForm;
  profesionOficio?: ListItemResponseForm;
  otroProfesionOficio?: string;
  sexoSujeto?: ListItemResponseForm;
  flgExtranjero?: string;
  paisSujeto?: ListItemResponseForm;
  razonSocial?: string;
  correoDeclaranteSujeto?: string;
  telefonoDeclaranteSujeto?: string;
  nuDocumentoDeclarante?: string;
  nombresDeclaranteSujeto?: string;
  paternoDeclaranteSujeto?: string;
  maternoDeclaranteSujeto?: string;
  listaDirecciones?: any;
  consultaReniec?: DatosReniec;
  rdOrigen?: string;
  denunciaVerbal?: boolean;
  formValido?:boolean;

  cargoFuncionario?: number;
  institucionPublica?: number;
  tipoDefensor?: number;
  cargoAsociacion?: number;
  condicionParte?: number;
  tipoViolencia?: number;
  tipoRiesgo?: number;
  tipoDiscapacidad?: number;

  flgEsMenorEdad?: boolean;
}


export interface DatosReniec {
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  edad: number;
  codigoGenero: string;
  codigoPaisNacimiento: null;
  codigoPaisDomicilio: null;
  codigoDepartamentoDomicilio: string;
  codigoProvinciaDomicilio: string;
  codigoDistritoDomicilio: string;
  ubigeoDomicilio: string;
  codigoPrefijoDireccion: number;
  codigoPrefijoDomicilio: string;
  direccionDomicilio: string;
  etapaDomicilio: string;
  interiorDomicilio: string;
  tipoUrbanizacion: string;
  urbanizacion: string;
  manzanaDomicilio: string;
  loteDomicilio: string;
  block: string;
  validado: null;
  esMenorEdad: string;
  codigoGradoInstruccion: string;
  nombrePadre: string;
  nombreMadre: string;
  apellidoMaternoMadre: null;
  apellidoMaternoPadre: null;
  apellidoPaternoMadre: null;
  apellidoPaternoPadre: null;
  foto: string;
  tipoEstadoCivil: string;
  descripcionPrefijoBlock: string;
  descripcionPrefijoInterior: string;
  direccionCompleta: string;
  descripcionDepartamentoDomicilio: string;
  descripcionDistritoDomicilio: string;
  descripcionProvinciaDomicilio: string
}


export interface InformacionGeneralSujetoApi {
  idSujetoCaso: string;
  idCasoFiscal: string;
  tipoParteSujeto: number;//ListItemResponseForm
  tipoPartePersona: number;//ListItemResponseForm
  condicionSujeto?: number;//ListItemResponseForm
  tipoDocumentoNatural?: number;//ListItemResponseForm
  registroManual?: string;
  registroJuridicaManual?: string;
  registroJuridicaDeclaranteManual?: string;
  tipoDocumentoDeclarante?: number;//ListItemResponseForm
  nuDocumento?: string;
  nuDocumentoJuridica?: string;
  imagenBase64?: string;
  paternoSujeto?: string;
  maternoSujeto?: string;
  nombresSujeto?: string;
  fechaNacimiento?: Date;
  edadSujeto?: number;
  estadoCivil?: number;//ListItemResponseForm
  gradoInstruccion?: number;//ListItemResponseForm
  profesionOficio?: number;
  otroProfesionOficio?: string;
  sexoSujeto?: number;//ListItemResponseForm
  flgExtranjero?: string;
  paisSujeto?: number;//ListItemResponseForm
  razonSocial?: string;
  correoDeclaranteSujeto?: string;
  telefonoDeclaranteSujeto?: string;
  nuDocumentoDeclarante?: string;
  nombresDeclaranteSujeto?: string;
  paternoDeclaranteSujeto?: string;
  maternoDeclaranteSujeto?: string;

  cargoFuncionario?: number;
  institucionPublica?: number;
  tipoDefensor?: number;
  cargoAsociacion?: number;
  condicionParte?: number;
  tipoViolencia?: number;
  tipoRiesgo?: number;
  tipoDiscapacidad?: number;

  listaDirecciones?: any;

  flgEsMenorEdad?: string;

}
