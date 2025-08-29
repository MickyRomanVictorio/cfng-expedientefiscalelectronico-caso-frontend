import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { catchError, concatMap, delay, filter, from, last, Observable, of, retry, throwError, timeout } from 'rxjs';
import { map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers':
      'Origin, Authorization, X-Requested-With, X-Custom-Header, Content-Type, Accept',
  }),
};

const httpBlob: Object = {
  responseType: 'blob',
};

const httpText: Object = {
  responseType: 'text',
};

@Injectable({ providedIn: 'root' })
export class ApiBaseService {
  constructor(private http: HttpClient) { }

  post(url: string, body: object, options?: object): Observable<any> {
    const mergedOptions = { ...httpOptions, ...options };
    return this.http.post(url, body, mergedOptions);
  }

  postEmpty(url: string): Observable<any> {
    return this.http.post(url, httpOptions);
  }

  postBlob(url: string, body: object): Observable<any> {
    return this.http.post(url, body, httpBlob);
  }

  get(url: string): Observable<any> {
    return this.http.get(url, httpOptions);
  }

  getTyped<T>(url: string): Observable<T> {
    return this.http.get<T>(url, httpOptions);
  }

  getWithInterface<Response>(url: string): Observable<Response> {
    return this.http.get<Response>(url, httpOptions);
  }

  getTexto(url: string): Observable<any> {
    return this.http.get(url, httpText);
  }

  put(url: string, body: object): Observable<any> {
    return this.http.put(url, body, httpOptions);
  }

  delete(url: string): Observable<any> {
    return this.http.delete(url, httpOptions);
  }

  deleteRetornaTexto(url: string): Observable<any> {
    return this.http.delete(url, { responseType: 'text' });
  }

  postFile(url: string, body: object): Observable<any> {
    return this.http.post(url, body);
  }

  postFileBase64(url: string, body: object): Observable<any> {
    return this.http.post(url, body, httpText);
  }

  getFile(url: string): Observable<any> {
    return this.http.get(url, httpBlob);
  }

  postMultiPart(url: string, body: object): Observable<any> {
    return this.http.post(url, body).pipe(
      timeout(600000),  // Configura un timeout adecuado
      retry({
        count: 3,
        delay: (error: any, retryCount) => {
          if (
            error.status === 0 || // network error
            error.message.includes('Connection reset')
          ) {
            console.warn(`Reintentando... intento #${retryCount + 1}`);
            return of(3000);
          }
          throw error; // no reintentar para errores no manejables
        }
      }),
      catchError((err) => {
        console.error('Error de conexión:', err);
        return throwError(() => err);
      })
    );
  }

  uploadBase64InChunks(url: string, base64: string, mimeType: string, fileName: string, chunkSize = 512 * 1024): Observable<any> {
    const blob = this.base64ToBlob(base64, mimeType);
    const totalChunks = Math.ceil(blob.size / chunkSize);
    const fileId = crypto.randomUUID(); // Unique ID

    const chunkObservables = Array.from({ length: totalChunks }, (_, index) => {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, blob.size);
      const chunkBlob = blob.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunkBlob, fileName); // importante: da nombre al chunk
      formData.append('fileId', fileId);
      formData.append('index', index.toString());
      formData.append('total', totalChunks.toString());
      formData.append('fileName', `${new Date().getTime()}-` + fileName);

      return this.http.post(url, formData).pipe(
        tap(() => console.log(`Enviado chunk ${index}`)),
        catchError(err => {
          console.error(`Error en chunk ${index}`, err);
          return throwError(() => err);
        })
      );
    });

    return from(chunkObservables).pipe(
      concatMap(req$ => req$),  // Ejecuta en secuencia
      last()
    );
  }

  base64ToBlob(base64: string, mime: string): Blob {
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([intArray], { type: mime });
  }
}
