import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  // Si entran vacíos, los mandamos al login de inmediato
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Ruta oficial del panel de acceso
  { path: 'login', component: LoginComponent }
];