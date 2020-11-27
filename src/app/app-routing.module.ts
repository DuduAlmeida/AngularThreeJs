/* #region Imports*/

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './pages/main/main.component';
import { WebxrApplicationComponent } from './pages/webxr-application/webxr-application.component';

/* #Endregion Imports*/

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: WebxrApplicationComponent,
  },
  {
    path: '**',
    component: MainComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
