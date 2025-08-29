import {Injectable, NgZone} from '@angular/core';
import {BACKEND} from '@environments/environment';
import {Observable, Subject} from 'rxjs';
import {TokenService} from './token.service';

@Injectable({
  providedIn: 'root'
})
export class ContadoresService {
  private hostUrl = `${BACKEND.CFE_EFE_ALERTAS}`;
  private urlStream = `${this.hostUrl}/v1/e/contador/stream`;
  public coUsuario: string = '';
  public coDespacho: string = '';

  private eventSource: EventSource | null = null;
  private eventSubject = new Subject<any>();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 36;
  private isReconnecting: boolean = false;

  constructor(private ngZone: NgZone, private tokenService: TokenService) {
    this.coUsuario = this.tokenService.getDecoded().usuario.usuario;
    this.coDespacho = this.tokenService.getDecoded().usuario.codDespacho;
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

    this.eventSource = new EventSource(`${this.urlStream}/${this.coUsuario}/${this.coDespacho}`);

    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
    };

    this.eventSource.onerror = () => {
      if (!this.isReconnecting) {
        this.isReconnecting = true;
        this.reconnect();
      }
    };

    this.eventSource.onmessage = (event) => {
      this.ngZone.run(() => {
        try {
          const data = JSON.parse(event.data);
          this.eventSubject.next(data);
        } catch (e) {
          console.error('Error parsing message data:', e);
        }
      });
    };
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
