import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  standalone: true,
  selector: 'indicador-dash',
  templateUrl: './indicador.component.html',
  styleUrls: ['./indicador.component.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DropdownModule,
    InputTextareaModule, CheckboxModule, CommonModule, ButtonModule, CalendarModule, RadioButtonModule,
  ],
})
export class IndicadorComponent implements OnInit {
  public razon = new FormControl('', [Validators.required]);

  @Input() listaIndicadores: string = '';
  @Input() index: number = 0;
  @Output() redireccionarBandeja = new EventEmitter()

  public subscriptions: Subscription[] = [];

  indicador: any = [];
  icons: any = {
    fondoAmarillo: 'elevacionActuados.svg',
    fondoVerde: 'apelaciones.svg',
    fondoAzul: 'contiendaCompetencia.svg',
    fondoPlomo: 'elevacionesConsulta.svg',
    fondoRojo: 'solicitudesExclusion.svg',
    fondoguinda: 'retiroAcusacion.svg',
  };

  colorIcono: any = '';

  async ngOnInit() {
    let _listaIndicadores = JSON.parse(this.listaIndicadores);

    this.indicador = _listaIndicadores[this.index];
    let colores = [
      '#F19700',
      '#058664',
      '#05106c',
      '#CFD5DB',
      '#C1292E',
      '#353535',
      '#963CBE',
    ];
    this.colorIcono = colores[this.index];

  }

  getIcon(icon: string) {
    return `assets/icons/${this.icons[icon]}`
  }

  goToBandeja() {
    this.redireccionarBandeja.emit()
  }
}
