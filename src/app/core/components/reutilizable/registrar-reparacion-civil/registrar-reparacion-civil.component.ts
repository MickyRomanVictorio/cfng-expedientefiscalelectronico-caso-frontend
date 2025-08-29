import { Component, inject, Input, ViewChild } from '@angular/core';
import { CmpLibModule } from 'dist/cmp-lib';
import { BadgeModule } from 'primeng/badge';
import { TabViewModule } from 'primeng/tabview';
import { TabsViewComponent } from '@core/components/tabs-view/tabs-view.component';
import { Tab } from '@core/interfaces/comunes/tab';
import { RegistrarEditarAcuerdosCuotasComponent } from './registrar-editar-acuerdos-cuotas/registrar-editar-acuerdos-cuotas.component';
import { ListaReparacionCivilComponent } from './lista-reparacion-civil/lista-reparacion-civil.component';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { RegistrarEditarSujetosComponent } from './registrar-editar-sujetos/registrar-editar-sujetos.component';
import { DatosReparacionCivilInput } from '@core/interfaces/reusables/reparacion-civil/datos-reparacion-civil-input';
import { BehaviorSubject } from 'rxjs';
import { DatosEditarReparacionCivil } from '@core/interfaces/reusables/reparacion-civil/datos-editar-reparacion-civil';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registrar-reparacion-civil',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    BadgeModule,
    TabViewModule,
    TabsViewComponent,
    ListaReparacionCivilComponent,
    RegistrarEditarAcuerdosCuotasComponent,
    RegistrarEditarSujetosComponent
  ],
  templateUrl: './registrar-reparacion-civil.component.html',
  styleUrl: './registrar-reparacion-civil.component.scss'
})
export class RegistrarReparacionCivilComponent {
  /**
   * 🟢 **Variable de tipo DatosReparacionCivilInput**
   * - Envia los campos `idActoTramiteCaso ` y `idCaso`
   */
  @Input() data!: DatosReparacionCivilInput;
  /**
   * 🔘 **Variable de salida alterna de valor booleano**
   * - **Nota:** Si es verdadero mostrará el combo de selección de salida alterna al registrar o editar
   */
  @Input() salidaAlterna!: boolean;
  /**
   * 🔘 **Variable de tipo de sentencia de valor booleano**
   * - **Nota:** Si es verdadero mostrará los combos de selección de tipo de sentencia para cada delito de todos los deudores
   */
  @Input() tipoSentencia!: boolean;
  /**
   * 🔘 **Variable de valor booleano***
   * - **Nota:** Si es verdadero no permitirá hacer ninguna accion de registro, edición y eliminación
   */
  @Input() modoLectura!: boolean;
  /**
   * 🔘 **Variable para validar si viene de Principio Oportunidad o Acuerdo Reparatorio**
   */
  @Input() tipoAcuerdoActa!: string;
  /**
   * 🔘 **Variable para mostrar los delitos de los sujetos por caso o por el trámite actual*
   */
  @Input() delitosTramiteSujeto!: boolean;

  @ViewChild(RegistrarEditarSujetosComponent) registrarEditarSujetosComponent!: RegistrarEditarSujetosComponent;

  @ViewChild(RegistrarEditarAcuerdosCuotasComponent) registrarEditarAcuerdosCuotasComponent!: RegistrarEditarAcuerdosCuotasComponent;

  protected idReparacionCivilSubject = new BehaviorSubject<string>('');

  protected datosEditarReparacionCivilSubject = new BehaviorSubject<DatosEditarReparacionCivil | null>(null);

  protected datosEditarReparacionCivil!: DatosEditarReparacionCivil | null;

  protected dataReparacionCivilEditado!: any;

  protected desactivarTabs: boolean = true;

  protected desactivarBotonCuotas: boolean = true;

  protected desactivarBotonSujetos: boolean = true;

  protected readonly iconUtil = inject(IconUtil)

  public indexActivo: number = 0;

  protected tabs: Tab[] = [
    {
      id:0,
      titulo: 'Datos de la reparación civil',
      ancho: 300,
    },
    {
      id:1,
      titulo: 'Sujetos Procesales',
      ancho: 200,
    }
  ];

  protected cambiarTab(indiceTab: number) {
    this.indexActivo = indiceTab;
  }

  protected enviarDatosAcuerdoCuotasySujetos(datosEditarReparacionCivil: DatosEditarReparacionCivil | null): void {
    this.datosEditarReparacionCivilSubject.next(datosEditarReparacionCivil);
    this.datosEditarReparacionCivil = datosEditarReparacionCivil;
    this.desactivarTabs = (datosEditarReparacionCivil == null);
    this.cambiarTab(0);
  }

  protected recibirMensajeGuardar(valor: any) {
    this.dataReparacionCivilEditado = valor;
    this.cambiarTab(0);
  }
  protected recibirEnviarEstadoBotonCuotas(valor: any) {
    this.desactivarBotonCuotas = valor;
  }
  protected recibirEnviarEstadoBotonSujeto(valor: any) {
    this.desactivarBotonSujetos = valor;
  }

  protected async guardarCuotasySujetos(): Promise<void> {
    const responseSujeto: DatosEditarReparacionCivil | null = await this.registrarEditarSujetosComponent.guardar();
    if (responseSujeto) {
      if(!this.desactivarBotonCuotas){ //SOLO SE EJECUTARA SI EL FORMULARIO DE CUOTAS ESTA  CORRECTO
        const responseCuotas: DatosEditarReparacionCivil | null = await this.registrarEditarAcuerdosCuotasComponent.guardarAcuerdoActaReparacionCivil(responseSujeto?.idReparacionCivil);
        if (responseCuotas) {
          this.recibirMensajeGuardar(responseSujeto);
        }
        else{
          this.cambiarTab(0);
        }
      }
      else{
        this.recibirMensajeGuardar(responseSujeto);
      }
    }
    else{
      this.cambiarTab(1);
    }
  }

}
