import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NgxCfngCoreModalDialogConfigService } from '@ngx-cfng-core-modal/dialog';
import { DOMAIN_ASSETS } from '@environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgxSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'cfng-expedientefiscalelectronico-caso-frontend';
  date: any;
  subscription: Subscription;

  constructor(
    private primeNGConfig: PrimeNGConfig,
    private translateService: TranslateService,
    private modalDialogConfigService: NgxCfngCoreModalDialogConfigService,
  ) {
    this.translateService.setDefaultLang('es');
    this.translateService.use('es');

    this.subscription = this.translateService
      .stream('primeng')
      .subscribe((data) => {
        this.primeNGConfig.setTranslation(data);
      });
  }
  ngOnInit(): void {
    this.modalDialogConfigService.setIconBaseUrl(DOMAIN_ASSETS+ '/icons');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
