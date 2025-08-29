import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { IconUtil } from 'ngx-cfng-core-lib';
import { Component, input, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { JsonPipe } from '@angular/common';
import { PronunciamientoTramiteService } from '@core/services/superior/casos-elevados/pronunciamiento-tramite.service';

@Component({
  selector: 'app-partes-delitos',
  standalone: true,
  imports: [
    TableModule,
    CmpLibModule,
    JsonPipe
  ],
  templateUrl: './partes-delitos.component.html',
  styleUrl: './partes-delitos.component.scss'
})
export class PartesDelitosComponent implements OnInit {

  public idCaso = input<string>('');
  protected datos = signal<any[]>([]);

  constructor(
    protected readonly iconUtil: IconUtil,
    private readonly pronunciamientoTramiteService: PronunciamientoTramiteService
  ) { }

  ngOnInit(): void {
    this.pronunciamientoTramiteService.obtenerPartesDelitos( this.idCaso() ).subscribe({
      next: (rs) => {
        console.log('Partes y delitos', rs);
        this.datos.set( rs );
      }
    });
  }

  protected agruparPorParte = (lista: { nombres: string; parte: string }[]) => {
    const mapa = new Map<string, string[]>(); // Se usa Map para mejor rendimiento

    for (const { parte, nombres } of lista) {
      if (!mapa.has(parte)) {
        mapa.set(parte, []);
      }
      mapa.get(parte)!.push(nombres);
    }

    return Array.from(mapa, ([grupo, sujetos]) => ({ grupo, sujetos }));
  };
}
