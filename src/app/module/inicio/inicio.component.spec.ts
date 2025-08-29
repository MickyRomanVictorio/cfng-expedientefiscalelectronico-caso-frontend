import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { InicioComponent } from './inicio.component';


describe('InicioComponent', () => {

  let component: InicioComponent;
  let fixture: ComponentFixture<InicioComponent>;

  beforeEach(async () => {
    //
    await TestBed.configureTestingModule({
      imports: [
        InicioComponent
      ], providers: [
        JwtHelperService,
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Crear componente', () => {
    expect(component).toBeTruthy();
  });

});
