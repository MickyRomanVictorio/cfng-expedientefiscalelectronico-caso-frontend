import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {SujetoGeneralService} from '@services/generales/sujeto/sujeto-general.service';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {ButtonModule} from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import {InputTextModule} from 'primeng/inputtext';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TableModule} from 'primeng/table';
import { valid } from '@core/utils/string';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component';
import { UpperCaseInputModule } from '@core/directives/uppercase-input.module';
import { PaginatorComponent } from "@core/components/generales/paginator/paginator.component";
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

type PersonaJuridica = { numeroRuc: string; razonSocial: string };

@Component({
  selector: 'app-busqueda-ruc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    CmpLibModule,
    MensajeGenericoComponent,
    NgxCfngCoreModalDialogModule,
    UpperCaseInputModule,
    PaginatorComponent
],
  providers: [DialogService],
  templateUrl: './busqueda-ruc.component.html',
  styleUrls: ['./busqueda-ruc.component.scss'],
})
export class BusquedaRucComponent implements OnInit {
  tipoBusqueda = {
    RUC: 'RUC',
    RAZON_SOCIAL: 'RAZON_SOCIAL',
  };
  
  emptyFilterMessage = false;

  personas: PersonaJuridica[] = [];
  personasFiltrados: PersonaJuridica[] = [];

  form: FormGroup;

  protected query: any = { limit: 5, page: 1, where: {} };
  protected resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    public referenciaModal: DynamicDialogRef,
    private readonly dialogConfig: DynamicDialogConfig,
    private readonly fb: NonNullableFormBuilder,
    private readonly sujetoGeneralService: SujetoGeneralService,
    protected iconUtil: IconUtil,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  
  ) {
    this.form = this.fb.group({
      tipoBusqueda: [this.tipoBusqueda.RUC, [Validators.required]],
      termino: ['', [Validators.required, Validators.minLength(11)]],
    });
  }

  ngOnInit(): void {
    const ruc = this.dialogConfig.data.ruc || ''; 

    /**if(this.dialogConfig.data.editar){
      this.form.get('termino')!.disable();
    }**/

    if(valid(ruc)){
      this.form.get('termino')!.setValue(ruc);
      this.buscarPersonaRUC();
    }
    this.form.get('tipoBusqueda')!.valueChanges.subscribe({
      next: (tipoBusqueda) => {
        this.emptyFilterMessage = false;
        this.form.get('termino')!.setValue('');
        this.form.get('termino')!.markAsUntouched();
        this.form.get('termino')!.clearValidators();
        if (tipoBusqueda == this.tipoBusqueda.RUC) {
          this.form
            .get('termino')!
            .addValidators([Validators.required, Validators.minLength(11)]);
        } else {
          this.form
            .get('termino')!
            .addValidators([Validators.required, Validators.minLength(5)]);
        }
        this.form.get('termino')!.updateValueAndValidity();
      },
    });
  }

  public cerrarModal() {
    this.referenciaModal.close();
  }

  agregarPersona(persona: PersonaJuridica) {
    this.referenciaModal.close(persona);
  }

  get tituloInput() {
    return this.esBusquedaPorRuc ? 'Número de RUC' : 'Razón Social';
  }

  get placeHolderInput() {
    return this.esBusquedaPorRuc ? 'Ingrese RUC' : 'Ingrese Razón Social';
  }

  get esBusquedaPorRuc() {
    return this.form.get('tipoBusqueda')!.value === this.tipoBusqueda.RUC;
  }

  get textoValidacion():string{
    return this.esBusquedaPorRuc?'Por favor, ingrese un número de RUC válido':'La razón social no es válida';
  }


  
  buscarPersonaRUC(): void {
    const ruc = this.form.get('termino')?.value;
    this.personas = [];

    if (!ruc) {
      this.emptyFilterMessage = true;
      return;
    }

    this.emptyFilterMessage = false;
    this.sujetoGeneralService.getRuc(ruc).subscribe({
      next: (resp) => {
        this.personas = resp; 

        this.personasFiltrados = this.personas;
        this.itemPaginado.data.data = this.personasFiltrados;
        this.itemPaginado.data.total = this.personasFiltrados.length;
        this.updatePagedItems(this.personasFiltrados, false);

        if (!this.personas.length) {
          this.emptyFilterMessage = true;
        }
      },
      error: (error) => {
        this.emptyFilterMessage = true;
        this.obtenerMensajeErrorBusqueda(error);
      },
    });
  }


  buscarPersonaRazonSocial() {
    this.emptyFilterMessage = false;
    const razonSocial = this.form.get('termino')!.value;
    this.sujetoGeneralService
      .buscarJuridicaPorRazonSocial(razonSocial)
      .subscribe({
        next: (resp) => {
          this.personas = resp;

          this.personasFiltrados = this.personas;
          this.itemPaginado.data.data = this.personasFiltrados;
          this.itemPaginado.data.total = this.personasFiltrados.length;
          this.updatePagedItems(this.personasFiltrados, false);
        },
        error: (error) => {
          this.emptyFilterMessage = true;
          this.obtenerMensajeErrorBusqueda(error);
        },
      });
  }

  obtenerMensajeErrorBusqueda(error:any){
    if (error.error?.code && error.error.code === '42202009' || error.error?.code && error.error.code === '42202013') {
      this.modalDialogService.warning("Advertencia",error.error?.message,'Aceptar');
    } else {
      this.modalDialogService.error("Error",'Se ha producido un error inesperado al intentar buscar al sujeto por SUNAT','Aceptar');
    }
  }

  validaNumerosPorRUC(event: Event): void {
    this.emptyFilterMessage = false;
      const elemt = event.target as HTMLInputElement;
      const input = elemt?.value;
      const numericInput = input.replace(/[^0-9]/g, '');
      elemt.value = numericInput;
  }

  resetForm() {
    this.form.reset();
    this.personas = [];
  }

  get habilitarBotonBuscar() {
    return this.form.valid;
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.updatePagedItems(paginacion.data, paginacion.resetPage);
  }

  updatePagedItems(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.personasFiltrados = data.slice(start, end);
  }


}
