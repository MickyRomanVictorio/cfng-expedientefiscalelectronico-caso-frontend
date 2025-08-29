import { Injectable } from '@angular/core';
import { BACKEND, DOMAIN_BACK_LOCAL_SUJETOS } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { ApelacionesProcesoInmediato } from '@core/interfaces/provincial/tramites/fundado-procedente/apelaciones-proceso-inmediato';

@Injectable({
    providedIn: 'root'
})
export class ResumenFundadaProcedenteService {
    
    constructor(
        private apiBase: ApiBaseService
    ) { }

}
