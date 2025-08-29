import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Alerta} from "@interfaces/comunes/alerta";

@Injectable({
  providedIn: 'root'
})
export class ConsultaCasosSharedService {
  private showtabSubject = new BehaviorSubject<boolean>(false);
  showtab$ = this.showtabSubject.asObservable();

  constructor() {
  }

  showTab(blShow: boolean) {
    this.showtabSubject.next(blShow);
  }
}
