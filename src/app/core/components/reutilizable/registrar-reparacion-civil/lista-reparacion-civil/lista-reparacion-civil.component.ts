import { REPARACION_CIVIL } from '@core/types/reutilizable/reparacion-civil.type';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatosEditarReparacionCivil } from '@core/interfaces/reusables/reparacion-civil/datos-editar-reparacion-civil';
import { DatosReparacionCivilInput } from '@core/interfaces/reusables/reparacion-civil/datos-reparacion-civil-input';
import { ListaReparacionCivil, ListaReparacionCivilSujetos } from '@core/interfaces/reusables/reparacion-civil/lista-reparacion-civil';
import { RegistrarReparacionCivilService } from '@core/services/reusables/otros/registrar-reparacion-civil.service';
import { capitalizedFirstWord, convertirMinusculayGuiones } from '@core/utils/string';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil} from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';
import { AgregarReparacionCivilComponent } from '../agregar-reparacion-civil/agregar-reparacion-civil.component';
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component';

@Component({
  selector: 'app-lista-reparacion-civil',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    MensajeGenericoComponent
  ],
  templateUrl: './lista-reparacion-civil.component.html',
  styleUrl: './lista-reparacion-civil.component.scss',
  providers: [DialogService, NgxCfngCoreModalDialogService],

})
export class ListaReparacionCivilComponent {

  private readonly subscriptions: Subscription[] = [];

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly registrarReparacionCivilService = inject(RegistrarReparacionCivilService)

  private readonly dialogService = inject(DialogService)

  protected readonly iconUtil = inject(IconUtil)

  @Input() data!: DatosReparacionCivilInput;

  @Input() salidaAlterna!: boolean;

  @Input() dataReparacionCivilEditado!:DatosEditarReparacionCivil;

  @Input() tipoSentencia!: boolean;

  @Input() modoLectura!: boolean;

  @Input() tipoAcuerdoActa!: string;
  
  @Input() delitosTramiteSujeto!: boolean;

  @Output() enviarDatosEditarReparacionCivil = new EventEmitter<DatosEditarReparacionCivil | null>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  protected REPARACION_CIVIL = REPARACION_CIVIL;
  
  protected idActoTramiteCaso!: string;

  protected idReparacionCivilSeleccion: string ="";

  protected secuenciaSeleccion:number = 0;

  protected idAcuerdosActa: string ="";

  protected listaReparacionCivil: ListaReparacionCivil[] = [];

  protected listaDuplicados: ListaReparacionCivil[] = []; // ES UNA LISTA PORQUE SE TENIA CONTEMPLADO AL INICIO QUE EL USUARIO PUDIERA DUPLICAR N VECES

  protected listaFiltrada: ListaReparacionCivil[] = [];

  protected mostrarModalAgregar: boolean = false;

  protected busquedaText = new FormControl("");

  protected ordenAscendente: boolean = true;

  protected modelRegistro:any=null;

  protected modelAlerta:any = null;

  protected convertirMinusculayGuiones=convertirMinusculayGuiones;
  
  protected capitalizedFirstWord=capitalizedFirstWord;

