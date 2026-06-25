import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app = initializeApp(firebaseConfig);
  private auth = getAuth(this.app);

  // Iniciar sesión en Firebase
  async login(correo: string, contrasena: string) {
    const credenciales = await signInWithEmailAndPassword(this.auth, correo, contrasena);
    const token = await credenciales.user.getIdToken();
    localStorage.setItem('token_comandante', token); // Guardamos el pase de acceso
    return credenciales.user;
  }

  // Cerrar sesión
  async logout() {
    await signOut(this.auth);
    localStorage.removeItem('token_comandante');
  }

  // Saber si hay un comandante activo
  estaLogueado(): boolean {
    return localStorage.getItem('token_comandante') !== null;
  }
}