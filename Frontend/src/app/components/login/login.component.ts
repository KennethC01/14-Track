import { Component, ChangeDetectorRef, NgZone } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app'; 
import { firebaseConfig } from '../../firebase.config';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  correo: string = '';
  contrasena: string = '';
  grupo: string = ''; 
  errorMensaje: string = '';
  isLoginMode: boolean = true; 

  // CORRECCIÓN: Declaración explícita de los modificadores de acceso 'private'
  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone 
  ) {}

  seleccionarGrupo(nombre: string) {
    this.grupo = nombre;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMensaje = '';
    this.grupo = ''; 
    this.cdr.detectChanges(); 
  }

  debugClick() {
    console.log("¡El botón fue presionado!");
  }

  async onSubmit() {
    console.log("Iniciando onSubmit..."); 
    
    if (!this.correo || !this.contrasena) {
      this.errorMensaje = 'Por favor, rellene todos los campos.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.isLoginMode && !this.grupo) {
      this.errorMensaje = 'Por favor, selecciona un grupo antes de crear tu cuenta.';
      this.cdr.detectChanges();
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        this.errorMensaje = '';
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        
        if (this.isLoginMode) {
          console.log("Intentando loguear...");
          
          await this.authService.login(this.correo, this.contrasena)
            .then(() => {
              localStorage.setItem('email_temporal', this.correo);
              console.log("¡Logueado con éxito!");
              
              // Uso seguro de NgZone asegurando que la instancia exista
              if (this.ngZone) {
                this.ngZone.run(() => {
                  this.router.navigate(['/dashboard']);
                });
              } else {
                this.router.navigate(['/dashboard']);
              }
            })
            .catch((error) => {
              throw error;
            });
          
        } else {
          // --- MODO CREAR CUENTA ---
          console.log("Intentando crear usuario..."); 
          const auth = getAuth(app);
          const userCredential = await createUserWithEmailAndPassword(auth, this.correo, this.contrasena);
          
          console.log("Usuario creado, guardando en Firestore..."); 
          const db = getFirestore(app);
          await setDoc(doc(db, "usuarios", userCredential.user.uid), {
            email: this.correo,
            grupo: this.grupo,
            fechaRegistro: new Date()
          });
          
          console.log("¡Éxito total!");
          alert('¡Cuenta creada y grupo guardado!');
          
          localStorage.setItem('email_temporal', this.correo);
          localStorage.setItem('grupo_cache', this.grupo);
          
          if (this.ngZone) {
            this.ngZone.run(() => {
              this.router.navigate(['/dashboard']); 
            });
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      } catch (error: any) {
        console.error("Error detectado en la operación:", error); 
        
        switch (error.code) {
          case 'auth/invalid-credential':
            this.errorMensaje = 'El correo o la contraseña son incorrectos. Por favor, rectifica tus datos.';
            break;
          case 'auth/user-not-found':
            this.errorMensaje = 'Este correo electrónico no está registrado.';
            break;
          case 'auth/wrong-password':
            this.errorMensaje = 'La contraseña ingresada es incorrecta.';
            break;
          case 'auth/weak-password':
            this.errorMensaje = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
            break;
          case 'auth/email-already-in-use':
            this.errorMensaje = 'Este correo ya se encuentra registrado con otra cuenta.';
            break;
          case 'auth/invalid-email':
            this.errorMensaje = 'El formato del correo electrónico no es válido.';
            break;
          default:
            this.errorMensaje = 'Ocurrió un problema en el servidor. Inténtalo de nuevo.';
            break;
        }

        this.cdr.detectChanges();
      }
    }
  }
}