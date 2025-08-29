import { ActivatedRoute } from '@angular/router';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { CommonModule } from '@angular/common';
import {Component} from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { FiltrarConsultaCasoComponent } from './components/filtrar-consulta-caso/filtrar-consulta-caso.component';
import { FormFilter } from '@core/interfaces/comunes/casosFiscales';
import { FormFilterElevacionSuperior } from '@core/interfaces/comunes/casosFiscales';
import { ListaCasosGridComponent } from './components/grilla-casos/grilla-casos.component';
import { PanelModule } from 'primeng/panel';
import { obtenerIcono } from "@utils/icon";

@Component({
  standalone: true,
  selector: 'app-consulta-casos',
  templateUrl: './listar-casos.component.html',
  styleUrls: ['./listar-casos.component.scss'],
  imports: [
    CommonModule,
    PanelModule,
    CmpLibModule,
    FiltrarConsultaCasoComponent,
    ListaCasosGridComponent
  ],
  providers: [DialogService]
})
export class ListarConsultaCasosComponent {

  protected titulo: string = '';
  protected generico: boolean = true;
  protected tipoProceso: number = 1;
  protected idEtapa: string | null = null;
  protected concluido = null;
  protected idTipoElevacion : string = '';
  protected filter: FormFilterElevacionSuperior = {};
  protected textoBuscado!: string;

  constructor(private route: ActivatedRoute) { };
  ngOnInit(): void {
    this.titulo = this.route.snapshot.data['titulo'];
    this.generico = this.route.snapshot.data['generico'];
    this.tipoProceso = this.route.snapshot.data['tipo_proceso'];
    this.idEtapa = this.route.snapshot.data['id_etapa'];
    this.concluido = this.route.snapshot.data['concluido'];
    this.idTipoElevacion = this.route.snapshot.data['idTipoElevacion'];
    this.evaluarPrimeraConsulta();
  }

  private evaluarPrimeraConsulta() {
    this.filter = {idTipoElevacion: this.idTipoElevacion};
    if (this.tipoProceso === 1 && this.idEtapa !== null) {
      this.filter = {
        ...this.filter,
        proceso: this.tipoProceso,
        etapa: this.idEtapa
      }
    } else if (this.tipoProceso === 2) {
      this.filter = {
        ...this.filter,
        proceso: this.tipoProceso
      }
    } else if (this.concluido) {
      this.filter = {
        ...this.filter,
        concluido: this.concluido
      }
    }
  }

  search($evt: FormFilter) {
    this.filter =  $evt
  }
  searchTerm!: string;

  handleSearchTermChange(term: string) {
      this.searchTerm = term;
  }

  buscarTexto(busca: string) {
    this.textoBuscado = busca;
  }

  public icono( nombre: string ): any {
    return obtenerIcono( nombre )
}

}
