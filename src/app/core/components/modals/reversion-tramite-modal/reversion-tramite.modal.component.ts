import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { IconAsset, IconUtil, StringUtil } from 'ngx-cfng-core-lib'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { DialogService, DynamicDialogConfig, DynamicDialogRef, } from 'primeng/dynamicdialog'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { EncabezadoModalComponent } from "../encabezado-modal/encabezado-modal.component";

@Component({
  standalone: true,
  imports: [
    InputTextareaModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    EncabezadoModalComponent
],
  selector: 'app-reversion-tramite-modal',
  templateUrl: './reversion-tramite.modal.component.html',
  providers: [DialogService],
})
export class ReversionTramiteModalComponent implements OnInit {

  public formulario!: FormGroup;
  caracteresRestantes: number = 300;
  protected titulo: string = ''
  protected numeroCaso: string = ''
  protected etiquetaNota: string = ''
  protected nota: string = ''

  private configuracion = inject(DynamicDialogConfig);

  constructor(
    public ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    protected iconAsset:IconAsset,
  ) {
    this.titulo = this.configuracion.data.titulo
    this.numeroCaso = this.configuracion.data.numeroCaso
    this.etiquetaNota = this.configuracion.data.etiquetaNota
    this.nota = this.configuracion.data.nota
  }

  ngOnInit(): void {
    this.formBuild()
  }

  private formBuild(): void {
    this.formulario = this.formBuilder.group({
      motivo: ['', Validators.maxLength(300)],
    })
  }

  get obtenerContador(): number {
    return this.formulario.get('motivo')?.value.length
  }

  public revertir(): void {
    this.ref.close({ accion: 'confirmar', motivo: this.formulario.get('motivo')?.value })
  }

  public cancelar(): void {
    this.ref.close({ accion: 'cancelar' })
  }

  public cerrar(): void {
    this.ref.close({ accion: 'cerrar' })
  }

}