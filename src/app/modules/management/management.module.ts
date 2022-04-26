import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgAuthGuard, NgAuthModule } from '@cg/ng-auth';
import { TransferErrorInterceptor } from '@cg/ng-errorhandler';
import { NgLocalizationModule } from '@cg/ng-localization';
import { NgAuthInterceptor } from '@cg/ng-auth';
import { MaterialModule } from '@shared/modules/material-module';
import { MessageModule } from '@shared/message.module';
import { SharedModule } from '@shared/shared.module';

import { ManagementRoutingModule } from '@management/management-routing.module';
import { TopBarComponent } from '@management/components/top-bar/top-bar.component';
import { LoginedComponent } from '@management/pages/logined/logined.component';
import { InfoComponent } from '@management/pages/info/info.component';
import { ErrorComponent } from '@management/pages/error/error.component';
import { ForbiddenComponent } from '@management/pages/forbidden/forbidden.component';

@NgModule({
  declarations: [
    TopBarComponent,
    LoginedComponent,
    InfoComponent,
    ErrorComponent,
    ForbiddenComponent
  ],
  imports: [
    CommonModule,
    ManagementRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    SharedModule,
    HttpClientModule,
    NgLocalizationModule,
    MessageModule,
    NgAuthModule
  ],
  providers: [
    NgAuthGuard,
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
export class ManagementModule { }
