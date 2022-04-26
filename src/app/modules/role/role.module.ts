import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgAuthModule, NgAuthInterceptor } from '@cg/ng-auth';
import { TransferErrorInterceptor } from '@cg/ng-errorhandler';
import { NgLocalizationModule } from '@cg/ng-localization';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@shared/modules/material-module';

import { RoleRoutingModule } from '@role/role-routing.module';
import { RoleListComponent } from '@role/pages/role-list/role-list.component';
import { RoleAddComponent } from '@role/pages/role-add/role-add.component';
import { RoleEditComponent } from '@role/pages/role-edit/role-edit.component';
import { RoleDelDialogComponent } from '@role/components/role-del-dialog/role-del-dialog.component';
import { RoleService } from '@role/services/role.service';

@NgModule({
  entryComponents: [RoleDelDialogComponent],
  declarations: [RoleListComponent, RoleAddComponent, RoleEditComponent, RoleDelDialogComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule,
    SharedModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    RoleRoutingModule,
    NgAuthModule,
    NgLocalizationModule
  ],
  providers: [
    RoleService,
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
export class RoleModule { }
