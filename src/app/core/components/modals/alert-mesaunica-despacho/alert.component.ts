import { Component, Input, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { obtenerIcono } from '@utils/icon';

import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, CmpLibModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit {
  @Input() public cosable: boolean = true;
  @Input() public showButton: boolean = false;

  @Input() public dataAlert: any = {
    severity: 'success',
    isVerification: false,
    detail: '...',
    detail1: null,
  };

  public obtenerIcono = obtenerIcono;

  constructor(private router: Router) {}
  ngOnInit() {
    if (this.dataAlert.detail1) this.stringFormatUpperLowerCase();
  }

  stringFormatUpperLowerCase() {
    const palabras = this.dataAlert.detail1.split(' ');
    this.dataAlert.detail1 = palabras
      .map((palabra: any) => {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      })
      .join(' ');
  }

  goMain() {
    this.router.navigate(['/']);
  }
}
