import { Routes } from '@angular/router';

// Asegúrate de que las rutas relativas sean exactas. 
// Si tu archivo es 'src/app/components/login/login.component.ts', el import debe ser './components/login/login.component'
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard'; // ¡Añade el .component si falta!
import { RegistroComponent } from './exploradores/registro/registro'; // ¡Añade el .component si falta!
import { AsistenciaComponent } from './exploradores/asistencia/asistencia';
import { AscensoComponent } from './exploradores/ascenso/ascenso';

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
];