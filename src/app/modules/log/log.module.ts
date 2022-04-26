import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgAuthInterceptor } from '@cg/ng-auth';
import { TransferErrorInterceptor } from '@cg/ng-errorhandler';
import { NgLocalizationModule } from '@cg/ng-localization';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@shared/modules/material-module';
import { LogRoutingModule } from '@log/log-routing.module';
import { ServiceLogDetailDialogComponent } from '@log/components/service-log-detail-dialog/service-log-detail-dialog.component';
import { ManagerLogListComponent } from '@log/pages/manager-log-list/manager-log-list.component';
import { ServiceLogListComponent } from '@log/pages/service-log-list/service-log-list.component';
import { DebugLogListComponent } from '@log/pages/debug-log-list/debug-log-list.component';
import { DebugLogService } from '@log/services/debug-log.service';
import { ServiceLogService } from '@log/services/service-log.service';
import { ManagerLogService } from '@log/services/manager-log.service';

@NgModule({
  entryComponents: [
    ServiceLogDetailDialogComponent
  ],
  declarations: [
    DebugLogListComponent,
    ManagerLogListComponent,
    ServiceLogListComponent,
    ServiceLogDetailDialogComponent,
  ],
  imports: [
    CommonModule,
    LogRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    NgLocalizationModule,
    SharedModule,
    FlexLayoutModule
  ],
  providers: [
    ServiceLogService,
    ManagerLogService,
    DebugLogService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgAuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TransferErrorInterceptor,
      multi: true
    },
    DatePipe
  ]
})
export class LogModule { }
