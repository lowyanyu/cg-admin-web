import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgLocalizationModule } from '@cg/ng-localization';
import { RouterModule } from '@angular/router';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormControlComponent } from '@shared/form-field/form-control/form-control.component';
import { MaterialModule } from '@shared/modules/material-module';
import { SharedModule } from '@shared/shared.module';
import { FormControlService } from '@shared/services/form-control.service';

@NgModule({
  declarations: [
    FormControlComponent
  ],
  exports: [
    FormControlComponent,
    ReactiveFormsModule,
    FormsModule
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    NgLocalizationModule,
    ColorPickerModule,
    SharedModule
  ],
  providers : [
    FormControlService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormControlModule { }
