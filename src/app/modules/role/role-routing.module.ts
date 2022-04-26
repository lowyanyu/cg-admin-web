import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleListComponent } from '@role/pages/role-list/role-list.component';
import { RoleAddComponent } from '@role/pages/role-add/role-add.component';
import { RoleEditComponent } from '@role/pages/role-edit/role-edit.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    data: {
      title: 'Role.list',
      permissions: ['CG_RoleSearch']
    },
    component: RoleListComponent,
    children: [
      {
        path: 'add',
        data: {
          title: 'Role.add',
          permissions: ['CG_RoleNew']
        },
        component: RoleAddComponent
      },
      {
        path: 'edit',
        data: {
          title: 'Role.edit',
          permissions: ['CG_RoleEdit']
        },
        component: RoleEditComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule { }
