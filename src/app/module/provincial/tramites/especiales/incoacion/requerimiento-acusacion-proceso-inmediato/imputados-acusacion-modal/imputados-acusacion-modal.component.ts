import { Component, OnInit } from '@angular/core';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputadosAcusacion } from '@interfaces/provincial/tramites/especiales/incoacion/requerimiento-acusacion';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  RequerimientoAcusacionService
} from '@services/provincial/tramites/especiales/requerimiento-acusacion/requerimiento-acusacion.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-imputados-acusacion-modal',
  standalone: true,
  imports: [
    PrimeTemplate,
    TableModule,
    Button,
    NgClass
  ],
  templateUrl: './imputados-acusacion-modal.component.html',
  styleUrl: './imputados-acusacion-modal.component.scss'
})
export class ImputadosAcusacionModalComponent implements OnInit {

  constructor(private dialogRef: DynamicDialogRef,
              private requerimientoAcusacionService: RequerimientoAcusacionService) {
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  get listaImputados(): InputadosAcusacion[] {
    return this.requerimientoAcusacionService.listaImputados;
  }
}
