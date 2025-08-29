import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DocumentoIngresadoNuevo } from "@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevo";
import { DocumentosBandejaComponent } from '@components/documentos-bandeja/documentos-bandeja.component';
import { RegistrarAgendaNotificacionesComponent } from '@components/registrar-agenda-notificacion/registrar-agenda-notificacion.component';
import { GestionarDisposicionProrrogaComponent } from '../../tramites/comun/preparatoria/gestionar-disposicion-prorroga/gestionar-disposicion-prorroga.component';


@Component({
  standalone: true,
  selector: 'app-documentos-agenda',
  templateUrl: './documentos-agenda.component.html',
  styleUrls: ['./documentos-agenda.component.scss'],
  imports: [
    CommonModule,
    DocumentosBandejaComponent,
    /*RegistrarAgendaNotificacionesComponent,*/
    GestionarDisposicionProrrogaComponent
  ]
})
export class DocumentosAgendaComponent implements OnInit {

  @Input() documentoIngresadoNuevos!: DocumentoIngresadoNuevo[];

  constructor() { }

  ngOnInit() {
  }
}
