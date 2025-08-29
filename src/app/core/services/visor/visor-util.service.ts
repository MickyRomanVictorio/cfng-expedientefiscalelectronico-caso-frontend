import { Injectable } from '@angular/core';
import { DatosArchivo, DatosArchivoSeleccionado, Etapas } from '@interfaces/visor/visor-interface';
import { VisorEfeService } from '@services/visor/visor.service';
import { ClasificadorExpedienteEnum } from '@constants/constants';
import { ClasificadorDocumentoEnum } from '@components/modals/visor-efe-modal/visor-efe-modal.component';

@Injectable({
  providedIn: 'root'
})
export class VisorUtilService {

  constructor(private readonly dataService: VisorEfeService) {}

  public codigoArchivoEnviar(idNode:string, nombreArchivo:string){
    return idNode+'|'+nombreArchivo;
  }

  public soloDocumentos(etapas: Etapas[]): DatosArchivo[] {
    let docs: DatosArchivo[] = [];
    etapas.forEach(item => {
      //
      // Almacenar los datos de datosArchivo sin fuenteInvestigacion
      if (item.datosArchivo.length>0) {
        item.datosArchivo.forEach(elm => {
          docs.push({ ...elm, fuenteInvestigacion: [] });
          if(elm.fuenteInvestigacion.length>0){
            elm.fuenteInvestigacion.forEach(fuente => {
              docs.push({ ...fuente, fuenteInvestigacion: [] });
            });
          }
        });
      }
      //
      // Recorrer los cuadernos incidentales y almacenar sus datos de datosArchivo sin fuenteInvestigacion
      const cuadernos = this.soloCuadernosItem(item);
      if(cuadernos.length>0){
        docs.push(...cuadernos);
      }
    });
    return docs;
  }

  public soloCuadernosItem(item: Etapas): DatosArchivo[] {
    let docs: DatosArchivo[] = [];
      // Recorrer los cuadernos incidentales y almacenar sus datos de datosArchivo sin fuenteInvestigacion
      if(item.cuadernoIncidental.length>0){
        item.cuadernoIncidental.forEach(cuaderno => {
          cuaderno.datosArchivo.forEach(elm => {
            docs.push({ ...elm, fuenteInvestigacion: [] });

            if(elm.fuenteInvestigacion.length>0){
              elm.fuenteInvestigacion.forEach(fuente => {
                docs.push({ ...fuente, fuenteInvestigacion: [] });
              });
            }
          });
        });
      }
    return docs;
  }

  public soloCuadernos(etapas: Etapas[]): DatosArchivo[] {
    let docs: DatosArchivo[] = [];
    etapas.forEach(item => {
      const cuadernos = this.soloCuadernosItem(item);
      if(cuadernos.length>0){
        docs.push(...cuadernos);
      }
    });
    return docs;
  }

