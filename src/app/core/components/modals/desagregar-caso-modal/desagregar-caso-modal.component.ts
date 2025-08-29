import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertaDesagregarCasoModalComponent } from '@components/modals/alerta-desagregar-caso-modal/alerta-desagregar-caso-modal.component';
import { EncabezadoModalComponent } from '@components/modals/encabezado-modal/encabezado-modal.component';
import { GrupoPartesDelitos } from '@core/interfaces/provincial/administracion-casos/desagregar/GrupoPartesDelitosDesagregados';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import {
  Delitos,
  DelitosPartes,
} from '@interfaces/provincial/administracion-casos/desagregar/DelitosPartes';
import {
  DelitosDesagregados,
  GruposDesagregados,
  PartesDesagregados,
} from '@interfaces/provincial/administracion-casos/desagregar/GruposDesagregados';
import { GruposDesagregadosRequest } from '@interfaces/provincial/administracion-casos/desagregar/GruposDesagregadosRequest';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { DesagregarCasoService } from '@services/provincial/desagregar/desagregar-caso.service';
import { obtenerIcono } from '@utils/icon';
import { StringUtil } from 'dist/ngx-cfng-core-lib';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    EncabezadoModalComponent,
    TableModule,
    CapitalizePipe,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    CmpLibModule,
  ],
  providers: [NgxCfngCoreModalDialogService],
  selector: 'app-desagregar-caso-modal',
  templateUrl: './desagregar-caso-modal.component.html',
  styleUrls: ['./desagregar-caso-modal.component.scss'],
})
export class DesagregarCasoModalComponent implements OnInit, OnDestroy {
  public numeroCaso: string;
  public idCaso: string;
  public idActoTramiteCaso: string;
  public flag: boolean = true;

  public delitosyPartes: DelitosPartes[] = [];
  public delitosyPartesCopy: DelitosPartes[] = [];
  public delitosyPartesCopia: DelitosPartes[] = [];
  public partesSeleccionados: DelitosPartes[] = [];

  public delitosFiltrados: Delitos[] = [];
  public delitosSeleccionados: Delitos[] = [];

  public casoDesagregado: GrupoPartesDelitos[] = [];

  public delitosYaAgregados: Set<string> = new Set();

  public gruposDesagregados: GruposDesagregados[] = [];
  public cargandoTabla: boolean = false;
  public formularioDesagregarCaso!: FormGroup;
  private indiceGrupo = 1;
  public sinSeleccionPartes: boolean = false;
  public sinSeleccionDelitos: boolean = false;
  public editandoGrupo: boolean = false;
  public indiceGrupoEditando: number | null = null;
  protected mensajeListaVacia: string = 'No se encontraron resultados';
  private readonly subscriptions: Subscription[] = [];

  private encontroDatos: boolean = false;

  // private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);

  constructor(
    public referenciaModal: DynamicDialogRef,
    private readonly configuracion: DynamicDialogConfig,
    private readonly dialogService: DialogService,
    private readonly formulario: FormBuilder,
    private readonly desagregarCasoService: DesagregarCasoService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    protected stringUtil: StringUtil,
    protected tramiteService: TramiteService,
  ) {
    this.numeroCaso = this.configuracion.data?.numeroCaso;
    this.idCaso = this.configuracion.data?.idCaso;
    this.idActoTramiteCaso = this.configuracion.data?.idActoTramiteCaso;
  }

  ngOnInit(): void {
    this.obtenerDelitosYPartes();
    this.obtenerGruposDesagregados();
    this.formBuild();
  }

