import { Injectable } from '@angular/core';
import { PerfilJerarquia } from '@core/models/usuario-auth.model';
import { CasoFiscal, Plazo } from '../models/listar-casos.model';
import { EtiquetaClasesCss, PlazosLeyenda, PlazosLeyendaClasesCss, TipoElevacionCodigo } from '@core/constants/superior';

@Injectable({
  providedIn: 'root'
})
export class ConsultaCasosGestionService {

  private readonly esSoloLectura = (flgLectura: string | undefined, flgConcluido: string | undefined): boolean =>
    flgLectura?.toString() === '1' || flgConcluido?.toString() === '1';

  private readonly tienePlazoVencido = (plazos: Plazo[] | undefined): boolean =>
    plazos?.some(plazo => plazo.flgNivel === 'C' && plazo.indSemaforo === 3) ?? false;

  public getTarjetaTituloEstilo(jerarquia: PerfilJerarquia, caso: CasoFiscal): string {
    if (jerarquia === PerfilJerarquia.Superior || jerarquia === PerfilJerarquia.Provincial) {
      if (this.esSoloLectura(jerarquia === PerfilJerarquia.Superior ? caso.flgLecturaSuperior : caso.flgLectura, caso.flgConcluido)) {
        return 'solo-lectura';
      }
      if (this.tienePlazoVencido(caso.plazos)) {
        return 'plazo-vencido';
      }
      if (caso.flgCasoLeido === '1') {
        return 'leido';
      }
    }
    return '';
  }

  public getFilaEstilo(jerarquia: PerfilJerarquia, caso: CasoFiscal): string {
    if (jerarquia === PerfilJerarquia.Superior || jerarquia === PerfilJerarquia.Provincial) {
      if (this.esSoloLectura(jerarquia === PerfilJerarquia.Superior ? caso.flgLecturaSuperior : caso.flgLectura, caso.flgConcluido)) {
        return '#1B1C1E';
      }
      if (this.tienePlazoVencido(caso.plazos)) {
        return '#F4D8D8';
      }
      if (caso.flgCasoLeido === '1') {
        return '#E7EAED';
      }
    }
    return '';
  }

  public getNombreDelitos(delitos: any[], mostrarMax: number = 20): string {
    const result = delitos.slice(0, 2).map(curr => curr.nombre.toLowerCase().replace(/^\w/, (match: string) => match.toUpperCase())).join(', ');
    return result.length > mostrarMax ? result.substring(0, mostrarMax) + '...' : result;
  }

  public getLeyendaPlazosClasesCss(): { [key: string]: string } {
    return PlazosLeyendaClasesCss;
  }
  public getEtiquetaPlazosClasesCss(): { [key: string]: string } {
    return EtiquetaClasesCss;
  }

  public getLeyendaPlazos(): { codigo: string; nombre: string; cantidad: number; clasesCss: string }[] {
    return PlazosLeyenda;
  }

  //#region Color etiquetas
  /**
   * Verifica el tipo de elevación y retorna la etiqueta con su color correspondiente.
   *
   * @param tipoElevacion Tipo de elevación
   * @param datos Datos relevantes para la evaluación
   * @param tipoColor '1' para usar constantes de clase CSS, '2' para valores RGB (texto|fondo)
   * @returns Un objeto con el color y valor de la etiqueta
   */
  public getEtiquetaXTipoElevacion(
    tipoElevacion: string,
    datos: {
      color?: string;
      valor?: string;
      esContiendaCompetencia?: string;
      nuApelacion?: string;
      nuCuaderno?: string;
      etiqueta?: string
    },
    tipoColor: '1' | '2' = '1'
  ): { color: string; valor: string } {
    if (!tipoElevacion) return { color: this.obtenerColorPorDefecto(tipoColor), valor: '' };
    switch (tipoElevacion) {
      case TipoElevacionCodigo.ContiendaCompetencia:
        return this.obtenerEtiquetaContienda(datos, tipoColor);
      case TipoElevacionCodigo.ApelacionesAutoIncidental:
      case TipoElevacionCodigo.ApelacionesAutoPrincipal:
      case TipoElevacionCodigo.ApelacionesAutoExtremos:
        return this.obtenerEtiquetaApelacion(datos, tipoColor);
      case TipoElevacionCodigo.ApelacionesSentencia:
        return this.obtenerEtiquetaApelacionSentencia(datos, tipoColor);
      case TipoElevacionCodigo.ElevacionActuados:
        return this.obtenerEtiquetaActuados(datos, tipoColor);
      case TipoElevacionCodigo.ExclusionFiscal:
        return this.obtenerEtiquetaExclusionFiscal(datos, tipoColor);
      case TipoElevacionCodigo.RetiroAcusacion:
        return this.obtenerEtiquetaRetiroAcusacion(datos, tipoColor);
      default:
        return { color: this.obtenerColorPorDefecto(tipoColor), valor: datos.etiqueta ?? '' };
    }
  }

