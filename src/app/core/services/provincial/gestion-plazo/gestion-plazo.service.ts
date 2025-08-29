import {Injectable} from "@angular/core";
import {
  ObtenerValorMaxPlazoRequest,
  RegistrarPlazoRequest,
  ValidarPlazoComplejo
} from "@core/interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import {BACKEND} from "@environments/environment";


@Injectable({
  providedIn: 'root'
})
export class GestionPlazoService {

  constructor(private apiBase: ApiBaseService) {
  }

  public registrarPlazo(body: RegistrarPlazoRequest) {
    const url = `${BACKEND.CFE_EFE}/v1/e/caso/gestionplazo/registrar`
    return this.apiBase.post(url, body);
  }

  public obtenerValoMaxPlazo(body: ObtenerValorMaxPlazoRequest) {
    const url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/gestionplazo/obtener-valor-max-plazo`
    return this.apiBase.post(url, body);
  }

  public validarPlazoComplejidad(body: ValidarPlazoComplejo) {
    const url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/gestionplazo/validar-plazo`
    return this.apiBase.post(url, body);
  }

  public obtenerPlazoActual(idCaso: string) {
    const url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/gestionplazo/${idCaso}/obtener-plazo-actual`
    return this.apiBase.get(url)
  }

}
