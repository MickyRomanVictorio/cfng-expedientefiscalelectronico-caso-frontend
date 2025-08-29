import { Component, Input, OnInit } from '@angular/core';
import { interval, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { obtenerIcono } from '@core/utils/icon';

@Component({
  selector: 'app-cronometro',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule
  ],
  templateUrl: './cronometro.component.html',
  styleUrl: './cronometro.component.scss'
})
export class CronometroComponent implements OnInit {
  tiempo!: {
    dias: number;
    horas: number;
    minutos: number;
    segundos: number;
  };
  @Input()
  fechaFinalStr: string = '';
  @Input()
  nivel: number = 3;
  fechaFinal: Date = new Date();
  @Input() numeroCaso: string = '';
  ngOnInit(): void {
    this.tiempo = { dias: 0, horas: 0, minutos: 0, segundos: 0 };
    this.fechaFinal = new Date(this.fechaFinalStr);
    this.iniciar().subscribe(_ => { });
  }

  actualizarTiempo() {
    const now = new Date();
    const diff = this.fechaFinal.getTime() - now.getTime();
    if (diff <= 0) return;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor(diff / (1000 * 60));
    const secs = Math.floor(diff / 1000);

    this.tiempo.dias = days;
    this.tiempo.horas = hours - days * 24;
    this.tiempo.minutos = mins - hours * 60;
    this.tiempo.segundos = secs - mins * 60;
  }

  iniciar() {
    return interval(1000).pipe(
      map((x: number) => {
        this.actualizarTiempo();
        return x;
      })
    );
  }

  tiempoTextoEnHoras(): string {
    const horasTotales = (this.tiempo.dias * 24) + this.tiempo.horas;
    const minutos = this.tiempo.minutos.toString().padStart(2, '0');
    const segundos = this.tiempo.segundos.toString().padStart(2, '0');
    return `${horasTotales}:${minutos}:${segundos} horas`;
  }

  tiempoTexto(): string {
    const dias = this.tiempo.dias.toString().padStart(2, '0');
    const horas = this.tiempo.horas.toString().padStart(2, '0');
    const minutos = this.tiempo.minutos.toString().padStart(2, '0');
    const segundos = this.tiempo.segundos.toString().padStart(2, '0');
    return `${dias}:${horas}:${minutos}:${segundos}`;
  }

  public obtenerIcono(nombre: string): any {
    return obtenerIcono(nombre)
  }

}
