import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // <-- Importante para el botón de volver

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, RouterLink], // <-- Lo agregamos aquí
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css'
})
export class AsistenciaComponent {
  // Aquí más adelante traeremos los muchachos desde Firebase Firestore!
}