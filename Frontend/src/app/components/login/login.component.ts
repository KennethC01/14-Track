import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
  errorMensaje: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    try {
      this.errorMensaje = '';
      await this.authService.login(this.correo, this.contrasena);
      alert('¡Bienvenido, Comandante!');
    } catch (error: any) {
      this.errorMensaje = 'Correo o contraseña incorrectos. Intente de nuevo.';
    }
  }
}