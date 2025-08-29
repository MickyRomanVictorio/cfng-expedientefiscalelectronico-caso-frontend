import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { IconAsset, IconUtil, StringUtil } from 'ngx-cfng-core-lib'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { DialogService, DynamicDialogRef, } from 'primeng/dynamicdialog'
import { InputTextareaModule } from 'primeng/inputtextarea'

@Component({
  standalone: true,
  imports: [
    InputTextareaModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
  ],
  selector: 'app-eliminar-tramite-modal',
  templateUrl: './eliminar-tramite-modal.component.html',
  providers: [DialogService],
})
export class EliminarTramiteModalComponent implements OnInit {


  public formulario!: FormGroup
  caracteresRestantes: number = 300

  constructor(
    public ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    protected iconAsset:IconAsset,
  ) {
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

  public eliminar(): void {
    this.ref.close({ accion: 'confirmar', motivo: this.formulario.get('motivo')?.value })
  }

  public cancelar(): void {
    this.ref.close({ accion: 'cancelar' })
  }

  public cerrar(): void {
    this.ref.close({ accion: 'cerrar' })
  }

}