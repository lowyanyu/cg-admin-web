import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingListComponent } from '@system/pages/setting-list/setting-list.component';

const routes: Routes = [
  {
    path: 'user',
    data: { title: 'Account.title' },
    loadChildren: () => import('src/app/modules/user/user.module').then(m => m.UserModule)
  },
  {
    path: 'role',
    data: { title: 'Role.title' },
    loadChildren: () => import('src/app/modules/role/role.module').then(m => m.RoleModule)
  },
  {
    path: 'setting',
    component: SettingListComponent,
    data: {
      title: 'Setting.title',
      permissions: ['CG_SettingEdit']
    }
  },
  {
    path: 'trustApp',
    data: { title: 'Application.title' },
    loadChildren: () => import('src/app/modules/trust-app/trust-app.module').then(m => m.TrustAppModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemRoutingModule { }
