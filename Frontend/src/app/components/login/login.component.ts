import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebase.config';
// IMPORTANTE: Añade estas líneas
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
  isLoginMode: boolean = false; 

  constructor(private authService: AuthService, private router: Router) {}

  // Esta es la función que debe llamar tu botón en el HTML
  seleccionarGrupo(nombre: string) {
    this.grupo = nombre;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMensaje = '';
  }

  async onSubmit() {
  console.log("Iniciando onSubmit..."); // <--- 1. Mira si esto sale en la consola (F12)
  
  if (!this.correo || !this.contrasena) {
    this.errorMensaje = 'Por favor, rellene todos los campos.';
    return;
  }

  try {
    this.errorMensaje = '';
    const app = initializeApp(firebaseConfig);
    
    if (this.isLoginMode) {
      console.log("Intentando loguear...");
      await this.authService.login(this.correo, this.contrasena);
    } else {
      console.log("Intentando crear usuario..."); // <--- 2. Mira si esto sale
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, this.correo, this.contrasena);
      
      console.log("Usuario creado, guardando en Firestore..."); // <--- 3. Mira si esto sale
      const db = getFirestore(app);
      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        email: this.correo,
        grupo: this.grupo,
        fechaRegistro: new Date()
      });
      console.log("¡Éxito total!");
      alert('¡Cuenta creada y grupo guardado!');
    }
  } catch (error: any) {
    console.error("Error detectado:", error); // <--- 4. Aquí verás el error REAL
    this.errorMensaje = 'Error: ' + error.message;
  }
}
}