  public forzarDescarga(response: Blob, nombreArchivo:string){
    const contentType = response.type;
    const blob = new Blob([response], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  public descargarArchivosZip(ids: string) {
    this.dataService.getDescargarArchivoZip(ids).subscribe({
      next: (response: Blob) => {
        this.forzarDescarga(response, 'documentos.zip');
      },
      error: (err) => {
        console.error('Error al descargar el archivo ZIP:', err);
      }
    });
  }

  public esNumeroValido(valor: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(valor.trim());
  }

  public filtratElemento(elementoFiltrado: Etapas, v: string): Etapas | null {
    const esNumero = this.esNumeroValido(v);
    const numero = esNumero ? Number(v) : null;
    if (elementoFiltrado.cuadernoIncidental) {
      elementoFiltrado.cuadernoIncidental = elementoFiltrado.cuadernoIncidental.map(cuaderno => {
        const cuadernoFiltrado = { ...cuaderno };
        if (cuadernoFiltrado.datosArchivo) {
          cuadernoFiltrado.datosArchivo = cuadernoFiltrado.datosArchivo.filter(archivo => {
            const coincideTexto =  archivo.nombreTipoDocumento.toLowerCase().includes(v)
              || archivo.nombreActoProcesal?.toLowerCase().includes(v)
              || archivo.nombreTramite?.toLowerCase().includes(v);
            const coincideNumero =
              esNumero && numero && archivo.folioInicio <= numero && archivo.folioFin >= numero;
            return coincideTexto || coincideNumero;
          });
        }
        // Solo mantener cuadernos que tienen datosArchivo después del filtrado
        return cuadernoFiltrado.datosArchivo && cuadernoFiltrado.datosArchivo.length > 0 ? cuadernoFiltrado : null;
      }).filter(cuaderno => cuaderno !== null); // Eliminar cuadernos que no tienen datos relevantes
    }

    // Solo mantener elementos que tienen datosArchivo, cuadernoIncidental o fuenteInvestigacion con datos relevantes
    if (
      (elementoFiltrado.datosArchivo && elementoFiltrado.datosArchivo.length > 0) ||
      (elementoFiltrado.cuadernoIncidental && elementoFiltrado.cuadernoIncidental.length > 0) /*||
        elementoFiltrado.fuenteInvestigacion*/
    ) {
      return elementoFiltrado;
    } else {
      return null;
    }
  }

  public filtrarTipoElemento(elementoFiltrado: Etapas, tipoSeleccionado: string): any {
    if (elementoFiltrado.datosArchivo) {
      elementoFiltrado.datosArchivo = elementoFiltrado.datosArchivo.filter(archivo => {
        if (tipoSeleccionado === '00') {
          return archivo.flgGenericoTipoDocumento === '1';
        } else {
          return archivo.idTipoDocumento === tipoSeleccionado;
        }
      });
    }

    // Filtrar datosArchivo dentro de cuadernoIncidental
    if (elementoFiltrado.cuadernoIncidental) {
      elementoFiltrado.cuadernoIncidental = elementoFiltrado.cuadernoIncidental.map(cuaderno => {
        const cuadernoFiltrado = { ...cuaderno };
        if (cuadernoFiltrado.datosArchivo) {
          cuadernoFiltrado.datosArchivo = cuadernoFiltrado.datosArchivo.filter(archivo => {
            if (tipoSeleccionado === '00') {
              return archivo.flgGenericoTipoDocumento === '1';
            } else {
              return archivo.idTipoDocumento === tipoSeleccionado;
            }
          });
        }
        // Solo mantener cuadernos que tienen datosArchivo después del filtrado
        return cuadernoFiltrado.datosArchivo && cuadernoFiltrado.datosArchivo.length > 0 ? cuadernoFiltrado : null;
      }).filter(cuaderno => cuaderno !== null); // Eliminar cuadernos que no tienen datos relevantes
    }

    // Solo mantener elementos que tienen datosArchivo, cuadernoIncidental o fuenteInvestigacion con datos relevantes
    if (
      (elementoFiltrado.datosArchivo && elementoFiltrado.datosArchivo.length > 0) ||
      (elementoFiltrado.cuadernoIncidental && elementoFiltrado.cuadernoIncidental.length > 0) /*||
        elementoFiltrado.fuenteInvestigacion*/
    ) {
      return elementoFiltrado;
    } else {
      return null;
    }
  }

  public soloPdfSeleccionados(datoArchivoSeleccionados:DatosArchivoSeleccionado[], datoArchivo:DatosArchivo[]): boolean{
    let soloPdfSeleccionados:boolean = true;

    if(datoArchivoSeleccionados.length > 0){
      //Crear un objeto como mapa de búsqueda a partir de los IDs de los datos seleccionados
      const idCorrelativos:{ [key:number ]:boolean}={};
      datoArchivoSeleccionados.forEach( item => {
        idCorrelativos[item.correlativo] = true;
      });
      //Consultar los Ids de los archivos seleccionados
      soloPdfSeleccionados = datoArchivo.filter( elm => idCorrelativos[elm.correlativo] )
        .some(elm => elm.codigoExtension !=="2");
    }
    return !soloPdfSeleccionados;
  }


  public eventoDeseleccionarTodo(datoArchivoSeleccionados:DatosArchivoSeleccionado[], datoEtapaFiltro: Etapas[]) {
    //Lista de archivos seleccionados
    for (let index = datoArchivoSeleccionados.length - 1; index >= 0; index--) {
      const elm = datoArchivoSeleccionados[index];
      const etapa = datoEtapaFiltro.find(etapa => etapa.id === elm.idEtapa);
      //Documento Etapa Principal
      if (elm.idClasificadorExpediente === ClasificadorExpedienteEnum.Principal && elm.codigoClasificador === ClasificadorDocumentoEnum.Principal && etapa && etapa.datosArchivo) {
        etapa.datosArchivo.find(arc => arc.correlativo === elm.correlativo)!.seleccionado = false;
        //Documento Etapa Fuente de Investigacion
      }else if (elm.idClasificadorExpediente === ClasificadorExpedienteEnum.Principal && elm.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion && etapa && etapa.datosArchivo) {
        const datoArchivo = etapa.datosArchivo.find(arc => arc.correlativo === elm.correlativoPadre)!;
        datoArchivo.fuenteInvestigacion.find(arc => arc.correlativo === elm.correlativo)!.seleccionado = false;
        //
        //Documento de Cuaderno Incidental
      }else if (elm.idClasificadorExpediente === ClasificadorExpedienteEnum.CuadernoIncidental && etapa && etapa.cuadernoIncidental && etapa.cuadernoIncidental.length > 0) {
        const cuadernoInc = etapa.cuadernoIncidental.find(arc => arc.idCaso === elm.idCaso)!;
        if(elm.codigoClasificador === ClasificadorDocumentoEnum.Principal){
          cuadernoInc.datosArchivo.find(arc => arc.correlativo === elm.correlativo)!.seleccionado = false;
        }
        if(elm.codigoClasificador === ClasificadorDocumentoEnum.FuenteInvestigacion){
          const datoArchivo = cuadernoInc.datosArchivo.find(arc => arc.correlativo === elm.correlativoPadre)!;
          datoArchivo.fuenteInvestigacion.find(arc => arc.correlativo === elm.correlativo)!.seleccionado = false;
        }
      }
      // Remover el elemento después de procesarlo
      datoArchivoSeleccionados.splice(index, 1);
    }
  }

  public codigoArchjosSeleccionados(datoArchivoSeleccionados:DatosArchivoSeleccionado[], datoArchivo:DatosArchivo[]): string{
    if(datoArchivoSeleccionados.length > 0){
      //Crear un objeto como mapa de búsqueda a partir de los IDs de los datos seleccionados
      const idCorrelativos:{ [key:number ]:boolean}={};
      datoArchivoSeleccionados.forEach( item => {
        idCorrelativos[item.correlativo] = true;
      });
      //Consultar los Ids de los archivos seleccionados
      const rs = datoArchivo.filter( elm => idCorrelativos[elm.correlativo] ).map( elm =>  this.codigoArchivoEnviar(elm.idNode,elm.nombre) );
      return rs.join(',');
    }
    return "";
  }
}
