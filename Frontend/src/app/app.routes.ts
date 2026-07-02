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
  
  // RUTA DINÁMICA DE ASCENSO (El ':grupo' captura el segmento de la URL)
  // Ejemplos que funcionarán con esta única línea:
  // /navegantes/ascenso, /pioneros/ascenso, /seguidores/ascenso, /exploradores/ascenso
  { path: ':grupo/ascenso', component: AscensoComponent },

  // RUTAS DE ASISTENCIA Y REGISTRO (Si quieres hacerlas dinámicas también)
  { path: ':grupo/asistencia', component: AsistenciaComponent },
  { path: ':grupo/registro', component: RegistroComponent },
];