import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgAuthModule, NgAuthInterceptor } from '@cg/ng-auth';
import { TransferErrorInterceptor } from '@cg/ng-errorhandler';
import { NgLocalizationModule } from '@cg/ng-localization';
import { NgValidatorModule } from '@cg/ng-validator';
import { MaterialModule } from '@shared/modules/material-module';
import { TableModule } from '@shared/table.module';

import { UserListComponent } from '@user/pages/user-list/user-list.component';
import { UserAddComponent } from '@user/pages/user-add/user-add.component';
import { UserEditComponent } from '@user/pages/user-edit/user-edit.component';
import { UserDelDialogComponent } from '@user/components/user-del-dialog/user-del-dialog.component';
import { UserRoutingModule } from '@user/user-routing.module';
import { UserService } from '@user/services/user.service';

@NgModule({
  entryComponents: [
    UserDelDialogComponent
  ],
  declarations: [UserListComponent, UserAddComponent, UserEditComponent, UserDelDialogComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    UserRoutingModule,
    NgAuthModule,
    NgLocalizationModule,
    NgValidatorModule,
    TableModule
  ],
  providers: [
    UserService,
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
export class UserModule { }
