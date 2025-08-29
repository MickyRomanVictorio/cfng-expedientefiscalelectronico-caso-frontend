import {Component, Input, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AutoCompleteModule} from "primeng/autocomplete";
import {PanelMenuModule} from "primeng/panelmenu";
import {MenuItem} from "primeng/api";
import {NgIf} from "@angular/common";
import {IconUtil} from 'ngx-cfng-core-lib';
import {ActivatedRoute, Router} from "@angular/router";
import {InputTextareaModule} from "primeng/inputtextarea";
import {NgxCfngCoreModalDialogModule} from '@ngx-cfng-core-modal/dialog';
import {BreadcrumbModule} from "primeng/breadcrumb";

@Component({
  standalone: true,
  selector: 'app-ayuda-breadcrumb',
  styleUrls: ['./breadcrumb.component.scss'],
  templateUrl: './breadcrumb.component.html',
  imports: [
    FormsModule,
    AutoCompleteModule,
    PanelMenuModule,
    NgIf,
    InputTextareaModule,
    ReactiveFormsModule,
    NgxCfngCoreModalDialogModule,
    BreadcrumbModule
  ]
})
export class BreadcrumbComponent implements OnInit {
  home: MenuItem | undefined;
  breadCumList: any = [
    {label: 'Módulo de ayuda al usuario', route: '../inicio'},
    {label: 'EFE: Expediente fiscal electrónico', route: '../inicio'}
  ];
  @Input() data!: any;

  constructor(
    protected iconUtil: IconUtil,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.data.forEach((d: any) => {
      this.breadCumList.push(d)
    })
  }

  navigateToDetail(item: any) {
    this.router.navigate([item.route], {
      relativeTo: this.route,
      queryParams: {idCategoria: item.id}
    });
  }

}
