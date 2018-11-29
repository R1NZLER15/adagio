import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PublicationsComponent } from './components/publications/publications.component';
import { DiscoverComponent } from './components/discover/discover.component';
import { PreloaderComponent } from './components/preloader/preloader.component';

const routes: Routes = [
  {path: '', component: PublicationsComponent},
  {path: 'timeline', component: DiscoverComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'profile/:id', component: ProfileComponent},
  {path: 'user/:id', component: ProfileComponent},
  {path: 'preloader', component: PreloaderComponent}
];

import { ModuleWithProviders } from '@angular/core';
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(routes);

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
