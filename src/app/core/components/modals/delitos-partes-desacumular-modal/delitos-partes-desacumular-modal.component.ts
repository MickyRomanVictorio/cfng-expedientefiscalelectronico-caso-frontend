import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { obtenerCasoHtml } from '@utils/utils';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { DesacumularConfirmModalComponent } from '../desacumular-confirm-modal/desacumular-confirm-modal.component';

interface Delito {
  nombre?: string;
  id?: number;
}

interface CasoParte {
  nroCaso?: string;
  tipoDoc?: string | string[];
  numDoc?: string | string[];
  nombres?: string | string[];
  id?: number;
  tipoSujeto?: string;
  delitos?: Delito[];
}
@Component({
  selector: 'app-delitos-partes-desacumular-modal',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './delitos-partes-desacumular-modal.component.html',
  providers: [DialogService],
})
export class DelitosPartesDesacumularModalComponent implements OnInit {
  info: CasoParte[] = [];
  partes: CasoParte[] = [];
  partesSeleccionadas: number[] = [];
  delitos: Delito[] = [];
  delitosSeleccionados: number[] = [];
  groups: CasoParte[] = [];

  subs: any = [];

  public refModal!: DynamicDialogRef;

  constructor(
    private casos: Casos,
    private dialogService: DialogService,
    private sanitizer: DomSanitizer,
    private dialogRef: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.casos.delitosyPartesInfo().subscribe({
        next: (data: any) => {
          this.info = data;
          this.partes = [...data];

          const delitosArray = data
            .map((item: any) => {
              return item.delitos;
            })
            .flat();

          this.delitos = Object.values(
            delitosArray.reduce((acc: any, obj: any) => {
              acc[obj.id] = obj;
              return acc;
            }, {})
          );
        },
      })
    );
  }

  displayDelitos(parte: any) {
    if (parte instanceof Set) {
      return Array.from(parte).join(', ');
    }

    return parte
      .map((item: any) => {
        return item.nombre;
      })
      .join(', ');
  }

  parteProcesalChange($e: any) {
    this.partesSeleccionadas.forEach((e) => {
      this.delitos = this.getDelitosParte($e.value) as Delito[];
    });
  }

  getDelitosParte(parteId: number[]) {
    if (!parteId || parteId.length === 0) {
      this.delitos = [];
      return [];
    }

    const delitosArr = this.info
      .filter((i: any) => {
        return parteId.includes(i.id);
      })
      .map((ii) => {
        return ii.delitos;
      })
      .flat();

    return Object.values(
      delitosArr.reduce((acc: any, obj: any) => {
        acc[obj.id] = obj;
        return acc;
      }, {})
    );
  }

  onGenerate() {
    const infoPartesWithCasoNumber = this.info
      .map((i: any) => {
        const delitos = i.delitos.filter(
          (d: any) => !this.delitosSeleccionados.includes(d.id)
        );
        if (this.partesSeleccionadas.includes(i.id)) {
          return {
            ...i,
            delitos,
          };
        }
        return i;
      })
      .filter((j) => {
        return j.delitos.length > 0;
      });

    const toCreateGroup = this.info
      .map((i: any) => {
        const delitos = i.delitos.filter((d: any) =>
          this.delitosSeleccionados.includes(d.id)
        );
        if (this.partesSeleccionadas.includes(i.id)) {
          return {
            ...i,
            delitos,
          };
        }
        return i;
      })
      .filter((j) => {
        return this.partesSeleccionadas.includes(j.id);
      })
      .filter((j) => {
        return j.delitos.length > 0;
      });

    const groupedData = infoPartesWithCasoNumber.reduce((acc, item) => {
      if (!acc[item.nroCaso]) {
        acc[item.nroCaso] = [];
      }
      acc[item.nroCaso].push(item);
      return acc;
    }, {} as { number: CasoParte[] });

    const convertedData = this.performGroup(groupedData);

    const resultArray = Object.values(convertedData);

    this.groups = Array.from(resultArray).concat(
      Object.values(this.performGroup(toCreateGroup))
    ) as CasoParte[];

    console.log(toCreateGroup);
  }

  performGroup(group: CasoParte[] | { number: CasoParte[] }) {
    let data = [];
    if (Array.isArray(group)) {
      data = [
        group.map((i) => {
          i.nroCaso = '--';
          return i;
        }),
      ];
    } else {
      data = Object.values(group);
    }

    return data.flat<CasoParte[][]>().reduce((acc: any, item: any) => {
      const key = item.nroCaso;
      if (!acc[key]) {
        acc[key] = {
          nroCaso: key,
          tipoDoc: [],
          numDoc: [],
          nombres: [],
          id: [],
          tipoSujeto: [],
          delitos: new Set<Delito>(),
        };
      }

      const data = acc[key];
      data.tipoDoc.push(item.tipoDoc);
      data.numDoc.push(item.numDoc);
      data.nombres.push(item.nombres);
      data.id.push(item?.id);
      data.tipoSujeto.push(item.tipoSujeto);
      item.delitos
        .map((d: any) => d.nombre)
        .forEach((item: any) => data.delitos.add(item));

      return acc;
    }, {} as CasoParte);
  }

  displayPartes(partes: any, numDoc: number[]) {
    const result = [];
    for (let i = 0; i < numDoc.length; i++) {
      result.push(`${partes[i]} - ${numDoc[i]}`);
    }

    return result;
  }

  openConfirmDialog() {
    this.refModal = this.dialogService.open(DesacumularConfirmModalComponent, {
      showHeader: false,
      styleClass: 'desacumular_confirm_modal',

      contentStyle: { 'max-width': '800px' },
      data: {
        caso: this.groups,
      },
    });
  }

  close() {
    this.dialogRef.close();
  }

  colorizeCode(code: string) {
    code = code.concat('-0');
    const parts = code.split('-');
    if (parts.length > 3) {
      return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(code));
    }

    return code;
  }
}
