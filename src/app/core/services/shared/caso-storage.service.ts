// import { TipoOpcionCasoFiscal } from '@constants/menu';
import { Injectable } from '@angular/core';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
// import { StorageService } from '@core/services/shared/storage.service';
import { LOCALSTORAGE } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CasoStorageService {
  constructor(
    private casoService: Casos
  ) // private storageService: StorageService,
  {}

  actualizarInformacionCasoFiscal(idCaso: string) {
    return new Promise<any>(async (resolve, reject) => {
      let caso: any = await this.obtenerCasoFiscal(idCaso);
      let seteadoCorrecto: boolean = await this.setearCasoFiscalStorage(caso);
      if (!seteadoCorrecto) reject(false);
      //this.comunicacionSerice.emitirInformacionCasoFiscal();
      resolve(true);
    });
  }

  actualizarCasoFiscalTabDetalle(
    idCaso: string,
    idTab: string
    // tipoOpcion: TipoOpcionCasoFiscal = TipoOpcionCasoFiscal.Ninguna
  ) {
    return new Promise<any>(async (resolve, reject) => {
      let caso: any = await this.obtenerCasoFiscal(idCaso);
      //

      //
      // await this.setearSesionStorageCaso(caso, tipoOpcion);
      await this.setearTabDetalle(idTab);
      resolve(true);
    });
  }

  private obtenerCasoFiscal(idCaso: string) {
    return new Promise<any>((resolve, reject) => {
      this.casoService.obtenerCasoFiscal(idCaso).subscribe({
        next: (resp) => {
          resolve(resp);
        },
        error: (error) => {
          reject(false);
        },
      });
    });
  }

  private setearCasoFiscalStorage(data: any) {
    return new Promise<boolean>((resolve, reject) => {
      /*
      TODO:
      this.storageService.clearItem(LOCALSTORAGE.CASO_OBJETO_KEY)
      this.storageService.createItem(LOCALSTORAGE.CASO_OBJETO_KEY, JSON.stringify(data))
      */
      resolve(true);
    });
  }

  setearSesionStorageCaso(
    caso: any,
    // tipoOpcionCasoFiscal: TipoOpcionCasoFiscal = TipoOpcionCasoFiscal.Ninguna
  ) {
    return new Promise<boolean>((resolve, reject) => {
      /*
      TODO:
      this.storageService.clearItem(LOCALSTORAGE.CASO_KEY);
      this.storageService.createItem(LOCALSTORAGE.CASO_KEY, caso.idCaso);
      this.storageService.clearItem(LOCALSTORAGE.ETAPA_KEY);
      this.storageService.createItem(LOCALSTORAGE.ETAPA_KEY, caso.etapa);
      this.storageService.clearItem(LOCALSTORAGE.CASO_OBJETO_KEY);
      this.storageService.createItem(LOCALSTORAGE.CASO_OBJETO_KEY, JSON.stringify(caso));
      //
      this.storageService.clearItem(LOCALSTORAGE.TIPO_OPCION_CASO_FISCAL);
      this.storageService.createItem(LOCALSTORAGE.TIPO_OPCION_CASO_FISCAL, tipoOpcionCasoFiscal.toString());
      */
      resolve(true);
    });
  }

  setearTabDetalle(tab: string) {
    return new Promise<boolean>((resolve, reject) => {
      /*
      TODO:
      this.storageService.clearItem(LOCALSTORAGE.TAB_DETALLE_SELECCIONADO_KEY);
      this.storageService.createItem(LOCALSTORAGE.TAB_DETALLE_SELECCIONADO_KEY, tab);
      */
      resolve(true);
    });
  }
}
