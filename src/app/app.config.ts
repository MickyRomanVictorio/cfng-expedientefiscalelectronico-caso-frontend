import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy, provideRouter, RouteReuseStrategy } from '@angular/router';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { RequestInterceptor } from '@core/interceptors/request.interceptor';
import { SpinnerInterceptor } from '@core/interceptors/spinner.interceptor';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';

/**
 * Esta clase extiende `BaseRouteReuseStrategy` y proporciona una implementación personalizada
 * de la estrategia de reutilización de rutas en Angular.
 * Se utiliza para determinar si una ruta debe ser reutilizada o no, según su configuración y el componente asociado.
 *
 * @extends {BaseRouteReuseStrategy}
 */
export class CustomRouteReuseStrategy extends BaseRouteReuseStrategy {
  /**
   * Determina si una ruta debe ser reutilizada, verifica si las rutas futuras (`future`) y actuales (`curr`)
   * tienen la misma configuración de ruta o si los componentes asociados son iguales.
   *
   * @param {ActivatedRouteSnapshot} future - El estado futuro de la ruta que se va a activar.
   * @param {ActivatedRouteSnapshot} curr - El estado actual de la ruta activada.
   * @returns {boolean} Retorna `true` si la ruta debe ser reutilizada, de lo contrario `false`.
   */
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig ||
      (!!future.routeConfig?.component &&
        future.routeConfig?.component === curr.routeConfig?.component);
  }
}

// Registro de datos de localización en español
registerLocaleData(localeEs, 'es');

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

if(window){
  window.console.warn = function(){};
}

export const appConfig: ApplicationConfig = {
  providers: [
    PrimeNGConfig,
    TranslateService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy},
    { provide: LOCALE_ID, useValue: 'es' },
    //{ provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ]
};
