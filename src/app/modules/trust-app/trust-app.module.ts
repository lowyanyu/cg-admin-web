import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TransferErrorInterceptor } from '@cg/ng-errorhandler';
import { NgAuthModule, NgAuthInterceptor } from '@cg/ng-auth';
import { NgLocalizationModule } from '@cg/ng-localization';
import { MaterialModule } from '@shared/modules/material-module';
import { SharedModule } from '@shared/shared.module';

import { TrustAppRoutingModule } from '@trustApp/trust-app-routing.module';
import { TrustAppListComponent } from '@trustApp/pages/trust-app-list/trust-app-list.component';
import { TrustAppAddComponent } from '@trustApp/pages/trust-app-add/trust-app-add.component';
import { TrustAppInfoComponent } from '@trustApp/pages/trust-app-info/trust-app-info.component';
import { TrustAppAgentListComponent } from '@trustApp/components/trust-app-agent-list/trust-app-agent-list.component';
import { TrustAppAgentDelDialogComponent } from '@trustApp/components/trust-app-agent-del-dialog/trust-app-agent-del-dialog.component';
import { TrustAppEditDialogComponent } from '@trustApp/components/trust-app-edit-dialog/trust-app-edit-dialog.component';
import { TrustAppPermsListComponent } from '@trustApp/components/trust-app-perms-list/trust-app-perms-list.component';
import { TrustAppTokenListComponent } from '@trustApp/components/trust-app-token-list/trust-app-token-list.component';
import { TrustAppTokenDelDialogComponent } from '@trustApp/components/trust-app-token-del-dialog/trust-app-token-del-dialog.component';
import { TrustAppDelDialogComponent } from '@trustApp/components/trust-app-del-dialog/trust-app-del-dialog.component';
import { TrustAppApikeyDlDialogComponent } from '@trustApp/components/trust-app-apikey-dl-dialog/trust-app-apikey-dl-dialog.component';
import { TrustAppExportDialogComponent } from '@trustApp/components/trust-app-export-dialog/trust-app-export-dialog.component';
import { TrustAppImportDialogComponent } from '@trustApp/components/trust-app-import-dialog/trust-app-import-dialog.component';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@NgModule({
  entryComponents: [
    TrustAppAgentDelDialogComponent,
    TrustAppEditDialogComponent,
    TrustAppTokenDelDialogComponent,
    TrustAppDelDialogComponent,
    TrustAppApikeyDlDialogComponent,
    TrustAppExportDialogComponent,
    TrustAppImportDialogComponent
  ],
  declarations: [
    TrustAppListComponent,
    TrustAppAddComponent,
    TrustAppInfoComponent,
    TrustAppAgentListComponent,
    TrustAppAgentDelDialogComponent,
    TrustAppEditDialogComponent,
    TrustAppPermsListComponent,
    TrustAppTokenListComponent,
    TrustAppTokenDelDialogComponent,
    TrustAppDelDialogComponent,
    TrustAppApikeyDlDialogComponent,
    TrustAppExportDialogComponent,
    TrustAppImportDialogComponent
  ],
  imports: [
    CommonModule,
    TrustAppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgAuthModule,
    NgLocalizationModule,
    FlexLayoutModule,
    MaterialModule,
    SharedModule
  ],
  providers: [
    TrustAppService,
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
export class TrustAppModule { }
