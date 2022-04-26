import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgAuthModule } from '@cg/ng-auth';
import { TransferErrorInterceptor } from '@cg/ng-errorhandler';
import { NgLocalizationModule } from '@cg/ng-localization';
import { FormControlModule } from '@shared/form-control.module';
import { NgAuthInterceptor } from '@cg/ng-auth';
import { MaterialModule } from '@shared/modules/material-module';
import { SettingListComponent } from '@system/pages/setting-list/setting-list.component';
import { SystemRoutingModule } from '@system/system-routing.module';
import { SettingService } from '@system/services/setting.service';

@NgModule({
  declarations: [SettingListComponent],
  imports: [
    CommonModule,
    SystemRoutingModule,
    FormControlModule,
    MaterialModule,
    FlexLayoutModule,
    NgLocalizationModule,
    NgAuthModule
  ],
  providers: [
    SettingService,
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
export class SystemModule { }
