import { CommonModule, DatePipe, Location } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertaData } from '@interfaces/comunes/alert';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { direccionService } from '@services/generales/sujeto/direccion.service';
import { SujetoGeneralService } from '@services/generales/sujeto/sujeto-general.service';
import { TokenService } from '@services/shared/token.service';
import { sujeto2DireccionComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/sujetos-procesales/sujeto-direccion/sujeto2-component';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { DireccionModalComponent } from '@components/modals/direccion-modal/direccion-modal.component';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { EdicionSujetoComponent } from '../edicion-sujeto/edicion-sujeto.component';
@Component({
    standalone: true,
    selector: 'app-guardar-sujeto',
    templateUrl: './guardar-sujeto.component.html',
    styleUrls: ['./guardar-sujeto.component.scss'],
    imports: [
        InputTextModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule, CommonModule, sujeto2DireccionComponent
    ],
    providers: [MessageService, DialogService, DatePipe],
})
export class GuardarSujetoComponent {
    @Input() sujeto_inf: any;
    @Input() formDni: any;
    @Input() formEdicion: any;
    @Input() coCaso: any;


    @Input() nuevoRegistro!: boolean;
    @ViewChild(EdicionSujetoComponent) edicionSujeto!: EdicionSujetoComponent;
    @Output() onChangeIdSujetoCaso: EventEmitter<string> = new EventEmitter<string>();

    idSujetoProcesalNew: any;
    sujeto: any;
    // sujeto2: any = "07C386582A2B8285E0650250569D508A";
    sujeto2: any = "0";
    formDnix: any;
    formEdicionx: any;
    cocasosave: any;


    onListaDirecciones(event: any) {

    }


    ngOnChanges(changes: SimpleChanges) {
        if (changes['sujeto_inf']?.currentValue) {
            this.sujeto = changes['sujeto_inf'].currentValue
            this.obtenerDirecciones(null)
        }
        if (changes['formDni']?.currentValue) {
            this.formDnix = changes['formDni'].currentValue
        }
        if (changes['formEdicion']?.currentValue) {
            this.formEdicionx = changes['formEdicion'].currentValue
        }
        if (changes['coCaso']?.currentValue) {
            this.cocasosave = changes['coCaso'].currentValue
        }
    }

    transformListDireccionRequest(listDireccionRequest: any[]): any[] {
        const transformedList = [];

        for (const item of listDireccionRequest) {
            const transformedItem: any = {};

            for (const key in item) {
                const value = item[key];

                if (value instanceof Array) {
                    // Si el valor es una lista, asigna el segundo elemento de la lista o cadena vacía si es nulo
                    transformedItem[key] = value[1] ? value[1] : '';
                } else {
                    // Si no es una lista, simplemente copia el valor
                    transformedItem[key] = value;
                }
            }

            transformedList.push(transformedItem);
        }

        return transformedList;
    }

    validar(objeto: any) {
        //mensajear bien los campos obligatorios

        const keys = Object.keys(objeto);

        /*
        if (this.formEstudioSujetoProcesal.get('tipoInstitucion').value === null)
            return this.messageService.add({
                severity: 'warn',
                detail: 'Debe seleccionar el tipo de institución para agregar estudio'
            })
        */
        /*for (const key of keys) {
            if (['noAliasSujeto', 'listDireccionRequest', 'idCaso', 'idSujetoProcesal', 'noRazonSocial'].includes(key)) {
                // No hagas nada si la clave está permitida
            } else {
                if (objeto[key] == null || objeto[key].length == 0) {
                    return false; // Si la clave no permitida no está vacía, retorna false
                }
            }
        }*/
        return true;
    }

    save() {
        const dataPost = {
            ...this.formDnix,
            ...this.formEdicionx,
            coCaso: this.cocasosave,
            listDireccionRequest: this.transformListDireccionRequest(this.listaSaveDir),
            coUsuario: this.tokenService.getDecoded().usuario.usuario,
            idCaso: "",
            flgVerficiado: "0",
            noRazonSocial: "",
        };

        if (this.validar(dataPost)) {
            // Continuar con el post
            dataPost.idEstadoCivil = 227;
            dataPost.fechaNacimiento = this.formatDateToDDMMYYYY(dataPost.fechaNacimiento);


            if (dataPost.idSujetoProcesal.length > 0) {
                this.Casos.editSujeto(dataPost).subscribe((data) => {

                    if (data.status === 200) {
                        // Mostrar modal de éxito
                        this.mostrarExitoModal('Se editó el Sujeto Procesal correctamente.');
                    } else {
                        // Mostrar modal de error
                        this.mostrarErrorModal('Error al editar el Sujeto Procesal.');
                    }
                });
            } else {
                this.Casos.saveSujeto(dataPost).subscribe((data) => {

                    if (data.code === 200) {
                        this.idSujetoProcesalNew = data.data.idSujetoProcesal;
                        // Mostrar modal de éxito
                        this.mostrarExitoModal('Se registró el Sujeto Procesal correctamente.');
                    } else {
                        // Mostrar modal de error
                        this.mostrarErrorModal('Error al registrar el Sujeto Procesal.');
                    }
                });
            }
        } else {
            // Mostrar modal de error
            this.mostrarErrorModal('Faltan datos.');
        }
    }

    mostrarExitoModal(mensaje: string): void {
        // Lógica para mostrar un modal de éxito
        const ref = this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
                icon: 'success',
                title: 'Éxito',
                description: mensaje,
                confirmButtonText: 'Aceptar',
                confirm: true,
            }
        });

        ref.onClose.subscribe(() => {

            this.sujetoGeneralService.invocarStep(this.idSujetoProcesalNew);
        });
    }

    mostrarErrorModal(mensaje: string): void {
        // Lógica para mostrar un modal de error
        const ref = this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
                icon: 'error',
                title: 'Error',
                description: mensaje,
                confirmButtonText: 'Aceptar',
                confirm: false,
            }
        });
    }


    public acciones = ['pi pi-search', 'pi pi-pencil', 'pi pi-trash'];
    public referenciaModal!: DynamicDialogRef
    listaDirecciones: any = [];
    listaSaveDir: any = []
    public subscriptions: Subscription[] = []
    opcionEligida!: Number;
    ref!: DynamicDialogRef;
    constructor(
        private direService: direccionService,
        private dialogService: DialogService,
        private Casos: Casos,
        private tokenService: TokenService,
        private location: Location,
        private sujetoGeneralService: SujetoGeneralService,


    ) { }
    formatDateToDDMMYYYY(date: Date | string): string {
        if (typeof date === 'string') {
            const partesFecha = date.split('/');
            const dia = parseInt(partesFecha[0], 10);
            const mes = parseInt(partesFecha[1], 10) - 1;
            const año = parseInt(partesFecha[2], 10);
            date = new Date(dia, mes, año);
        }
        if (date instanceof Date && !isNaN(date.getTime())) {
            const day = ("0" + date.getDate()).slice(-2);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        } else {
            return '';
        }
    }
    obtenerDirecciones(nuevaDireccion: any) {
        // Check if nuevaDireccion is provided
        if (nuevaDireccion) {
            nuevaDireccion.idFrontActual = this.listaDirecciones.length + 1; // You can adjust this logic as needed
            this.listaDirecciones.push(nuevaDireccion);
            this.listaSaveDir.push(nuevaDireccion)
        }

        // Check if this.sujeto and this.sujeto.idSujetoProcesal are available
        if (this.sujeto?.idSujetoProcesal) {
            this.subscriptions.push(
                this.Casos.getCaso(this.sujeto.idSujetoProcesal).subscribe({
                    next: (resp: any) => {
                        // Check if resp.data.listDireccion is not null before filtering
                        const nuevosElementos = (resp.data.listDireccion || []).filter(
                            (nuevoElemento: any) => !this.listaDirecciones.some(
                                (elementoExistente: any) => elementoExistente.id === nuevoElemento.id
                            )
                        );

                        // Assign idFrontActual property to each new direction
                        nuevosElementos.forEach((nuevoElemento: any, index: any) => {
                            nuevoElemento.idFrontActual = this.listaDirecciones.length + index + 1; // You can adjust this logic as needed
                        });

                        // Add nuevosElementos to the array
                        this.listaDirecciones.push(...nuevosElementos);
                        this.listaSaveDir.push(...nuevosElementos)
                    }
                })
            );
        }
    }



    eliminarDireccion(datos: any) {
        this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
                icon: 'warning',
                title: `Confirmar eliminar la dirección Nro ${datos.nro}`,
                description: ``,
                confirmButtonText: 'Confirmar',
                confirm: true,
            }
        } as DynamicDialogConfig<AlertaData>)

        const subscription = this.referenciaModal.onClose.subscribe({
            next: resp => {
                if (resp === 'confirm') {
                    this.borrarDireccion(datos);
                    // Additional logic or service calls can be placed here
                }
                // Don't forget to unsubscribe to avoid memory leaks
                subscription.unsubscribe();
            }
        });
    }


    borrarDireccion(direccion: any) {
        const index = this.listaDirecciones.findIndex((element: any) => element.idFrontActual === direccion.idFrontActual);
        if (index !== -1) {
            this.listaDirecciones.splice(index, 1);
        }
    }



    mostrarAccion(i: number, datos: any) {
        if (datos == null) { this.popupDireccion(i, []); return }
        this.subscriptions.push(this.direService.obtenerUnaDireccion(datos.idDireccion).subscribe({
            next: resp => {
                let data = resp.data
                if (i == 0) {
                    this.popupDireccion(i, data)
                } else if (i == 1) {
                    this.popupDireccion(i, data)
                } else if (i == 2) {
                    this.eliminarDireccion(datos)
                }
            }
        }))
    }
    public popupDireccion(opcion: number, data: any): void {
        this.ref = this.referenciaModal = this.dialogService.open(DireccionModalComponent, {
            showHeader: false,
            data: { tipoEjecucion: opcion, data: data, sujeto: this.sujeto }
        });
        this.ref.onClose.subscribe((respuesta) => {
            if (typeof respuesta === "undefined") { return; }
            let rsta = JSON.parse(respuesta);
            if (rsta.opcion == "actualizar_lista") {

                this.obtenerDirecciones(rsta.data.direccion_nueva);
            }
        });
    }
    // En el componente de Angular
    isArray(value: any): value is any[] {
        return value instanceof Array;
    }

    public actualizarStep(idSujeto: string) {
        this.onChangeIdSujetoCaso.emit(idSujeto);
    }
}
