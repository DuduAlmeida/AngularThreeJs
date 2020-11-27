/* #region Imports*/

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';
import { WebxrApplicationComponent } from './pages/webxr-application/webxr-application.component';

/* #Endregion Imports*/

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    WebxrApplicationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
