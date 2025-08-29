import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { obtenerIcono } from "@utils/icon";
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-apelacion-sentencia',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    CmpLibModule
  ],
  templateUrl: './apelacion-sentencia.component.html',
  styleUrls: ['./apelacion-sentencia.component.scss'],
  providers :[MessageService, DialogService, DatePipe]
})
export class ApelacionSentenciaComponent {
  public id_apelacion:number=0;

  constructor(
    private route: ActivatedRoute,
    private router: Router
    ){

  }

  ngOnInit(): void {
    this.id_apelacion = this.route.snapshot.data['idTipoElevacion'];
    console.log("id tipo apelacion senetencia",this.route.snapshot.data['idTipoElevacion']);
  }

  public icono( nombre: string ): any {
    return obtenerIcono( nombre )
  }

  verCasoResuelto(){
    const ruta =`app/administracion-casossuperior/apelacion/listar-casos-resueltos/${this.id_apelacion}`
    this.router.navigate([`${ruta}`])
  }

}
