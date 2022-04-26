import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule) },
  { path: 'management', loadChildren: () => import('./modules/management/management.module').then(m => m.ManagementModule) },
  { path: 'forbidden', redirectTo: 'management/forbidden', pathMatch: 'full' },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: 'management', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
