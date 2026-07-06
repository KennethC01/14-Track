import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard'; 
import { RegistroComponent } from './exploradores/registro/registro'; 
import { AsistenciaComponent } from './exploradores/asistencia/asistencia';
import { AscensoComponent } from './exploradores/ascenso/ascenso';
// 1. Importa tu nuevo componente (asegúrate de que la ruta sea correcta)
import { ReportesComponent } from './reportes/reportes'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  
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
  // 2. Añade esta ruta para los reportes
  { 
    path: ':grupo/reportes', 
    component: ReportesComponent,
    data: { renderMode: 'client' } 
  },
];