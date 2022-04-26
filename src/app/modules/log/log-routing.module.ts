import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DebugLogListComponent } from '@log/pages/debug-log-list/debug-log-list.component';
import { ManagerLogListComponent } from '@log/pages/manager-log-list/manager-log-list.component';
import { ServiceLogListComponent } from '@log/pages/service-log-list/service-log-list.component';

const routes: Routes = [
  {path: '', component: DebugLogListComponent},
  {
    path: 'debugLog',
    component: DebugLogListComponent,
    data: {
      title: 'Log.debug',
      permissions: ['CG_DebugLogSearch']
    }
  },
  {
    path: 'managerLog',
    component: ManagerLogListComponent,
    data: {
      title: 'Log.management',
      permissions: ['CG_ManagerLogSearch']
    }
  },
  {
    path: 'serviceLog',
    component: ServiceLogListComponent,
    data: {
      title: 'Log.service',
      permissions: ['CG_ServiceLogSearch']
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogRoutingModule { }
