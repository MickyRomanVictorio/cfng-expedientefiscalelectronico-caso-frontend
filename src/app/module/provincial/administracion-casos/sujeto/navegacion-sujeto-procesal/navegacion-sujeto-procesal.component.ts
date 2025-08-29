import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TIPO_ORIGEN } from '@core/types/tipo-origen.type';
import { AbogadoComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/sujetos-procesales/abogado/abogado.component';
import { FormacionProfesionalSujetoProcesalComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/sujetos-procesales/formacion-profesional/formacion-profesional-sujeto-procesal.component';
import { MenuItem, MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { StepsModule } from 'primeng/steps';
import { GestionarInformacionDetalladaSujetoProcesalComponent } from '../gestionar-informacion-detallada-sujeto-procesal/gestionar-informacion-detallada-sujeto-procesal.component';
import { GestionarInformacionGeneralSujetoProcesalComponent } from '../gestionar-informacion-general-sujeto-procesal/gestionar-informacion-general-sujeto-procesal.component';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { Expediente } from '@core/utils/expediente';
import { urlConsultaCasoFiscal } from '@core/utils/utils';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    StepsModule,
    DividerModule,
    CmpLibModule,
    GestionarInformacionDetalladaSujetoProcesalComponent,
    GestionarInformacionGeneralSujetoProcesalComponent,
    AbogadoComponent,
    FormacionProfesionalSujetoProcesalComponent
  ],
  providers: [MessageService, DialogService],
  selector: 'app-navegacion-sujeto-procesal',
  templateUrl: './navegacion-sujeto-procesal.component.html',
  styleUrls: ['./navegacion-sujeto-procesal.component.scss'],
})
export class NavegacionSujetoProcesalComponent implements OnInit {
  items: MenuItem[];
  activeIndex: number = 0;
  caso!: Expediente;

  idSujetoCaso!: string;
  numeroCaso!: string;
  nuevoRegistro: boolean = false;
  isActivoLeer: boolean = false;

  sujeto2: any = '0';
  tipoOrigen = TIPO_ORIGEN;

  constructor(private activatedRoute: ActivatedRoute,
    protected iconUtil: IconUtil, 
    private router: Router,
    private gestionCasoService: GestionCasoService,
  
  ) {
    this.items = [
      {
        label: 'Información general',
      },
      {
        label: 'Datos Adicionales',
      },
      {
        label: 'Formación profesional',
      },
      {
        label: 'Abogados',
      },
    ];
  }
  regresarListaSujeto(){
    const ruta = urlConsultaCasoFiscal({
      idEtapa: this.caso.idEtapa!,
      idCaso:this.caso.idCaso!,
      flgConcluido:this.caso.flgConcluido?.toString()
    });
    this.router.navigate([`${ruta}/sujeto`]);
  }

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
    const id = this.activatedRoute.snapshot.params['idSujeto'];
    if (id === undefined || id === null || id === '' || id === 'nuevo') {
      this.idSujetoCaso = '';
      this.nuevoRegistro = true;
      this.isActivoLeer = true;
    } else {
      this.idSujetoCaso = id;
    }
    console.log(this.idSujetoCaso);
  }

  onChangeStep(event: any) {
    this.activeIndex = event;
  }

  onChangeIdSujetoCaso(event: any) {
    this.idSujetoCaso = event;
  }

  activeIndexChange(event: any) {
    this.activeIndex = event;
  }

  recibirDatos(dato: any) {
    this.idSujetoCaso = dato.idSujetoCaso;
  }

}
