import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuSubject = new BehaviorSubject<any>(null);
  menu$: Observable<any> = this.menuSubject.asObservable();

  constructor(private http: HttpClient, private userservice: UsuarioService) {
    // Intenta cargar el menú desde sessionStorage al inicializar el servicio
    const storedMenu = sessionStorage.getItem('menuData');
    if (storedMenu) {
      this.menuSubject.next(JSON.parse(storedMenu));
    }
  }

  //cargando los menus
  cargarMenu(userName: string, idAplicacion : number): void {
    // Verifica si ya hay datos en el BehaviorSubject
    if (!this.menuSubject.getValue()) {
      this.userservice.listarOpciones(userName, idAplicacion).pipe(
        tap(data => {
          this.menuSubject.next(data);
          // Guarda los datos en sessionStorage
          sessionStorage.setItem('menuData', JSON.stringify(data));
        })
      ).subscribe();
    }
  }

  //limpiar el sessionStorage 'menuData'
  cleanMenu():void{
    sessionStorage.removeItem('menuData');
  }
}
