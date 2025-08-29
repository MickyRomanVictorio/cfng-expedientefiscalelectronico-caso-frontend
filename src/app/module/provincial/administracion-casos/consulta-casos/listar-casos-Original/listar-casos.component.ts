import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormFilter } from '@core/interfaces/comunes/casosFiscales';
// import { TipoOpcionCasoFiscal } from '@constants/menu';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DialogService } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { FiltrarConsultaCasoComponent } from './components/filtrar-consulta-caso/filtrar-consulta-caso.component';
import { ListaCasosGridComponent } from './components/grilla-casos/grilla-casos.component';
import { IconUtil } from 'ngx-cfng-core-lib';

@Component({
  standalone: true,
  selector: 'app-consulta-casos',
  templateUrl: './listar-casos.component.html',
  imports: [
    CommonModule,
    PanelModule,
    CmpLibModule,
    FiltrarConsultaCasoComponent,
    ListaCasosGridComponent,
  ],
  providers: [DialogService],
})
export class ListarConsultaCasosComponent {
  protected titulo: string = '';
  protected generico: boolean = true;
  protected tipoProceso: number = 1;
  protected idEtapa: string | null = null;
  protected concluido = null;
  protected filter: FormFilter = {};
  protected textoBuscado!: string;
  protected searchTerm!: string;

  // protected tipoOpcionCasoFiscal: TipoOpcionCasoFiscal = TipoOpcionCasoFiscal.Ninguna;

  constructor(private route: ActivatedRoute,
    protected iconUtil: IconUtil
  ) { }

  ngOnInit(): void {
    this.titulo = this.route.snapshot.data['titulo'];
    this.generico = this.route.snapshot.data['generico'];
    this.tipoProceso = this.route.snapshot.data['tipo_proceso'];
    this.idEtapa = this.route.snapshot.data['id_etapa'];
    this.concluido = this.route.snapshot.data['concluido'];
    // this.tipoOpcionCasoFiscal = this.route.snapshot.data['tipoOpcion'];
    this.evaluarPrimeraConsulta();
  }

  private evaluarPrimeraConsulta() {
    if (this.tipoProceso === 1 && this.idEtapa !== null) {
      this.filter = {
        ...this.filter,
        proceso: this.tipoProceso,
        etapa: this.idEtapa,
      };
    } else if (this.tipoProceso === 2) {
      this.filter = {
        ...this.filter,
        proceso: this.tipoProceso,
      };
    } else if (this.concluido) {
      this.filter = {
        ...this.filter,
        concluido: this.concluido,
      };
    }
  }

  protected search($evt: FormFilter) {
    this.filter = { ...this.filter, ...$evt }
  }

  protected handleSearchTermChange(term: string) {
    this.searchTerm = term;
  }

  protected buscarTexto(busca: string) {
    this.textoBuscado = busca;
  }

}

