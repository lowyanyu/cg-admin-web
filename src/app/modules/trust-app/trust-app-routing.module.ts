import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrustAppListComponent } from '@trustApp/pages/trust-app-list/trust-app-list.component';
import { TrustAppAddComponent } from '@trustApp/pages/trust-app-add/trust-app-add.component';
import { TrustAppInfoComponent } from '@trustApp/pages/trust-app-info/trust-app-info.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    component: TrustAppListComponent,
    data: {
      title: 'Application.list',
      permissions: ['CG_ApplicationSearch']
    },
    children: [
      {
        path: 'info',
        component: TrustAppInfoComponent,
        data: {
          title: 'Application.info',
          permissions: ['CG_ApplicationSearch']
        }
      },
      {
        path: 'add',
        component: TrustAppAddComponent,
        data: {
          title: 'Application.add',
          permissions: ['CG_ApplicationNew']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrustAppRoutingModule { }
