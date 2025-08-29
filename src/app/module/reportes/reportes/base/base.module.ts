import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltrosComponent } from './filtros/filtros.component';
import { TablaComponent } from './tabla/tabla.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [CommonModule, FiltrosComponent, TablaComponent, FooterComponent],
  exports: [FiltrosComponent, TablaComponent, FooterComponent],
})
export class BaseModule {}