  private formBuild(): void {
    this.formularioDesagregarCaso = this.formulario.group({
      partesFormControl: new FormControl(null),
      delitosFormControl: new FormControl(null),
    });
    if (this.deshabilitarOpciones) {
      this.formularioDesagregarCaso.get('partesFormControl')?.disable();
      this.formularioDesagregarCaso.get('delitosFormControl')?.disable();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private obtenerDelitosYPartes(): void {
    this.delitosyPartes = [];
    this.delitosyPartesCopia = [];
    this.delitosyPartesCopy = [];
    this.cargandoTabla = true;
    this.subscriptions.push(
      this.desagregarCasoService.obtenerDelitosYPartes(this.idCaso).subscribe({
        next: (resp) => {
          this.cargandoTabla = false;
          this.delitosyPartes = this.agruparDelitosYPartes(resp);
          this.delitosyPartesCopy = this.delitosyPartes.slice();
          this.delitosyPartesCopia = this.delitosyPartes.slice();
          console.log('delitosyPartesCopia = ', this.delitosyPartesCopia);
        },
        error: (error) => {
          console.log(error);
          this.cargandoTabla = false;
        },
      })
    );
  }

  private obtenerGruposDesagregados(): void {
    const idCaso = this.idCaso;
    this.desagregarCasoService.obtenerGruposDesagregados(idCaso).subscribe({
      next: (resp) => {
        this.gruposDesagregados = resp;

        if (this.gruposDesagregados.length > 0) {
          this.gruposDesagregados = this.agruparPartesyDelitos(resp);

          // 🔁 Recorremos y registramos todos los delitos ya usados
          this.delitosYaAgregados = new Set(); // limpiamos por si acaso

          this.gruposDesagregados.forEach(grupo => {
            grupo.delitos.forEach(delito => {
              const delitoId = `${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}-${delito.idDelitoEspecifico}`;
              this.delitosYaAgregados.add(delitoId); // ✅ lo marcamos como ya agregado
            });
          });

          console.log('gruposDesagregados = ', this.gruposDesagregados);
          console.log('delitosYaAgregados = ', this.delitosYaAgregados);

          this.indiceGrupo = this.gruposDesagregados.length + 1;
          this.encontroDatos = true;
        } else {
          this.indiceGrupo = 1;
        }
      },
      error: (err) => {
        console.error('Error al obtener casos desagregados:', err);
      }
    });
  }

  public agruparPartesyDelitos(data: any[]): GruposDesagregados[] {
    const map: { [grupo: string]: GruposDesagregados } = {};
    let orden = 1;

    data.forEach((item) => {
      const key = item.grupo;

      if (!map[key]) {
        map[key] = {
          orden: orden++,
          nombreGrupo: item.grupo,
          idCaso: item.idCaso ?? null,
          numeroCaso: item.coCaso,
          sujetos: [],
          delitos: []
        };
      }

      const grupo = map[key];

      // Agregar sujeto si no está ya
      if (!grupo.sujetos.some(s => s.idSujetoCaso === item.idSujetoCaso)) {
        grupo.sujetos.push({
          idSujetoCaso: item.idSujetoCaso,
          nombres: item.partes,
          numeroDocumento: item.numeroDocumento
        });
      }

      // Crear objeto delito (sin idSujetoCaso)
      const nuevoDelito = {
        idDelitoGenerico: item.idDelito,
        idDelitoSubgenerico: item.idDelitoSubGenerico,
        idDelitoEspecifico: item.idDelitoEspecifico,
        nombreLabel: `${item.delitoGenerico} / ${item.delitoSubGenerico} / ${item.delitoEspecifico}`
      };

      // Verificar si ya está ese delito (sin importar sujeto)
      const yaExisteDelito = grupo.delitos.some(d =>
        d.idDelitoGenerico === nuevoDelito.idDelitoGenerico &&
        d.idDelitoSubgenerico === nuevoDelito.idDelitoSubgenerico &&
        d.idDelitoEspecifico === nuevoDelito.idDelitoEspecifico
      );

      if (!yaExisteDelito) {
        grupo.delitos.push(nuevoDelito);
      }
    });

    return Object.values(map).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  }

  public esTipoPermitido(tipo: number): boolean {
    //public esTipoPermitido(tipo: string): boolean {
    /**const tipoNormalizado = tipo.toLowerCase().trim();
    return tipoNormalizado === 'imputado';**/
    return (tipo === 2 || tipo === 4 || tipo === 13);
  }

  public onChangePartesSeleccionadas(event: any): void {
    this.partesSeleccionados = event.value;
    console.log('Partes seleccionadas: ', this.partesSeleccionados);

    this.sinSeleccionPartes = this.partesSeleccionados.length === 0;

    const delitosUnicos = new Set<string>();
    this.delitosFiltrados = [];
    this.delitosSeleccionados = [];

    // 🔁 1. Recopilar delitos ya agregados en otros grupos (excepto el grupo editado)
    const delitosYaAgregados: Set<string> = new Set();

    this.gruposDesagregados.forEach((grupo, index) => {
      if (this.editandoGrupo && index === this.indiceGrupoEditando) {
        return; // Ignorar el grupo en edición
      }

      grupo.delitos.forEach((delito) => {
        const id = `${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}-${delito.idDelitoEspecifico}`;
        delitosYaAgregados.add(id);
      });
    });

    // 🔁 2. Buscar delitos por cada parte seleccionada
    this.partesSeleccionados.forEach((parte) => {
      const delitos = this.delitosyPartesCopia.find(
        (item) => item.numeroDocumento === parte.numeroDocumento
      )?.delitos;

      if (delitos) {
        delitos.forEach((delito) => {
          const delitoId = `${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}-${delito.idDelitoEspecifico}`;

          const yaAgregado = delitosYaAgregados.has(delitoId);
          const yaIncluido = delitosUnicos.has(delitoId);

          // ✅ Si no está ya agregado en otro grupo o estamos editando ese grupo
          if (!yaAgregado && !yaIncluido) {
            delito.labelDelito = `${delito.noDelitoGenerico} / ${delito.noDelitoSubgenerico} / ${delito.noDelitoEspecifico}`;
            delito.idSujetoCaso = parte.idSujetoCaso;
            this.delitosFiltrados.push(delito);
            delitosUnicos.add(delitoId);
          }
        });
      }
    });

    console.log('Delitos filtrados: ', this.delitosFiltrados);

    // ✅ 3. Resetear selección de delitos
    this.formularioDesagregarCaso.get('delitosFormControl')?.reset();
  }

  public onChangeDelitosSeleccionados(event: any): void {
    this.delitosSeleccionados = event.value;
    console.log('delitosSeleccionados', this.delitosSeleccionados);
    this.sinSeleccionDelitos = this.delitosSeleccionados.length === 0;
  }

  validarPartesDelitos(idSujetoCaso: string, delitos: DelitosDesagregados): boolean {
    return this.gruposDesagregados.some((item: any) =>
      item.sujetos.idSujetoCaso === idSujetoCaso &&
      (item.delitos.idDelitoEspecifico === delitos.idDelitoEspecifico
        && item.delitos.idDelitoGenerico === delitos.idDelitoGenerico
        && item.delitos.idDelitoSubgenerico === delitos.idDelitoSubgenerico)
    );
  }

  public agregarPartesDelitos(): void {
    console.log('entro agregarPartesDelitos');

    const partesSeleccionadas = this.formularioDesagregarCaso.get('partesFormControl')?.value || [];
    const delitosSeleccionados = this.formularioDesagregarCaso.get('delitosFormControl')?.value || [];

    // ✅ Validación: debe seleccionar al menos una parte y un delito
    const sinPartes = partesSeleccionadas.length === 0;
    const sinDelitos = delitosSeleccionados.length === 0;

    if (sinPartes || sinDelitos) {
      this.sinSeleccionPartes = sinPartes;
      this.sinSeleccionDelitos = sinDelitos;

      const mensaje = sinPartes && sinDelitos
        ? 'Debe seleccionar al menos una parte y un delito.'
        : sinPartes
          ? 'Debe seleccionar al menos una parte.'
          : 'Debe seleccionar al menos un delito.';

      this.modalDialogService.warning('Campos obligatorios', mensaje, 'Aceptar');
      return;
    }

    /**if (this.validarPartesDelitos(idReparacion, sujeto)) {
      this.modalDialogService.error(
        'warning',
        'Debe seleccionar un delito',
        'Aceptar'
      );
      return;
    }**/

    const nombreGrupo = 'Grupo ' + this.indiceGrupo;
    const numeroCaso = this.indiceGrupo === 1 ? this.numeroCaso : 'Por asignar';
    const nuevaFila: GruposDesagregados = {
      nombreGrupo: nombreGrupo,
      numeroCaso: numeroCaso,
      //idCaso: partesSeleccionadas.length > 0 ? partesSeleccionadas[0].idCaso : '',
      idCaso: this.indiceGrupo === 1 ? this.idCaso : null,

      sujetos: partesSeleccionadas.map((parte: any) => ({
        nombres: parte.nombres,
        numeroDocumento: parte.numeroDocumento,
        idSujetoCaso: parte.idSujetoCaso,
      })),

      delitos: delitosSeleccionados.map((delito: any) => ({
        idDelitoGenerico: delito.idDelitoGenerico,
        idDelitoSubgenerico: delito.idDelitoSubgenerico,
        idDelitoEspecifico: delito.idDelitoEspecifico,
        nombreLabel: delito.labelDelito,
        idSujetoCaso: delito.idSujetoCaso,
      })),
    };

    console.log('nuevaFila = ', nuevaFila);
    this.gruposDesagregados.push(nuevaFila);
    this.indiceGrupo++;

    // Guardar los delitos agregados para no volver a mostrarlos
    /**delitosSeleccionados.forEach((delito: any) => {
      const key = `${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}-${delito.idDelitoEspecifico}`;
      this.delitosYaAgregados.add(key);
    });**/

    ///////////////////////////
    // 1️⃣ Eliminar delitos seleccionados
    this.delitosFiltrados = this.delitosFiltrados.filter((delito: any) => {
      return !delitosSeleccionados.some((dSel: any) =>
        dSel.idDelitoGenerico === delito.idDelitoGenerico &&
        dSel.idDelitoSubgenerico === delito.idDelitoSubgenerico &&
        dSel.idDelitoEspecifico === delito.idDelitoEspecifico
      );
    });

    //-- 2️⃣ Verificar si las partes aún tienen delitos disponibles
    /**const partesAEliminar: number[] = [];

    for (const parte of partesSeleccionadas) {
      const idParte = parte.idSujetoCaso;

      const delitosRestantesParaParte = this.delitosFiltrados.filter(
        (delito: any) => delito.idSujetoCaso === idParte
      );

      if (delitosRestantesParaParte.length === 0) {
        partesAEliminar.push(idParte);
      }
    }

    console.log('partesAEliminar = ', partesAEliminar);
    console.log('delitosyPartesCopia = ', this.delitosyPartesCopia);

    //-- 3️⃣ Eliminar partes sin delitos restantes
    /**this.delitosyPartesCopia = this.delitosyPartesCopia.filter(
      (parte: any) => !partesAEliminar.includes(parte.idSujetoCaso)
    );**/

    //console.log('delitosyPartesCopia = ', this.delitosyPartesCopia)

    /////////////////////
    //this.formularioDesagregarCaso.get('partesFormControl')?.reset();
    this.formularioDesagregarCaso.get('delitosFormControl')?.reset();

    // Actualizar el estado de selección en los selectores
    this.sinSeleccionPartes = false;
    this.sinSeleccionDelitos = false;
    //this.delitosFiltrados = [];
  }

  public actualizarGrupoPartesyDelitos(): void {
    if (this.editandoGrupo && this.indiceGrupoEditando !== null) {
      const partesSeleccionadas =
        this.formularioDesagregarCaso.get('partesFormControl')?.value || [];
      const delitosSeleccionados =
        this.formularioDesagregarCaso.get('delitosFormControl')?.value || [];

      // ✅ Validación: debe seleccionar al menos una parte y un delito
      const sinPartes = partesSeleccionadas.length === 0;
      const sinDelitos = delitosSeleccionados.length === 0;

      if (sinPartes || sinDelitos) {
        this.sinSeleccionPartes = sinPartes;
        this.sinSeleccionDelitos = sinDelitos;

        const mensaje = sinPartes && sinDelitos
          ? 'Debe seleccionar al menos una parte y un delito.'
          : sinPartes
            ? 'Debe seleccionar al menos una parte.'
            : 'Debe seleccionar al menos un delito.';

        this.modalDialogService.warning('Campos obligatorios', mensaje, 'Aceptar');
        return;
      }

      const grupoAnterior = this.gruposDesagregados[this.indiceGrupoEditando];

      // ✅ 1️⃣ Restaurar delitos del grupo editado SOLO si no están en otros grupos
      grupoAnterior.sujetos.forEach((sujeto: any) => {
        const parteCopia = this.delitosyPartesCopia.find(
          (parte: any) => parte.numeroDocumento === sujeto.numeroDocumento
        );

        if (parteCopia?.delitos) {
          parteCopia.delitos.forEach((delito: any) => {
            const estaEnOtroGrupo = this.gruposDesagregados.some((grupo, idx) => {
              if (idx === this.indiceGrupoEditando) return false; // Ignorar el grupo que se está editando

              return grupo.delitos.some((d: any) =>
                d.idDelitoGenerico === delito.idDelitoGenerico &&
                d.idDelitoSubgenerico === delito.idDelitoSubgenerico &&
                d.idDelitoEspecifico === delito.idDelitoEspecifico
              );
            });

            const yaExiste = this.delitosFiltrados.some((d: any) =>
              d.idDelitoGenerico === delito.idDelitoGenerico &&
              d.idDelitoSubgenerico === delito.idDelitoSubgenerico &&
              d.idDelitoEspecifico === delito.idDelitoEspecifico &&
              d.idSujetoCaso === parteCopia.idSujetoCaso
            );

            if (!estaEnOtroGrupo && !yaExiste) {
              this.delitosFiltrados.push({
                ...delito,
                idSujetoCaso: parteCopia.idSujetoCaso,
                labelDelito: `${delito.noDelitoGenerico} / ${delito.noDelitoSubgenerico} / ${delito.noDelitoEspecifico}`
              });
            }
          });
        }
      });

      // ✅ 2️⃣ Actualizar el grupo editado
      this.gruposDesagregados[this.indiceGrupoEditando] = {
        ...grupoAnterior,
        sujetos: partesSeleccionadas.map((parte: any) => ({
          nombres: parte.nombres,
          numeroDocumento: parte.numeroDocumento,
          idSujetoCaso: parte.idSujetoCaso
        })),
        delitos: delitosSeleccionados.map((delito: any) => ({
          idDelitoGenerico: delito.idDelitoGenerico,
          idDelitoSubgenerico: delito.idDelitoSubgenerico,
          idDelitoEspecifico: delito.idDelitoEspecifico,
          nombreLabel: delito.labelDelito
        }))
      };

      // ✅ 3️⃣ Eliminar los nuevos delitos seleccionados de delitosFiltrados
      this.delitosFiltrados = this.delitosFiltrados.filter((delito: any) =>
        !delitosSeleccionados.some((dSel: any) =>
          dSel.idDelitoGenerico === delito.idDelitoGenerico &&
          dSel.idDelitoSubgenerico === delito.idDelitoSubgenerico &&
          dSel.idDelitoEspecifico === delito.idDelitoEspecifico
        )
      );

      // ✅ 4️⃣ Limpiar partes sin delitos restantes
      const partesAEliminar: number[] = [];
      for (const parte of partesSeleccionadas) {
        const idParte = parte.idSujetoCaso;

        const delitosRestantesParaParte = this.delitosFiltrados.filter(
          (delito: any) => delito.idSujetoCaso === idParte
        );

        if (delitosRestantesParaParte.length === 0) {
          partesAEliminar.push(idParte);
        }
      }

      this.delitosyPartes = this.delitosyPartes.filter(
        (parte: any) => !partesAEliminar.includes(parte.idSujetoCaso)
      );

      // ✅ 5️⃣ Finalizar
      //this.formularioDesagregarCaso.get('partesFormControl')?.reset();
      this.formularioDesagregarCaso.get('delitosFormControl')?.reset();
      this.editandoGrupo = false;
      this.indiceGrupoEditando = null;
      this.sinSeleccionPartes = false;
      this.sinSeleccionDelitos = false;

      this.modalDialogService.info('Grupo actualizado correctamente', '', 'Aceptar');
    }
  }

  public filtrarDelitosyPartesCopia(): void {
    const idsDelitosSeleccionados: string[] = [];

    this.gruposDesagregados.forEach((grupo) => {
      grupo.delitos.forEach((delito) => {
        const delitoId = `${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}-${delito.idDelitoEspecifico}`;
        idsDelitosSeleccionados.push(delitoId);
      });
    });

    this.delitosyPartesCopia.forEach((item) => {
      item.delitos = item.delitos.filter((delito) => {
        const delitoId = `${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}-${delito.idDelitoEspecifico}`;
        return !idsDelitosSeleccionados.includes(delitoId);
      });
    });

    this.delitosyPartesCopia = this.delitosyPartesCopia.filter(
      (item) => item.delitos.length > 0
    );
  }

  public agruparDelitosYPartes(data: any[]): DelitosPartes[] {
    const map: { [key: string]: DelitosPartes } = {};
    let index = 1;

    data.forEach((item) => {
      const { numeroDocumento, ...rest } = item;
      const key = numeroDocumento;

      if (map[key]) {
        //Existe DNI
        map[key].delitos.push({
          idSujetoCaso: item.idSujetoCaso,
          idDelitoSujeto: item.idDelitoSujeto,
          idDelitoGenerico: item.idDelitoGenerico,
          noDelitoGenerico: item.noDelitoGenerico,
          idDelitoSubgenerico: item.idDelitoSubgenerico,
          noDelitoSubgenerico: item.noDelitoSubgenerico,
          idDelitoEspecifico: item.idDelitoEspecifico,
          noDelitoEspecifico: item.noDelitoEspecifico,
          labelDelito:
            item.noDelitoGenerico +
            '/' +
            item.noDelitoSubgenerico +
            '/' +
            item.noDelitoEspecifico,
        });
      } else {
        // NO EXISTE DNI, se crea una nueva entrada
        map[key] = {
          orden: index,
          idCaso: item.idCaso,
          idSujetoCaso: item.idSujetoCaso,
          tipoDocIdentidad: item.tipoDocIdentidad,
          numeroDocumento: item.numeroDocumento,
          nombres: item.nombres,
          idTipoParteSujeto: item.idTipoParteSujeto,
          tipoParteSujeto: item.tipoParteSujeto,
          delitos: [
            {
              idSujetoCaso: item.idSujetoCaso,
              idDelitoSujeto: item.idDelitoSujeto,
              idDelitoGenerico: item.idDelitoGenerico,
              noDelitoGenerico: item.noDelitoGenerico,
              idDelitoSubgenerico: item.idDelitoSubgenerico,
              noDelitoSubgenerico: item.noDelitoSubgenerico,
              idDelitoEspecifico: item.idDelitoEspecifico,
              noDelitoEspecifico: item.noDelitoEspecifico,
              labelDelito:
                item.noDelitoGenerico +
                '/' +
                item.noDelitoSubgenerico +
                '/' +
                item.noDelitoEspecifico,
            },
          ],
        };
        index++;
      }
    });

    const orderedList = Object.values(map).sort((a, b) => a.orden - b.orden);
    return orderedList;
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  public editarGrupo(indice: number): void {
    this.indiceGrupoEditando = indice;
    this.editandoGrupo = true;

    const grupoEditando = this.gruposDesagregados[indice];

    // ✅ Recalcular delitos disponibles excluyendo los usados en otros grupos
    this.recalcularDelitosDisponibles(indice);

    // ✅ Obtener las partes seleccionadas del grupo
    const partesSeleccionadas = grupoEditando.sujetos
      .map((sujeto: any) =>
        this.delitosyPartesCopia.find(
          (parte: any) => parte.numeroDocumento === sujeto.numeroDocumento
        )
      )
      .filter((parte): parte is any => !!parte); // Elimina undefined, asegura tipo

    // ✅ Obtener los delitos seleccionados del grupo
    const delitosSeleccionados = grupoEditando.delitos
      .map((delito: any) =>
        this.delitosFiltrados.find(
          (filtro: any) =>
            filtro.idDelitoGenerico === delito.idDelitoGenerico &&
            filtro.idDelitoSubgenerico === delito.idDelitoSubgenerico &&
            filtro.idDelitoEspecifico === delito.idDelitoEspecifico
        )
      )
      .filter((delito): delito is any => !!delito); // Elimina undefined

    // ✅ Cargar valores en los controles del formulario reactivo
    this.formularioDesagregarCaso.get('partesFormControl')?.setValue(partesSeleccionadas);
    this.formularioDesagregarCaso.get('delitosFormControl')?.setValue(delitosSeleccionados);

    // ✅ Actualizar variables auxiliares si las usas en otros métodos
    this.partesSeleccionados = partesSeleccionadas;
    this.delitosSeleccionados = delitosSeleccionados;
  }

  private recalcularDelitosDisponibles(ignorandoIndice: number): void {
    const usadosPorOtrosGrupos: any[] = [];

    this.gruposDesagregados.forEach((grupo, idx) => {
      if (idx !== ignorandoIndice) {
        grupo.delitos.forEach((delito: any) => {
          usadosPorOtrosGrupos.push({
            idDelitoGenerico: delito.idDelitoGenerico,
            idDelitoSubgenerico: delito.idDelitoSubgenerico,
            idDelitoEspecifico: delito.idDelitoEspecifico
          });
        });
      }
    });

    // Restaurar desde la copia base
    const delitosDisponibles: any[] = [];

    for (const parte of this.delitosyPartesCopia) {
      for (const delito of parte.delitos) {
        const yaUsado = usadosPorOtrosGrupos.some((usado) =>
          usado.idDelitoGenerico === delito.idDelitoGenerico &&
          usado.idDelitoSubgenerico === delito.idDelitoSubgenerico &&
          usado.idDelitoEspecifico === delito.idDelitoEspecifico
        );

        if (!yaUsado) {
          delitosDisponibles.push({
            ...delito,
            idSujetoCaso: parte.idSujetoCaso,
            labelDelito: `${delito.noDelitoGenerico} / ${delito.noDelitoSubgenerico} / ${delito.noDelitoEspecifico}`
          });
        }
      }
    }

    this.delitosFiltrados = delitosDisponibles;
  }

  public eliminarGrupo(indice: number) {
    const dialog = this.modalDialogService.warning(
      'Eliminar grupo',
      `¿Está seguro de eliminar este grupo?`,
      'Eliminar',
      true,
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          const grupoEliminado = this.gruposDesagregados[indice];
          console.log('grupoEliminado = ', grupoEliminado)

          // 1️⃣ Volver a agregar los delitos eliminados al listado filtrado
          grupoEliminado.sujetos.forEach((parte: any) => {
            const parteOrigen = this.delitosyPartesCopia.find(p => p.idSujetoCaso === parte.idSujetoCaso);
            if (parteOrigen && parteOrigen.delitos) {
              grupoEliminado.delitos.forEach((delitoEliminado: any) => {
                const existeEnParte = parteOrigen.delitos.some((d: any) =>
                  d.idDelitoGenerico === delitoEliminado.idDelitoGenerico &&
                  d.idDelitoSubgenerico === delitoEliminado.idDelitoSubgenerico &&
                  d.idDelitoEspecifico === delitoEliminado.idDelitoEspecifico
                );
                if (existeEnParte) {
                  const delitoYaAgregado = this.delitosFiltrados.some((d: any) =>
                    d.idDelitoGenerico === delitoEliminado.idDelitoGenerico &&
                    d.idDelitoSubgenerico === delitoEliminado.idDelitoSubgenerico &&
                    d.idDelitoEspecifico === delitoEliminado.idDelitoEspecifico &&
                    d.idSujetoCaso === parte.idSujetoCaso
                  );
                  if (!delitoYaAgregado) {
                    // reconstruir el label y agregar
                    const delitoOriginal = parteOrigen.delitos.find((d: any) =>
                      d.idDelitoGenerico === delitoEliminado.idDelitoGenerico &&
                      d.idDelitoSubgenerico === delitoEliminado.idDelitoSubgenerico &&
                      d.idDelitoEspecifico === delitoEliminado.idDelitoEspecifico
                    );

                    if (delitoOriginal) {
                      delitoOriginal.labelDelito = `${delitoOriginal.noDelitoGenerico} / ${delitoOriginal.noDelitoSubgenerico} / ${delitoOriginal.noDelitoEspecifico}`;
                      delitoOriginal.idSujetoCaso = parte.idSujetoCaso;
                      this.delitosFiltrados.push(delitoOriginal);
                    }
                  }
                }
              });
            }
          });

          this.gruposDesagregados.splice(indice, 1);
          this.indiceGrupo--;

          // 2️⃣ Reasignar nombres de grupo y número de caso
          this.gruposDesagregados.forEach((grupo, i) => {
            grupo.nombreGrupo = 'Grupo ' + (i + 1);
            grupo.numeroCaso = i === 0 ? this.numeroCaso : 'Por asignar';
            grupo.idCaso = i === 0 ? this.idCaso : null;
          });

          console.log('gruposDesagregados queda = ', this.gruposDesagregados)

          // 3️⃣ Actualizar el índice del grupo para agregar uno nuevo
          this.indiceGrupo = this.gruposDesagregados.length + 1;

          // 3️⃣ Volver a generar delitosFiltrados si hay partes seleccionadas
          //this.onChangePartesSeleccionadas({ value: this.partesSeleccionados });

          this.modalDialogService.info('Grupo eliminado', '', 'Aceptar');
        }
      },
    });
  }

