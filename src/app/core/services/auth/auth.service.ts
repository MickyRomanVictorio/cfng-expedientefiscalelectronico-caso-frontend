import { Injectable } from '@angular/core';
import { ApiBaseService } from '../shared/api.base.service';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private apiBase: ApiBaseService) { }


  login(body: object): Observable<any> {
    return this.apiBase.post(BACKEND.CFETOKEN, body);
  }
}
