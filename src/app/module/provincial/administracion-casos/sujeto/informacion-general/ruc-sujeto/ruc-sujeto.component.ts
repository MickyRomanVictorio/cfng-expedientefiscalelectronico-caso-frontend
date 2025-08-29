import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    standalone: true,
    selector: 'app-ruc-sujeto',
    templateUrl: './ruc-sujeto.component.html',
    styleUrls: ['./ruc-sujeto.component.scss'],
    imports: [
        InputTextModule,
        ReactiveFormsModule,
        ButtonModule
    ]
})
export class RucSujetoComponent {
    @Input() ruc!: string;
    form: FormGroup;
    constructor(
        private Casos: Casos,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            razonSocial: [null]
        });
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes['ruc']?.currentValue) {
            this.Casos.getRuc(changes['ruc'].currentValue).subscribe((data: any) => {
                this.form.patchValue({
                    razonSocial: data.razonSocial
                })
            })
        }
    }
}
