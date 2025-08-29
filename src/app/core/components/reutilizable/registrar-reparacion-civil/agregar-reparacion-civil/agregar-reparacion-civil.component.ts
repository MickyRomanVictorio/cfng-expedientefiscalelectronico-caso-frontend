import { Component } from '@angular/core';
import { RegistrarEditarSujetosComponent } from '@core/components/reutilizable/registrar-reparacion-civil/registrar-editar-sujetos/registrar-editar-sujetos.component';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-agregar-reparacion-civil',
  standalone: true,
  imports: [
    ButtonModule,
    RegistrarEditarSujetosComponent
  ],
  templateUrl: './agregar-reparacion-civil.component.html',
  styleUrl: './agregar-reparacion-civil.component.scss'
})
export class AgregarReparacionCivilComponent {
  public data!:any;
  salidaAlterna!: boolean;
  tipoSentencia!:boolean;
  tipoAcuerdoActa!:string;
  delitosTramiteSujeto!: boolean;
  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
  }

  ngOnInit(): void {
    this.data = this.config.data;
    this.salidaAlterna = this.config.data?.salidaAlterna;
    this.tipoSentencia=this.config.data?.tipoSentencia;
    this.tipoAcuerdoActa=this.config.data?.tipoAcuerdoActa;
    this.delitosTramiteSujeto=this.config.data?.delitosTramiteSujeto;
  }
  close(data:any) {
    this.dialogRef.close(data);
  }
}
