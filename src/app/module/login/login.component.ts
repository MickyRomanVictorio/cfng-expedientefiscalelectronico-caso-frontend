import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SYSTEM_CODE_LOGIN } from '@environments/environment';

// @ts-ignore
import { iBank } from 'ngx-mpfn-dev-icojs-regular';
import { MessageService } from 'primeng/api';
import { AuthService } from '@core/services/auth/auth.service';
import { Router } from '@angular/router';
import inputErrorUtil from '@core/utils/input-error';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TokenService } from '@core/services/shared/token.service';

import { Constants } from 'ngx-cfng-core-lib';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule
  ],
  templateUrl: './login.component.html',
  providers: [MessageService],
})
export class LoginComponent implements OnInit {

  myForm: FormGroup;
  isSubmitted: boolean;
  isLoading: boolean;
  isInvalid: (a: boolean, b: any) => boolean;

  iUser = iBank;
  iKey = iBank;
  iLock = iBank;



  constructor(
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService,
    private tokenService: TokenService,
  ) {

    this.myForm = this.fb.group({
      username: ['32920589', Validators.required],
      password: ['123456789', Validators.required],
      token: ['123456', Validators.required],
    });
    this.isSubmitted = false;
    this.isLoading = false;
    this.isInvalid = inputErrorUtil.isInvalid;

  }

  ngOnInit(): void {

  }

  getPayload(form: any) {
    return {
      usuario: form.username,
      password: form.password,
      token: form.token,
      sistema: SYSTEM_CODE_LOGIN,
    };
  }

  submit() {
    this.isSubmitted = true;
    const payload = this.getPayload(this.myForm.value);
    this.isLoading = true;
    this.authService
      .login(payload)
      .subscribe(data => {
        let token = JSON.stringify(data);
        sessionStorage.setItem(Constants.TOKEN_NAME, token);
        //sessionStorage.setItem(Constants)
        this.router.navigate(['app']);
      })
      .add(() => {
        this.isLoading = false;
      });
  }

}
