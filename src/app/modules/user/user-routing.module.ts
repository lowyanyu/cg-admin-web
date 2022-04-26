import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserListComponent } from '@user/pages/user-list/user-list.component';
import { UserAddComponent } from '@user/pages/user-add/user-add.component';
import { UserEditComponent } from '@user/pages/user-edit/user-edit.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list',
    data: {
      title: 'Account.list',
      permissions: ['CG_UserSearch']
    },
    component: UserListComponent,
    children: [
      {
        path: 'add',
        data: {
          title: 'Account.add',
          permissions: ['CG_UserNew']
        },
        component: UserAddComponent
      },
      {
        path: 'edit',
        data: {
          title: 'Account.edit',
          permissions: ['CG_UserEdit']
        },
        component: UserEditComponent
      }
    ]
  },
  {
    path: 'info',
    data: {
      title: 'general.accountInfo',
      permissions: []
    },
    component: UserEditComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
