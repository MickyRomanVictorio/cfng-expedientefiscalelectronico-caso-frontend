import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {finalize, Observable} from "rxjs";
import {NgxSpinnerService} from "ngx-spinner";

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  private requestCount = 0;

  constructor(
    private spinner: NgxSpinnerService
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.requestCount === 0) {
      this.spinner.show();
    }
    this.requestCount++;

    return next.handle(req).pipe(
      finalize(() => {
        this.requestCount--;
        if (this.requestCount === 0) {
          this.spinner.hide();
        }
      })
    );
  }
}
