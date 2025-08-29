import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http: HttpClient) {}

  listarAplicaciones(userName:string): Observable<any> {
    return this.http.get(
      `${BACKEND.CFEAPLICACIONES}${userName}`
    );
  }

  listarOpciones(userName: string, idAplicacion : number): Observable<any> {
    console.log(`${BACKEND.CFEOPCIONES}${userName}/${idAplicacion}/`)
    return this.http.get(
      `${BACKEND.CFEOPCIONES}${userName}/${idAplicacion}/`
    );
  }
}
