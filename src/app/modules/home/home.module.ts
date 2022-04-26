import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TransferErrorInterceptor } from '@cg/ng-errorhandler';
import { NgLocalizationModule } from '@cg/ng-localization';
import { NgValidatorModule } from '@cg/ng-validator';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@shared/modules/material-module';
import { NgAuthInterceptor } from '@cg/ng-auth';

import { HomeRoutingModule } from '@home/home-routing.module';
import { LoginComponent } from '@home/pages/login/login.component';
import { LoginService } from '@home/services/login.service';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    HttpClientModule,
    NgLocalizationModule,
    SharedModule,
    NgValidatorModule
  ],
  providers: [
    LoginService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgAuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TransferErrorInterceptor,
      multi: true
    }
  ]
})
export class HomeModule { }