  /**
   * Verifica si se han agregado al menos 2 grupos. Si es así, muestra un
   * diálogo de confirmación y si se confirma, prepara un array de
   * GruposDesagregadosRequest para enviar al servidor y cierra el modal.
   * La confirmación se hace solo para el grupo 2.
   */
  public confirmarDesagregarCaso(): void {
    console.log('entrooo confirmarDesagregarCaso')
    /**if (this.gruposDesagregados.length >= 2) {**/
    this.mostrarDialog('warning', `ADVERTENCIA`, '', 'Aceptar', true, () => {
      const gruposDesagregadosRequest: GruposDesagregadosRequest[] = [];
      console.log('gruposDesagregados = ', this.gruposDesagregados)
      this.gruposDesagregados.forEach((grupo: GruposDesagregados, index) => {
        console.log('index = ', index);
        /**if (index > 0) {**/
        grupo.sujetos.forEach((sujeto: PartesDesagregados) => {
          /**const delitos: Delitos[] = this.encontrarDelitosParaGrupo(
            grupo,
            this.delitosyPartes,
            sujeto
          );**/
          const delitos: Delitos[] = grupo.delitos.map((delito: DelitosDesagregados) => ({
            idDelitoGenerico: delito.idDelitoGenerico,
            idDelitoSubgenerico: delito.idDelitoSubgenerico,
            idDelitoEspecifico: delito.idDelitoEspecifico,
            labelDelito: delito.nombreLabel
          }));

          const request: GruposDesagregadosRequest = {
            numeroGrupo: index + 1,
            nombreGrupo: grupo.nombreGrupo,
            numeroDocumento: sujeto.numeroDocumento,
            numeroCaso: grupo.numeroCaso,
            idCaso: grupo.idCaso,
            idSujetoCaso: sujeto.idSujetoCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            delitos: delitos,
          };
          gruposDesagregadosRequest.push(request);
        });
        /** }**/
      });
      console.log('gruposDesagregadosRequest: ', gruposDesagregadosRequest);
      this.enviarConfirmarDesagregar(gruposDesagregadosRequest);
    });
    /** }**/
  }

