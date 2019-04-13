import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AngularMaterialModule } from './angular-material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { PacienteComponent } from './paciente/paciente.component';
import { InstituicaoComponent } from './instituicao/instituicao.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'paciente', component: PacienteComponent, canActivate: [AuthGuard]}
]

@NgModule({
  declarations: [
    AppComponent,
    PacienteComponent,
    InstituicaoComponent,
    LoginComponent
  ],
  imports: [
    RouterModule.forRoot(
      routes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    RouterModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    CommonModule,
    FormsModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
