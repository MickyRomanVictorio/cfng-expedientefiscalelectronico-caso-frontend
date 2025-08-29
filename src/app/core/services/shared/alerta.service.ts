import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import {
  Alerta,
  AlertaGeneralRequestDTO,
  SumarioAlertaResponseDTO,
} from '@core/interfaces/comunes/alerta';
import { BACKEND } from '@environments/environment';
import {Observable, Observer, Subject} from 'rxjs';
import { TokenService } from './token.service';
import { BaseResponse } from '@core/interfaces/comunes/genericos.interface';

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  private hostUrl = `${BACKEND.CFE_EFE_ALERTAS}`;
  private hostUrlTramite = `${BACKEND.CFE_EFE_TRAMITES}`;
  // private hostUrl = 'http://10.40.120.65:8080';

  private alertsUrl = `${this.hostUrl}/v1/e/alerta`;
  private urlStream = `${this.hostUrl}/v1/e/alerta/stream`;

  public codigoDespacho: string = '';
  public codUsuarioDestino: string = '';
  public sumario!: SumarioAlertaResponseDTO;
  private eventSource: EventSource | null = null;
  private eventSubject = new Subject<any>();
  private eventObserver!: Observer<MessageEvent>;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 36;
  private isReconnecting: boolean = false;

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private tokenService: TokenService
  ) {
    const usuarioSession = this.tokenService.getDecoded();
    this.codigoDespacho = usuarioSession.usuario.codDespacho;
    this.codUsuarioDestino = usuarioSession.usuario.usuario;
  }

  obtenerAlertas(): Observable<any[]> {
    return this.http.get<any[]>(this.alertsUrl + '/' + this.codigoDespacho + '/' + this.codUsuarioDestino);
  }

  actualizarAlerta(alerta: Alerta): Observable<any> {
    alerta.estado = 'SOLUCIONADO';
    return this.http.put(
      this.alertsUrl + '/' + this.codigoDespacho + '/' + alerta.id,
      alerta
    );
  }

  solucionarAlerta(alerta: Alerta): Observable<any> {
    const body: any = {
      codigoDespacho: alerta.codigoDespacho,
      idFiscalAsignado: alerta.idAsignado,
      codigoCaso: alerta.codigoCaso,
    };
    return this.http.post(
      this.alertsUrl + '/solucionarAlertasByCodigoCaso',
      body
    );
  }

  generarAlertaTramite(
    request: AlertaGeneralRequestDTO
  ): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(
      this.hostUrlTramite + '/v1/e/alerta/generar',
      request
    );
  }

  connect(): Observable<any> {
    if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
      this.createEventSource();
    }
    return this.eventSubject.asObservable();
  }

  private createEventSource() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`${this.urlStream}/${this.codigoDespacho}/${this.codUsuarioDestino}`);

    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
    };

    this.eventSource.onerror = (error) => {
      if (!this.isReconnecting) {
        this.isReconnecting = true;
        this.reconnect();
      }
    };

    this.eventSource.onmessage = (event) => this.handleMessage(event);
  }

  private handleMessage(event: any) {
    if (JSON.stringify(this.sumario) !== event.data) {
      try {
        const data = JSON.parse(event.data);
        if (data.id === -1) return;
        this.ngZone.run(() => {
          this.sumario = data;
          this.eventSubject.next(data);
        });
      } catch (error) {
        console.error('Error al parsear mensaje:', error);
      }
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.createEventSource();
      }, 5000);
    }
  }

}