  ngOnInit() {
    this.idActoTramiteCaso = this.data.idActoTramiteCaso;
    this.listarReparacionCivil();
    this.busquedaText.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map((texto:any) => texto.trim().toLowerCase())
    )
    .subscribe((texto) => {
      if (texto) {
        this.modelRegistro=null;
        this.modelAlerta=null;
        this.listaFiltrada = this.listaReparacionCivil.filter((reparacion) =>
          reparacion.codigoReparacionCivil.toLowerCase().includes(texto) ||
          reparacion.tipoReparacionCivil.toLowerCase().includes(texto) ||
          reparacion.lista.some((sujeto) => sujeto.nombreSujeto.toLowerCase().includes(texto))
        );
      } else {
        this.listaFiltrada = [...this.listaReparacionCivil];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataReparacionCivilEditado']) {
      if(this.dataReparacionCivilEditado){
        if(this.dataReparacionCivilEditado.pendienteRegistrar){
          //SE ELIMINA EL REGISTRO TEMPORAL
          this.listaDuplicados = [];
        }
        this.resetearSeleccionCard();
        this.listarReparacionCivil();
        this.mostrarMensaje("success","Los datos de la reparación civil <b>"+this.dataReparacionCivilEditado.codReparacionCivil+"</b>, fueron guardados de forma exitosa.")

      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected listarReparacionCivil() {
    this.registrarReparacionCivilService.listaReparacionCivil(this.data.idActoTramiteCaso).subscribe({
      next: (resp) => {
        this.listaReparacionCivil = [
          ...resp,
          ...this.listaDuplicados
        ];
        this.listaReparacionCivil.sort((a: any, b: any) => a.secuencia - b.secuencia);
        this.listaFiltrada = [...this.listaReparacionCivil];
      },
      error: () => {
        console.error("Error al intentar listar las reparaciones civiles");
      },
    });
  }

  protected filtrarPorTipoParticipante(lista:ListaReparacionCivilSujetos[],tipo: string): ListaReparacionCivilSujetos[] {
    return lista
      .filter(sujeto => sujeto.tipoParticipante === tipo);
  }

  protected modalAgregar() {
    const ref = this.dialogService.open(AgregarReparacionCivilComponent, {
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: { ...this.data, salidaAlterna: this.salidaAlterna,tipoSentencia:this.tipoSentencia,tipoAcuerdoActa:this.tipoAcuerdoActa,delitosTramiteSujeto:this.delitosTramiteSujeto }
    });
    ref.onClose.subscribe((dataReparacion) => { // SI DEVUELVE DATA SIGNIFICA QUE GUARDO CORRECTAMENTE
      if(dataReparacion){
        this.resetearSeleccionCard();
        this.modelRegistro=dataReparacion;
        this.mostrarMensaje("success","Los datos de la reparación civil <b>"+this.modelRegistro.codReparacionCivil+"</b>, fueron guardados de forma exitosa.")
        this.listarReparacionCivil();
      }
    });
  }

  get duplicado(): string {
    return 'assets/icons/duplicar.svg';
  }

  get ordenar(): string {
    return 'assets/icons/ordenar.svg';
  }

  protected seleccionarReparacion(datos:ListaReparacionCivil | null) {
    this.modelRegistro=null;
    this.modelAlerta=null;
    let infoEnviar: DatosEditarReparacionCivil | null = null;
    if (datos !== null) {
      this.idReparacionCivilSeleccion=datos.idReparacionCivil;
      this.secuenciaSeleccion=datos.secuencia;
      infoEnviar = {
        codReparacionCivil: datos.codigoReparacionCivil,
        idAcuerdosActa: datos.idAcuerdosActa,
        idReparacionCivil: datos.idReparacionCivil,
        pendienteRegistrar:datos.pendienteRegistrar
      };
    }
    this.enviarDatosEditarReparacionCivil.emit(infoEnviar);
  }

  protected eliminarReparacionCivil(reparacion:ListaReparacionCivil){
    if(reparacion.pendienteRegistrar){
      this.listaDuplicados = this.listaDuplicados.filter(item =>
        !(item.idReparacionCivil === reparacion.idReparacionCivil &&
          item.secuencia === reparacion.secuencia &&
          item.pendienteRegistrar === true)
      );
      if(this.secuenciaSeleccion === reparacion.secuencia){
        this.resetearSeleccionCard();
      }
      this.listarReparacionCivil();
    }
    else{
    const dialog = this.modalDialogService.question(
      'Eliminar Reparación Civil',
      '¿Realmente quiere eliminar la reparación civil '+reparacion.codigoReparacionCivil+'?',
      'Eliminar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.subscriptions.push(
            this.registrarReparacionCivilService.eliminarReparacionCivil(reparacion.idReparacionCivil).subscribe({
              next: resp => {
                if (resp?.code === 200) {
                  this.modalDialogService.info("Éxito", 'Reparacion civil eliminada correctamente', 'Aceptar');
                  this.resetearSeleccionCard();
                  this.listarReparacionCivil();
                }
              },
              error: () => {
                this.modalDialogService.error("ERROR", "Error al intentar eliminar la reparación civil", 'Aceptar');
              }
            })
          );
        }
      }
    });
    }
  }
  protected ordenarLista() {
    this.ordenAscendente = !this.ordenAscendente;
    this.listaFiltrada.sort((a, b) => {
      if (this.ordenAscendente) {
        return a.secuencia - b.secuencia; // Orden ascendente
      } else {
        return b.secuencia - a.secuencia; // Orden descendente
      }
    });
  }
  protected scrollListaCard(position: 'top' | 'bottom'): void {
    const container = this.scrollContainer.nativeElement;

    if (position === 'top') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (position === 'bottom') {
      const maxScroll = container.scrollHeight - container.clientHeight; // Altura total menos la visible
      container.scrollTo({ top: maxScroll, behavior: 'smooth' });
    }
  }

  protected mostrarMensaje(tipo:string,mensaje:string){
    this.modelAlerta={
      tipo:tipo,
      mensaje:mensaje
    }
  }

  protected mostrarSalidaAlternaLista(lista:ListaReparacionCivilSujetos[]):string | null {
    const valores = [...new Set(lista.map(item => item.salidaAlterna).filter(v => v !== null))];
    return valores.length === 1 ? valores[0] : null;
  }

  protected resetearSeleccionCard(){
    this.idReparacionCivilSeleccion="";
    this.secuenciaSeleccion=0;
    this.seleccionarReparacion(null);
    this.modelAlerta=null;
  }
  protected modificarCodigoReparacionDuplicado(numero: number, inputString: string): string {
    return inputString.replace(/C[^-]+/, `C${numero}`);
  }

  protected duplicarReparacion(reparacion:ListaReparacionCivil){
    if(this.listaDuplicados.length == 0){
      this.subscriptions.push(
        this.registrarReparacionCivilService.obtenerUltimaSecuencia(this.idActoTramiteCaso).subscribe({
          next: resp => {
            const secuencia:number=resp;
            if(secuencia>1){
              const duplicado:ListaReparacionCivil={
                ... reparacion,
                pendienteRegistrar:true,
                secuencia:secuencia,
                codigoReparacionCivil:this.modificarCodigoReparacionDuplicado(secuencia,reparacion.codigoReparacionCivil)
              }
              this.listaDuplicados.push(duplicado);
              this.listarReparacionCivil();
              this.resetearSeleccionCard();
            }
          },
          error: () => {
            this.modalDialogService.error("ERROR", "Error al intentar eliminar la reparación civil", 'Aceptar');
          }
        })
      );
    }
    else{
      this.mostrarMensaje("error","Se cuenta con una reparación civil duplicada sin guardar. Por lo cual, no puede duplicar nuevos registros.")

    }
  }
}
