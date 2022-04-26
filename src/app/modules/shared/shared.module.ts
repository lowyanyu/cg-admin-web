import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyFilterPipe } from '@shared/pipes/array-filter.pipe';
import { UtilService } from '@shared/services/util.service';

@NgModule({
  declarations: [MyFilterPipe],
  imports: [
    CommonModule
  ],
  exports: [MyFilterPipe],
  providers: [UtilService]
})
export class SharedModule { }
