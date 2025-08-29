import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { SujetoGeneralService } from '@services/generales/sujeto/sujeto-general.service';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { DniSujetoComponent } from '../dni-sujeto/dni-sujeto.component';
import { RucSujetoComponent } from '../ruc-sujeto/ruc-sujeto.component';
@Component({
    standalone: true,
    selector: 'app-edicion-sujeto',
    templateUrl: './edicion-sujeto.component.html',
    styleUrls: ['./edicion-sujeto.component.scss'],
    imports: [
        ButtonModule,
        DropdownModule,
        RadioButtonModule,
        InputTextModule,
        CommonModule,
        FormsModule,
        CheckboxModule,
        CalendarModule,
        InputNumberModule,
        TableModule,
        CardModule,
        DniSujetoComponent,
        RucSujetoComponent,
        ReactiveFormsModule,
    ],
    providers: [MessageService, DialogService, DatePipe],
})

export class EdicionSujetoComponent implements OnInit {
    @Output() onChangeStep: EventEmitter<number> = new EventEmitter<number>();
    @Output() idSujetoCaso!: string;
    @Output() onEnviarDatos: EventEmitter<any> = new EventEmitter<any>();

    date!: Date;
    tipo_sujetos: SelectItem[] = [];
    tipo_persona: SelectItem[] = [];
    pais: SelectItem[] = [];
    tipo_documento_peruano = [];
    tipo_documento_extranjero = [];
    documentoOpciones: SelectItem[] = this.tipo_documento_peruano;
    documentoBoolean: boolean = true;
    idSujeto: any;

    form: FormGroup;

    habilitado: boolean = false;
    max_value: number = 8;
    suscripcionGeneralService: Subscription;
    documento!: string;
    infosujeto: any;
    coCaso!: string;

    constructor(
        private Casos: Casos,
        private fb: FormBuilder,
        private router: Router,
        private sujetoGeneralService: SujetoGeneralService
    ) {

        this.form = this.fb.group({
            idNacionalidad: [null],
            idTipoDocumento: [null],
            idSujetoProcesal: [''],
            idTipoParteSujeto: [null],
            flgExtranjero: ["0"],
            // PersonaSeleccionado: [null],
            nuDocumento: [null]
        });

        this.suscripcionGeneralService = this.sujetoGeneralService.stepp$.subscribe((idSujetoCaso: any) => {
            this.actualizarStep(idSujetoCaso)

        });

        this.Casos.getPaises().subscribe((data: any) => {
            this.pais = data.data.map((item: any) => ({ value: item.id, label: item.nombre }));
            this.form.patchValue({
                idNacionalidad: 102
            })
        });

        this.Casos.getTipoSujetoProcesal().subscribe((data: any) => {
            this.tipo_sujetos = data.data.map((item: any) => ({ value: item.id, label: item.nombre }))
        })
        this.Casos.getPersona().subscribe((data: any) => {
            this.tipo_persona = data.data.map((item: any) => ({ value: item.id, label: item.nombre }))
        })
        this.Casos.getTipoDni().subscribe((data: any) => {
            this.tipo_documento_peruano = data.data.map((item: any) => ({ value: item.id, label: item.nombre }))
            this.documentoOpciones = this.tipo_documento_peruano
        })
        this.Casos.getTipoDni().subscribe((data: any) => {
            this.tipo_documento_extranjero = data.data.map((item: any) => ({ value: item.id, label: item.nombre }))
        }
        )
    }



    ngOnDestroy() {
        this.suscripcionGeneralService.unsubscribe();
    }

    public actualizarStep(idSujeto: string) {
        this.idSujetoCaso = idSujeto;
        this.onChangeStep.emit(1);
        this.onEnviarDatos.emit({ idSujetoCaso: this.idSujetoCaso });
    }



    actualizarOpcionesDocumento() {
        if (this.form.value.flgExtranjero === "0") {
            this.documentoOpciones = this.tipo_documento_peruano;
        } else {
            this.documentoOpciones = this.tipo_documento_extranjero;
        }
    }



    ngOnInit() {
        this.actualizarOpcionesDocumento();
        const temp_ruta = this.router.url.split('/');
        this.idSujeto = temp_ruta[temp_ruta.length - 1]
        this.coCaso = temp_ruta[6]

        if (this.idSujeto === "sujetoprocesal") { }
        else {
            this.Casos.getCaso(this.idSujeto).subscribe((data: any) => {
                this.infosujeto = data.data;

                Object.keys(this.form.controls).forEach(key => {
                    if (this.infosujeto.hasOwnProperty(key)) {
                        // Verificar si la clave existe en infosujeto y aplicar patchValue
                        this.form.patchValue({
                            [key]: this.infosujeto[key]
                        });
                    }
                });

            })
        }

    }
    actualizarEstadoBoton() {
        if (this.form.value.idTipoDocumento == 3) {
            this.habilitado = true
        } else {
            this.habilitado = false
        }
        if (this.form.value.idTipoDocumento == 1) {
            this.documentoBoolean = true
            this.max_value = 8
        } else if (this.form.value.idTipoDocumento == 2) {
            this.documentoBoolean = false
            this.max_value = 11
        } else {
            this.max_value = 15
        }
    }


    buscarDni() {
        this.documento = this.form.value.nuDocumento
    }


}
