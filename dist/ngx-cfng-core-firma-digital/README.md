# NgxCfngCoreFirmaDigital

Esta librería fue generada con [Angular CLI](https://github.com/angular/angular-cli) version 18.1.0.

## Pasos para integrar con otras aplicaciones

En el componente a trabajar importar `FirmaDigitalClienteComponent, FirmaDigitalClienteService, FirmaInterface` del projecto de libreria `ngx-cfng-core-firma-digital`.
```
import { FirmaDigitalClienteComponent, FirmaDigitalClienteService, FirmaInterface } from 'ngx-cfng-core-firma-digital';
```

En el html del componente a trabajar digitar el selector de la libreria `<cfe-lib-firma-digital-cliente></cfe-lib-firma-digital-cliente>`

Adicionalmente `FirmaDigitalClienteComponent, FirmaDigitalClienteService` deben estar en las secciones correspondientes
```
  imports: [
    FirmaDigitalClienteComponent
  ],
  providers: [FirmaDigitalClienteService],
```

Para enviar la data al proceso de firma utilizar `this.firmaDigitalService.sendDataSign.emit(dataFirma)` de la siguiente manera:
```
  public dataFirma: FirmaInterface = {
    id: 'identificador',
    rol?: string | null;
    motivo?: string | null;
    posicionX?: number | null;
    posicionY?: number | null;
    extension: 'pdf',
    firma_url:'http://cfms-generales-firmadigital-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/firmadigital/v1/t/firmadigital/',
    repositorio_url: 'http://cfms-generales-almacenamiento-objetos-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/objetos/v1/t/almacenamiento/publico/',
    param_url: 'http://cfms-generales-firmadigital-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/firmadigital/v1/t/firmadigital/cliente/obtenerparametros'
  };

  firmarDocumento() {
    this.firmaDigitalService.sendDataSign.emit(this.dataFirma);
  }
```
Finalmente para recibir la respuesta del cliente de firma utilizar lo siguiente, el cual responde '0' proceso correcto, '1' proceso fallido
```
  this.firmaDigitalService.processSignClient.subscribe(data=>{
    console.log("Recibiendo respuesta del cliente firma: ",data)
  })
```

## Construcción

Ejecuta `ng build` para construir el proyecto. Los artefactos de construcción se almacenarán en el directorio `dist/`.

## Ejecución de pruebas unitarias

Ejecuta `ng test` para realizar las pruebas unitarias mediante [Karma](https://karma-runner.github.io).

## Ejecución de pruebas de extremo a extremo

Ejecuta `ng e2e` para realizar las pruebas de extremo a extremo a través de una plataforma de tu elección. Para usar este comando, necesitas agregar primero un paquete que implemente capacidades de pruebas de extremo a extremo.

## Más ayuda

Para obtener más ayuda sobre el Angular CLI usa `ng help` o visita la página [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
