import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BandejaFiscaliaSuperiorService } from '@services/superior/bandeja/bandeja-fiscalia-superior';
import { IndicadorComponent } from '@modules/inicio/dash/indicador/indicador.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-not-found',
  standalone: true,

  imports: [CommonModule, IndicadorComponent],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {
  listaIndicadores = [];
  listaIndicadoresTexto: any = '';
  public subscriptions: Subscription[] = [];
  constructor(
    private bandejaFiscaliaSuperiorService: BandejaFiscaliaSuperiorService
  ) {}

  lstIndicadores: any;

  verListaIndicadores() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.bandejaFiscaliaSuperiorService
          .obtenerIndicadoresFiscaliaSuperior()
          .subscribe({
            next: (resp) => {
              console.log(resp);
              this.lstIndicadores = resp.data;
              resolve(resp.data);
            },
          })
      );
    });
  }

  ngOnInit() {
    this.verListaIndicadores().then((x) => {
      this.listaIndicadoresTexto = JSON.stringify(x);
    });
  }
}