  public enviarConfirmarDesagregar(
    gruposDesagregadosRequest: GruposDesagregadosRequest[]
  ): void {
    this.subscriptions.push(
      this.desagregarCasoService
        .confirmarDesagregarCaso(gruposDesagregadosRequest)
        .subscribe({
          next: (resp) => {
            if (resp.code === 200) {
              this.referenciaModal.close(gruposDesagregadosRequest);
            }
            /**this.referenciaModal.close(gruposDesagregadosRequest);**/
          },
          error: (error) => {
            console.error(error);
            this.referenciaModal.close(gruposDesagregadosRequest);
          },
        })
    );
  }

  private mostrarDialog(
    icono: string,
    titulo: string,
    mensaje: string,
    accion: string,
    confirm: boolean,
    logicaNegocio: () => void
  ): void {
    const ref = this.dialogService.open(AlertaDesagregarCasoModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icono,
        title: titulo,
        description: mensaje,
        confirmButtonText: accion,
        confirm: confirm,
        gruposDesagregados: this.gruposDesagregados,
      },
    });
    ref.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          console.log('confirmado!');
          logicaNegocio();
        }
      },
    });
  }

  protected get esGrupoDesagregado(): boolean {
    return this.tramiteService.tramiteEnModoVisor || this.gruposDesagregados.length < 2;
  }

  protected get deshabilitarOpciones(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

}
