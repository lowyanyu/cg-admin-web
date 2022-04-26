import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgAuthGuard } from '@cg/ng-auth';
import { LoginedComponent } from '@management/pages/logined/logined.component';
import { InfoComponent } from '@management/pages/info/info.component';
import { ErrorComponent } from '@management/pages/error/error.component';
import { ForbiddenComponent } from '@management/pages/forbidden/forbidden.component';

const routes: Routes = [
  {
    path: '',
    component: LoginedComponent,
    canActivate: [NgAuthGuard],
    canActivateChild: [NgAuthGuard],
    children: [
      {
        path: 'error',
        component: ErrorComponent,
        data: {
          title: 'System.error'
        },
      },
      {
        path: 'dashboard',
        loadChildren: () => import('@management/modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'system',
        data: { title: 'System.title' },
        loadChildren: () => import('@system/system.module').then(m => m.SystemModule)
      },
      {
        path: 'log',
        data: { title: 'Log.title' },
        loadChildren: () => import('@log/log.module').then(m => m.LogModule)
      },
      {
        path: 'info',
        data: { title: 'System.info' },
        component: InfoComponent
      },
      { path: 'forbidden', component: ForbiddenComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'management', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
