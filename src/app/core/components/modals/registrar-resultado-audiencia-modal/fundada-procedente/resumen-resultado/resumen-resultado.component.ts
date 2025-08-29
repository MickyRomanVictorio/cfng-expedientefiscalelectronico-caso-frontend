import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ApelacionesResultadosService } from '@core/services/provincial/tramites/especiales/registrar-resultado-audiencia/fundada-procedente/apelaciones-resultados.service';
import { capitalizedFirstWord } from '@core/utils/string';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { te } from 'date-fns/locale';

@Component({
  selector: 'app-resumen-resultado',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ButtonModule
  ],
  templateUrl: './resumen-resultado.component.html',
  styleUrl: './resumen-resultado.component.scss'
})
export class ResumenResultadoComponent {
  @Input() data!: any;
  idActoTramiteCaso!: string;
  idCaso!: string;
  listaImputados: any = [];
  listaAgraviadosActores: any = [];
  public subscriptions: Subscription[] = [];
  capitalizedFirstWord = capitalizedFirstWord;
  constructor(
    private readonly apelacionesResultadosService: ApelacionesResultadosService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
  }
  ngOnInit() {
    this.idActoTramiteCaso = this.data?.idActoTramiteCaso;
    this.idCaso = this.data?.idCaso;
    this.listarImputados();
    this.listarAgraviadosActores();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  listarImputados() {
    this.listaImputados = [];
    this.subscriptions.push(
      this.apelacionesResultadosService.listarResumenInputados(this.idActoTramiteCaso).subscribe({
        next: (resp) => {
          if (resp?.code === 200) {
            this.listaImputados = resp?.data;
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar listar el resumen de los imputados", 'Aceptar');
        }
      })
    );
  }

  listarAgraviadosActores() {
    this.listaAgraviadosActores = [];
    this.subscriptions.push(
      this.apelacionesResultadosService.listarResumenAgraviadosCivil(this.idActoTramiteCaso).subscribe({
        next: (resp) => {
          if (resp?.code === 200) {
            this.listaAgraviadosActores = resp?.data;
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar listar el resumen de los agraviados y actor civil", 'Aceptar');
        }
      })
    );
  }

  formatoSalidaAlterna(texto: string): string {
    if (texto.indexOf('/') >= 0) {
      const arr = texto.split('/');
      return arr.map(t => capitalizedFirstWord(t.trim())).join(' / ');
    } else {
      return capitalizedFirstWord(texto);
    }
  }

}
