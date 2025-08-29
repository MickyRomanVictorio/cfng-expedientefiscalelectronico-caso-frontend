import {Injectable} from "@angular/core";
import { SelectActoProcesalRequest } from "@core/interfaces/provincial/bandeja-tramites/SelectedActoTramiteRequest";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SelectedActoTramiteProcesalService {

  private filtroBusqueda$ = new BehaviorSubject<SelectActoProcesalRequest | null>(null);

  getIdTramite() {
    return this.filtroBusqueda$.asObservable();
  }

  setIdTramite(value: SelectActoProcesalRequest) {
    this.filtroBusqueda$.next(value);
  }
}
