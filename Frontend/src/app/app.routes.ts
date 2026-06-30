import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard';
import { RegistroComponent } from './exploradores/registro/registro';
import { AsistenciaComponent } from './exploradores/asistencia/asistencia'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  
  // NAVEGANTES
  { path: 'navegantes/asistencia', component: AsistenciaComponent },
  { path: 'navegantes/registro', component: RegistroComponent },

  // PIONEROS
  { path: 'pioneros/asistencia', component: AsistenciaComponent },
  { path: 'pioneros/registro', component: RegistroComponent },

  // SEGUIDORES
  { path: 'seguidores/asistencia', component: AsistenciaComponent },
  { path: 'seguidores/registro', component: RegistroComponent },

  // EXPLORADORES
  { path: 'exploradores/asistencia', component: AsistenciaComponent },
  { path: 'exploradores/registro', component: RegistroComponent },
];