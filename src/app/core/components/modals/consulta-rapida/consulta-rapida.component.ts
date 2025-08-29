import {CommonModule} from '@angular/common';
import {Component, HostListener} from '@angular/core';
import {CarouselModule} from 'primeng/carousel';
import {DialogService, DynamicDialogConfig} from 'primeng/dynamicdialog';
import {MenuModule} from 'primeng/menu';
import {textoTiempoSegundos} from "@pipes/tiempo.pipe";
import {ModalConsultaRapidaComponent} from "@components/modals/consulta-rapida/modal/modal-consulta-rapida.component";

@Component({
  standalone: true,
  selector: 'app-consulta-rapida',
  templateUrl: './consulta-rapida.component.html',
  styleUrls: ['./consulta-rapida.component.scss'],
  imports: [CommonModule, MenuModule, CarouselModule, textoTiempoSegundos],
  providers: [DialogService],
})
export class ConsultaRapidaComponent {
  constructor(
    private dialogService: DialogService,
  ) {}

  @HostListener('document:keydown', ['$event'])
  logKeyEvent(event: KeyboardEvent): void {
    if (event.altKey && event.ctrlKey && event.code === 'KeyF') {
      const ref = this.dialogService.open(ModalConsultaRapidaComponent, {
      } as DynamicDialogConfig);

      ref.onClose.subscribe((data) => {
        console.log(data);
      });
    }
  }
}
