import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard';
import { RegistroComponent } from './exploradores/registro/registro';
import { AsistenciaComponent } from './exploradores/asistencia/asistencia'; 
import { AscensoComponent } from './exploradores/ascenso/ascenso';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  
  // Usamos renderMode: 'client' para saltar el error de prerendering
  { 
    path: ':grupo/ascenso', 
    component: AscensoComponent,
    data: { renderMode: 'client' } 
  },
  { 
    path: ':grupo/asistencia', 
    component: AsistenciaComponent,
    data: { renderMode: 'client' } 
  },
  { 
    path: ':grupo/registro', 
    component: RegistroComponent,
    data: { renderMode: 'client' } 
  },
];