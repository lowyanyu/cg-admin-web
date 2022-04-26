import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgLocalizationModule } from '@cg/ng-localization';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ToastItemComponent } from '@shared/components/toast/toast-item/toast-item.component';
import { MessageService } from '@shared/services/message.service';

@NgModule({
  declarations: [
    ToastComponent,
    ToastItemComponent,
  ],
  exports: [
    ToastComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgLocalizationModule
  ],
  providers: [
    MessageService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MessageModule { }
