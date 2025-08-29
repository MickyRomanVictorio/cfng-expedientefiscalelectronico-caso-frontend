import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { SelectItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GuardarSujetoComponent } from '../guardar-sujeto/guardar-sujeto.component';
//import { sujetoDireccionComponent } from '@components/tabpanel-sujeto-procesal/sujeto-direccion/sujeto-component';

@Component({
    standalone: true,
    selector: 'app-dni-sujeto',
    templateUrl: './dni-sujeto.component.html',
    styleUrls: ['./dni-sujeto.component.scss'],
    imports: [
        DropdownModule,
        RadioButtonModule,
        CommonModule,
        FormsModule,
        CardModule,
        CalendarModule,
        InputNumberModule,
        InputTextModule,
        ReactiveFormsModule,
        GuardarSujetoComponent//sujetoDireccionComponent
    ]
})
export class DniSujetoComponent {
    @Output() onChangeIdSujetoCaso: EventEmitter<string> = new EventEmitter<string>();

    @Input() dniSujeto: any = null;
    @Input() InfoSujeto: any = null;
    @Input() fatherFilter: any = null;
    @Input() coCaso: any = null;
    estadoCivil: SelectItem[] = [];
    instruccion: SelectItem[] = [];

    datosSujeto: any;
    idSujeto: any;
    formedicion: any;

    form: FormGroup;

    sexos: any[] = [];

    constructor(private Casos: Casos, private fb: FormBuilder) {

        this.form = this.fb.group({
            nombresSujeto: [null],
            paternoSujeto: [null],
            maternoSujeto: [null],
            edadSujeto: [null],
            fechaNacimiento: [null],
            idEstadoCivil: [null],
            gradoInstruccion: [null],
            idSexo: [null],
            noAliasSujeto: ['']
        });

        this.Casos.getInstrucción().subscribe((data: any) => {
            this.instruccion = data.data.map((item: any) => ({ value: item.id, label: item.nombre }))
        })
        this.Casos.getEstadoCivil().subscribe((data: any) => {
            this.estadoCivil = data.data.map((item: any) => ({ value: item.id, label: item.nombre }))
        })
        this.Casos.getSexos().subscribe((data: any) => {
            this.sexos = data.data.map((item: any) => ({ label: item.nombre, value: String(item.id) }))
        })
    }

    coCasoSave!: string;
    public referenciaModal!: DynamicDialogRef;
    ngOnChanges(changes: SimpleChanges) {
        if (changes['dniSujeto']?.currentValue) {
            if (changes['dniSujeto'].currentValue) {
                this.Casos.getDni(changes['dniSujeto'].currentValue).subscribe((data) => {
                    this.datosSujeto = data
                    if (this.datosSujeto) {
                        const partesFecha = this.datosSujeto.fechaNacimiento.split('/');
                        const dia = parseInt(partesFecha[0], 10);
                        const mes = parseInt(partesFecha[1], 10) - 1;
                        const año = parseInt(partesFecha[2], 10);

                        if (this.datosSujeto.codigoGenero == 1) {
                            this.datosSujeto.codigoGenero = "211"
                        } else {
                            this.datosSujeto.codigoGenero = "212"
                        }

                        this.form.patchValue({
                            nombresSujeto: this.datosSujeto.nombres,
                            maternoSujeto: this.datosSujeto.apellidoMaterno,
                            paternoSujeto: this.datosSujeto.apellidoPaterno,
                            edadSujeto: this.datosSujeto.edad,
                            fechaNacimiento: new Date(año, mes, dia),
                            idSexo: this.datosSujeto.codigoGenero,
                            idEstadoCivil: 227//Number(this.datosSujeto.tipoEstadoCivil)
                        })
                        /*
                        if(this.estadoCivil && this.datosSujeto){
                            this.form.patchValue({
                                idEstadoCivil:this.datosSujeto.tipoEstadoCivil
                            })
                        }*/
                    }
                })
            }
        }
        if (changes['fatherFilter']?.currentValue) {
            this.formedicion = changes['fatherFilter'].currentValue;
        }
        if (changes['InfoSujeto']?.currentValue) {
            this.idSujeto = changes['InfoSujeto'].currentValue

            Object.keys(this.form.controls).forEach(key => {
                if (this.idSujeto.hasOwnProperty(key)) {
                    this.form.patchValue({
                        [key]: this.idSujeto[key]
                    });
                    const partesFecha = this.idSujeto.fechaNacimiento.split('/');
                    const dia = parseInt(partesFecha[0], 10);
                    const mes = parseInt(partesFecha[1], 10) - 1;
                    const año = parseInt(partesFecha[2], 10);

                    this.form.patchValue({
                        fechaNacimiento: new Date(año, mes, dia)
                    })
                }
            });
        }
        if (changes['coCaso']?.currentValue) {
            this.coCasoSave = changes['coCaso'].currentValue
        }
    }

    public actualizarStep(idSujeto: string) {
        this.onChangeIdSujetoCaso.emit(idSujeto);
    }
}
