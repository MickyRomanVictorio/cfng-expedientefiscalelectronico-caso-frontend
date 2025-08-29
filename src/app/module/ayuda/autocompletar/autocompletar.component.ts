import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {AutoComplete, AutoCompleteModule} from "primeng/autocomplete";
import {PanelMenuModule} from "primeng/panelmenu";
import {MenuItem} from "primeng/api";
import {IconUtil} from 'ngx-cfng-core-lib';
import {CmpLibModule} from 'dist/cmp-lib';
import {AyudaService} from "@services/ayuda/ayuda.service";
import {ActivatedRoute, Router} from "@angular/router";

interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}

@Component({
    standalone: true,
    selector: 'app-ayuda-autocompletar',
    styleUrls: ['./autocompletar.component.scss'],
    templateUrl: './autocompletar.component.html',
    imports: [
        FormsModule,
        AutoCompleteModule,
        PanelMenuModule,
        CmpLibModule,
    ]
})
export class AutocompletarComponent implements OnInit, AfterViewInit  {
  @ViewChild('autoComp') autoComp: AutoComplete | undefined;

    items: any[] | undefined;
    pregunta: any;
    suggestions: any[] = [];
    menuItems: MenuItem[] = [];

    constructor(
        protected iconUtil: IconUtil,
        private ayudaService: AyudaService,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
    }

    search(event: AutoCompleteCompleteEvent) {
        const busqueda = {
            busqueda: event.query
        }
        this.ayudaService.busqueda(busqueda).subscribe({
            next: resp => {
                this.suggestions = resp;
            },
            error: (error) => {
                console.log(error)
                this.suggestions = [...Array(10).keys()].map(item => event.query + '-' + item);
            }
        })
    }

    autoCompleteSelect(item: any) {
        this.router.navigate(['../detalle'], {
            relativeTo: this.route,
            queryParams: {id: item.value.idCategoria}
        });
    }

  onEnter(valor: string) {
    this.router.navigate(['../busqueda'], {
      relativeTo: this.route,
      queryParams: {busqueda: valor}
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const inputElement = this.autoComp?.inputEL?.nativeElement;
      if (inputElement) {
        inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            this.onEnter(this.pregunta);
          }
        });
      }
    });
  }

}
