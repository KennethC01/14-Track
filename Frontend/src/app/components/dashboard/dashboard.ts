import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; 
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '../../firebase.config';
import { Router, RouterLink } from '@angular/router'; // <-- MODIFICADO: Agregamos RouterLink aquí

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], // <-- MODIFICADO: Agregamos RouterLink a los imports
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit { 
  grupoUsuario: string = 'EXPLORADORES'; 
  emailUsuario: string = '';
  cargando: boolean = true; 

  constructor(
    private router: Router, 
    private zone: NgZone,
    private cdr: ChangeDetectorRef 
  ) {} 

  ngOnInit() {
    if (typeof window !== 'undefined') {
      
      const emailCache = localStorage.getItem('email_temporal');
      const grupoCache = localStorage.getItem('grupo_cache');

      if (emailCache) {
        this.emailUsuario = emailCache;
        this.grupoUsuario = (grupoCache || 'EXPLORADORES').toUpperCase();
        this.cargando = false; 
        this.cdr.detectChanges();
      } else {
        this.cargando = true;
      }

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const db = getFirestore(app);

      onAuthStateChanged(auth, (user) => {
        this.zone.run(async () => {
          if (user) {
            this.emailUsuario = user.email || '';
            localStorage.setItem('email_temporal', this.emailUsuario);
            
            try {
              const docRef = doc(db, "usuarios", user.uid);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                const grupoFirebase = docSnap.data()['grupo'] || 'EXPLORADORES';
                this.grupoUsuario = grupoFirebase.toUpperCase();
                localStorage.setItem('grupo_cache', this.grupoUsuario);
              }
            } catch (error) {
              console.error("Error de sincronización silenciosa:", error);
            } finally {
              this.cargando = false;
              this.cdr.detectChanges(); 
            }
          } else {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        });
      });
    }
  }

  cerrarSesion() {
    if (typeof window !== 'undefined') {
      const app = getApp();
      const auth = getAuth(app);
      
      signOut(auth).then(() => {
        this.zone.run(() => {
          localStorage.clear(); 
          this.router.navigate(['/login']); 
        });
      }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
    }
  }
}