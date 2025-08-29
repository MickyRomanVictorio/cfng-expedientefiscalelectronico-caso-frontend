import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Destinatario, DestinatarioMensaje, EnviarTramiteRequest, UsuarioCargo  } from '@core/interfaces/comunes/EnviarTramiteRequest';
import { EnviarTramiteService } from '@services/provincial/enviar-tramite/enviar-tramite.service';
import { TokenService } from '@services/shared/token.service';
import { CARGO, IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { Subscription } from 'rxjs';
import { MaestroService } from '@core/services/shared/maestro.service';
import { CatalogoInterface } from '@core/interfaces/comunes/catalogo-interface';
import { GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import { NgClass } from '@angular/common';
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Router } from '@angular/router';

export const OBJETIVO_ENVIAR_TRAMITE = {
  PARA_REVISION: 434,
  PARA_VISADO: 435
}

@Component({
  standalone: true,
  selector: 'app-enviar-tramite-objetivo',
  templateUrl: './enviar-tramite-objetivo.component.html',
  imports: [
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    CmpLibModule,
    NgClass,
    NgxCfngCoreModalDialogModule
  ],
  styleUrl: './enviar-tramite-objetivo.component.scss',
})
export class EnviarTramiteObjetivoComponent implements OnInit, OnDestroy {

  protected listaDestinatarios: Destinatario[] = [];
  protected esMasivo: boolean = false;
  protected listaCasos: any[] = [];

  protected OBJETIVO_ENVIAR_TRAMITE = OBJETIVO_ENVIAR_TRAMITE;
  protected numeroCaso: string = '';
  protected idCaso: string = '';
  protected idBandejaActoTramite: string | null = null;
  protected idActoTramiteCaso: string = '';
  protected tramiteUltimo: string = '';
  private readonly suscripciones: Subscription[] = [];
  private readonly cargosPermitidos: Array<string> = [CARGO.FISCAL_SUPERIOR, CARGO.FISCAL_PROVINCIAL];
  protected mensajeListaVacia: string = 'No se encontraron resultados';
  protected objetivoEnviarTramite: CatalogoInterface[] = [];
  protected longitudMaximaObservaciones: number = 1000;
  protected formularioEnviar: FormGroup = new FormGroup({
    tipoObjetivo: new FormControl(null, [Validators.required]),
    destinatario: new FormControl([], [Validators.required]),
    comentarios: new FormControl('', [Validators.required, Validators.maxLength(this.longitudMaximaObservaciones)])
  })

  constructor(
    private readonly maestroService: MaestroService,
    protected dialogRef: DynamicDialogRef,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    public config: DynamicDialogConfig,
    private readonly tokenService: TokenService,
    private readonly enviarTramiteService: EnviarTramiteService,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    private readonly gestionCasoService: GestionCasoService,
    private readonly router: Router
  ) {
    this.numeroCaso = this.config.data?.numeroCaso;
    this.idCaso = this.config.data?.idCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.tramiteUltimo = this.config.data?.tramite;
    this.idBandejaActoTramite = this.config.data?.idBandejaActoTramite;
  }

  get formularioValido(): boolean {
    return this.formularioEnviar.valid;
  }

  get cantidadCaracteresObservacion(): number {
    return this.formularioEnviar.get('comentarios')!.value === null ? 0 : this.formularioEnviar.get('comentarios')!.value.length;
  }

  get mostrarObjetivoEnviarTramite(): boolean {
    return this.cargosPermitidos.includes( this.tokenService.getDecoded().usuario.codCargo );
  }

  get objetivoEnviarTramiteParaRevision(): boolean {
    return this.formularioEnviar.get('tipoObjetivo')?.value === OBJETIVO_ENVIAR_TRAMITE.PARA_REVISION;
  }

  ngOnInit(): void {
    this.listarObjetivoEnviarTramite();
    this.logicaMostrarObjetivoEnviarTramite();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach( suscripcion => suscripcion.unsubscribe() );
  }

  private logicaMostrarObjetivoEnviarTramite(): void {
    if ( !this.mostrarObjetivoEnviarTramite ) {
      this.formularioEnviar.get('tipoObjetivo')?.setValue( OBJETIVO_ENVIAR_TRAMITE.PARA_REVISION );
      this.alCambiarObjetivoEnviarTramite();
    }
  }

  protected alCambiarObjetivoEnviarTramite(): void {
    this.formularioEnviar.get('destinatario')?.reset();
    let idObjetivo: string = this.formularioEnviar.get('tipoObjetivo')?.value;
    this.enviarTramiteService.obtenerPerfilesUsuarios(this.config.data.idActoTramiteCaso, idObjetivo)
      .subscribe({
        next: (resp) => {
          this.listaDestinatarios = resp.map(
            (destinatario: UsuarioCargo) => ({
              label: `${ destinatario.dePerfil }: ${ destinatario.noUsuario }`,
              value: destinatario.idUsuario
            }))
        }
    });
  }

  private listarObjetivoEnviarTramite(): void {
    this.suscripciones.push(
      this.maestroService.getCatalogo('ID_N_ESTADO_DOCUMENTO').subscribe({
          next: (resp: GenericResponseModel<CatalogoInterface[]>) => {
            this.objetivoEnviarTramite = resp.data
            .filter(item => item.id === OBJETIVO_ENVIAR_TRAMITE.PARA_REVISION || item.id === OBJETIVO_ENVIAR_TRAMITE.PARA_VISADO)
            .map(item => ({ ...item, coDescripcion: this.stringUtil.capitalizedFirstWord(item.coDescripcion) }));
          },
          error: ( error ) => {
            this.objetivoEnviarTramite = [];
        }})
      )
  }

  protected confirmarEnvioTramite(): void {

    let destinatarios: string | string[] = this.formularioEnviar.get('destinatario')?.value;
    let destinatarioArray: string[] = Array.isArray(destinatarios) ? destinatarios : [destinatarios];

    const idUsuariosDestinos: DestinatarioMensaje[] = destinatarioArray.map((destinatario: string) => ({ idUsuario: destinatario }));
    const usuariosDestinos = this.listaDestinatarios.filter(objeto => destinatarioArray.includes(objeto.value));
    const tipoObjetivo: CatalogoInterface = this.objetivoEnviarTramite.filter(objeto => this.formularioEnviar.get('tipoObjetivo')?.value === objeto.id)[0];

    if ( OBJETIVO_ENVIAR_TRAMITE.PARA_VISADO == tipoObjetivo.id ) {
      const dialog = this.modalDialogService.warning('Enviar para visar',
        'Al enviar este trámite a visar, luego de que la primera persona realice el visado, el sistema generará la cabecera del documento la cual contiene: distrito geográfico, la fecha de emisión, tipo de documento y número de documento ¿Desea continuar?',
        'Confirmar',
        true,
        'Cancelar');
      dialog.subscribe({
        next:( resp: CfeDialogRespuesta )=> {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.enviarTramite(idUsuariosDestinos, usuariosDestinos, tipoObjetivo);
          }
        }
      });
    } else {
      this.enviarTramite(idUsuariosDestinos, usuariosDestinos, tipoObjetivo);
    }

  }

  private enviarTramite(idUsuariosDestinos: DestinatarioMensaje[], usuariosDestinos: Destinatario[], tipoObjetivo: CatalogoInterface): void {
    const enviarTramiteRequest: EnviarTramiteRequest = {
      idBandejaActoTramite: this.idBandejaActoTramite,
      procedencia: ID_TIPO_ORIGEN.EFE,
      idActoTramiteCaso: this.idActoTramiteCaso,
      idEstadoDocumento: this.formularioEnviar.get('tipoObjetivo')?.value,
      deComentarios: this.formularioEnviar.get('comentarios')?.value,
      usuariosDestino: idUsuariosDestinos,
    };

    this.enviarTramiteService
      .enviarSimpleTramite(enviarTramiteRequest)
      .subscribe({
        next: (resp) => {
          let usuariosEnviados: string = '';
          for ( let usuario of usuariosDestinos ) {
            usuariosEnviados += `&#x2022 ${ usuario.label } <br />`
          }
          this.gestionCasoService.obtenerCasoFiscal( this.idCaso );
          this.mostrarModalCorrecto(`Se envió el trámite <strong>"${ tipoObjetivo.coDescripcion }"</strong> a: <br>${ usuariosEnviados }`);
        },
        error: (error) => {
          if ( error.error.code == 500 ) this.modalDialogService.error('ERROR EN EL SERVICIO', `${error.error.message}`, 'Aceptar');
          else this.modalDialogService.warning('Mensaje del sistema', `${error.error.message}`, 'Aceptar');
        },
      });
  }

  private mostrarModalCorrecto(mensaje: string): void {
    const dialog = this.modalDialogService.success('TRÁMITE ENVIADO CORRECTAMENTE', mensaje, 'Aceptar');
    dialog.subscribe({
      next:( resp: CfeDialogRespuesta )=> {
        this.cerrarModal();
        let url: string = 'enviados-para-revisar';
        if ( this.formularioEnviar.get('tipoObjetivo')?.value === OBJETIVO_ENVIAR_TRAMITE.PARA_VISADO ) url = 'enviados-para-visar'
        this.router.navigate([`app/bandeja-tramites/${url}`]).then(() => {
          window.location.reload();
        });
      }
    });
  }

  protected cerrarModal(): void {
    this.dialogRef.close();
  }

  protected obtenerNumeroCaso(numeroCaso: string): string {
    return `Caso a enviar: <strong>${this.stringUtil.obtenerNumeroCaso(numeroCaso)}</strong>`;
  }

}