  /**
   * Obtiene la etiqueta y color de la contienda de competencia.
   */
  private obtenerEtiquetaContienda(
    datos: { esContiendaCompetencia?: string; etiqueta?: string },
    tipoColor: '1' | '2'
  ): { color: string; valor: string } {
    if (datos.esContiendaCompetencia) {
      const esPositiva = datos.esContiendaCompetencia === '1';
      return {
        color: this.obtenerColorContienda(esPositiva, tipoColor),
        valor: esPositiva ? 'Positiva' : 'Negativa'
      };
    }

    return {
      color: tipoColor === '1' ? '6' : '255,255,255|217,179,78',
      valor: datos.etiqueta ?? ''
    };
  }

  /**
   * Obtiene la etiqueta y color para Apelaciones.
   */
  private obtenerEtiquetaApelacion(
    datos: { nuApelacion?: string; nuCuaderno?: string; etiqueta?: string },
    tipoColor: '1' | '2'
  ): { color: string; valor: string } {
    if (datos.nuApelacion) {
      return {
        color: tipoColor === '1' ? '5' : '18,111,83|201,242,230',
        valor: `Apelación N° ${datos.nuApelacion}`
      };
    }

    if (datos.nuCuaderno) {
      return {
        color: tipoColor === '1' ? '8' : '',
        valor: `C. Incidental N° 2 ${datos.nuCuaderno}`
      };
    }

    return {
      color: tipoColor === '1' ? '5' : '255,255,255|193,41,46',
      valor: datos.etiqueta ?? ''
    };
  }

  private obtenerEtiquetaApelacionSentencia(
    datos: { nuApelacion?: string; nuCuaderno?: string; etiqueta?: string },
    tipoColor: '1' | '2'
  ): { color: string; valor: string } {
    if (datos.nuApelacion) {
      return {
        color: tipoColor === '1' ? '5' : '18,111,83|201,242,230',
        valor: `Apelación N° ${datos.nuApelacion}`
      };
    }

    if (datos.nuCuaderno) {
      return {
        color: tipoColor === '1' ? '8' : '',
        valor: `C. Incidental N° 2 ${datos.nuCuaderno}`
      };
    }

    return {
      color: tipoColor === '1' ? '5' : '81,113,88|216,244,222',
      valor: datos.etiqueta ?? ''
    };
  }

  /**
   * Obtiene la etiqueta y color para Elevación de Actuados.
   */
  private obtenerEtiquetaActuados(
    datos: { etiqueta?: string },
    tipoColor: '1' | '2'
  ): { color: string; valor: string } {
    return {
      color: tipoColor === '1' ? '5' : '255,255,255|0,0,0',
      valor: datos.etiqueta ?? ''
    };
  }

  /**
   * Obtiene el color de la contienda según si es positiva o negativa.
   */
  private obtenerColorContienda(esPositiva: boolean, tipoColor: '1' | '2'): string {
    return tipoColor === '1'
      ? (esPositiva ? '8' : '9')
      : (esPositiva ? '255,255,255|59,138,253' : '0,68,140|233,236,239');
  }

  /**
   * Obtiene el color por defecto según el tipo de formato.
   */
  private obtenerColorPorDefecto(tipoColor: '1' | '2'): string {
    return tipoColor === '1' ? '1' : '0,0,0|255,255,255';
  }

  /**
   * Obtiene la etiqueta y color para Elevación de Actuados.
   */
  private obtenerEtiquetaExclusionFiscal(
    datos: { etiqueta?: string },
    tipoColor: '1' | '2'
  ): { color: string; valor: string } {
    return {
      color: tipoColor === '1' ? '5' : '255,255,255|14,46,74',
      valor: datos.etiqueta ?? ''
    };
  }
  //#endregion

  private obtenerEtiquetaRetiroAcusacion(
    datos: { etiqueta?: string },
    tipoColor: '1' | '2'
  ): { color: string; valor: string } {
    return {
      color: tipoColor === '1' ? '5' : '220,53,69|248,215,218',
      valor: datos.etiqueta ?? ''
    };
  }

}
