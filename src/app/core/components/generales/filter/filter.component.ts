import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
//services
import { MessageService } from 'primeng/api';
//utils
import objectUtil from '@core/utils/object';
//models
import { CommonModule } from '@angular/common';
import {
  ResponseCatalogModel
} from '@core/models/response.model';
import { MaestroService } from '@core/services/shared/maestro.service';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

interface FilterOptionModel {
  name: string;
  isVisible: boolean;
  isVisibleLocal?: boolean;
}
@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [MessageService],
})
export class FilterComponent {
  @Input() options: any;
  @Output() filter = new EventEmitter<object>();
  filterOptionsLocal: FilterOptionModel[] = [];
  myForm: FormGroup;
  isSubFilterShowed: boolean;
  plazos: ResponseCatalogModel;
  origen: ResponseCatalogModel;
  states!: ResponseCatalogModel;
  prosecutors!: ResponseCatalogModel;
  urgencies!: ResponseCatalogModel;
  documents!: ResponseCatalogModel;
  offices!: ResponseCatalogModel;
  drillDownButtonIsVisible: Boolean;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private maestroService: MaestroService
  ) {
    this.myForm = this.fb.group({
      caseCode: [''],
      plazos: [''],
      origen: [''],
      fasignacioni: ['18/08/2023'],
      fasignacionf: [''],
    });
    this.drillDownButtonIsVisible = false;
    this.isSubFilterShowed = false;
    this.plazos = { isLoading: false, data: [] };
    this.origen = { isLoading: false, data: [] };

    this.getTipoPlazo();
    this.getTipoPlazo();
  }

  getOrigenCaso() {
    this.origen.isLoading = true;
    this.maestroService
      .obtenerOrigen()
      .subscribe({
        next: (data) => {
          this.origen.data = data.data;
          console.log('origen: ', data);
        },
        error: (err) =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `${err.error.mensaje}`,
          }),
      })
      .add(() => (this.origen.isLoading = false));
  }
  getTipoPlazo() {
    this.plazos.isLoading = true;
    this.maestroService
      .getTipoPlazo()
      .subscribe({
        next: (data) => {
          this.plazos.data = data;
          console.log('Plazos: ', data);
        },
        error: (err) =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `${err.error.mensaje}`,
          }),
      })
      .add(() => (this.plazos.isLoading = false));
  }

  ngOnInit() {
    this.setFilterOptionsLocal();
    this.submit();
    if (this.options.length > 3) {
      this.drillDownButtonIsVisible = true;
    }
  }

  setFilterOptionsLocal() {
    let options = this.options;
    this.filterOptionsLocal = options.map((option: any) => ({
      ...option,
      isVisibleLocal: option.isVisible,
    }));
  }

  showOption(option: string) {
    const _option = this.filterOptionsLocal.find((el) => el.name === option);
    if (_option) {
      return _option.isVisibleLocal;
    }
    return false;
  }

  getPayload() {
    return {
      buscar_like: this.myForm.value.caseCode,
      idPlazo: this.myForm.value.plazos,
      idOrigen: this.myForm.value.origen,
      fasignacioni: this.myForm.value.fasignacioni,
      fasignacionf: this.myForm.value.fasignacionf,
    };
  }

  submit() {
    const _payload = objectUtil.removeFalsyValues(this.getPayload());
    console.log(_payload);
    this.filter.emit(_payload);
  }

  getIcon() {
    return `pi pi-angle-double-${this.isSubFilterShowed ? 'up' : 'down'}`;
  }

  showSubFilter() {
    this.isSubFilterShowed = !this.isSubFilterShowed;
    this.filterOptionsLocal = this.filterOptionsLocal.map((el) => ({
      ...el,
      isVisibleLocal: this.isSubFilterShowed ? true : el.isVisible,
    }));
  }

  getPlaceholder(items: any) {
    return items.isLoading ? 'Cargando...' : 'Seleccionar';
  }

  getIsDisabled(items: any) {
    return !items.data.length || items.data.isLoading;
  }
}
