import { Injectable } from '@angular/core';
import { ClasificadorExpedienteEnum } from '@core/constants/constants';
import { Expediente } from '@core/utils/expediente';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GestionCasoService {

  private readonly casoSubject = new Subject<Expediente>();
  public alActualizarCaso$ = this.casoSubject.asObservable();

  private readonly casoSubjectBe = new BehaviorSubject<Expediente | null>(null);
  public alActualizarCasoBe$ = this.casoSubject.asObservable();

  private caso!: Expediente;
  private expediente!: Expediente;
  private esObtenida: boolean = false;
  private tipoClasificadorExpediente:ClasificadorExpedienteEnum = ClasificadorExpedienteEnum.Principal;

  constructor(private readonly casoService: Casos) {}

  public get tipoClasificador(): ClasificadorExpedienteEnum {
    return this.tipoClasificadorExpediente;
  }

  public set tipoClasificador(tipo:ClasificadorExpedienteEnum) {
    this.tipoClasificadorExpediente = tipo;
  }

  public get dataObtenida(): boolean {
    return this.esObtenida;
  }

  public set dataObtenida(esObtenida: boolean) {
    this.esObtenida = esObtenida;
  }

  public get expedienteActual() {
    if(this.tipoClasificadorExpediente === ClasificadorExpedienteEnum.PestaniaApelacion){
      return this.expediente.cuadernoIncidental!;
    }else{
      return this.expediente;
    }
  }

  public set expedienteActual(expediente: Expediente) {
    this.expediente = expediente;
  }

  public get casoActual() {
    if(this.tipoClasificadorExpediente === ClasificadorExpedienteEnum.PestaniaApelacion){
      return this.caso.cuadernoIncidental!;
    }else{
      return this.caso;
    }
  }

  public set casoActual(caso: Expediente) {
    this.caso = caso;
  }

  public actualizarCaso(caso: Partial<Expediente>) {
    if(this.tipoClasificadorExpediente === ClasificadorExpedienteEnum.PestaniaApelacion){
      this.caso.cuadernoIncidental = { ...this.caso.cuadernoIncidental!, ...caso };
    }else{
      this.caso = { ...this.caso, ...caso };
    }
    if(this.tipoClasificadorExpediente !== ClasificadorExpedienteEnum.PestaniaApelacion) {
      this.casoSubject.next(this.caso);
      this.casoSubjectBe.next(this.caso);
    }
  }

  public obtenerCasoFiscal(idCaso: string) {
    this.casoService.obtenerCasoFiscal(idCaso).subscribe((response: Expediente) => {
      this.actualizarCaso( response );
      this.dataObtenida = true;
    });
  }

  public getCasoFiscalActual(): Expediente | null {
    return this.casoSubjectBe.getValue();
  }

  public obtenerCasoFiscalV2(idCaso: string, modificaciones: Partial<Expediente> = {}): Observable<any> {
    return this.casoService.obtenerCasoFiscal(idCaso).pipe(
      map((response: Expediente) => {
        return { ...response, ...modificaciones };
      }),
      tap((response: Expediente) => {
        this.actualizarCaso(response);
        this.dataObtenida = true;
        this.expedienteActual = this.caso;
      })
    );
  }
}
