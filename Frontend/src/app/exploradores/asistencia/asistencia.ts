import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; // <-- Asegúrate de importar Router
import { FormsModule } from '@angular/forms';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore'; // Ajusta según tus imports de Firebase
import { firebaseConfig } from '../../firebase.config';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css'
})
export class AsistenciaComponent implements OnInit {
  grupoActual: string = 'EXPLORADORES';
  coleccionGrupo: string = 'exploradores_lista'; // <-- Colección de donde leerá los muchachos
  muchachos: any[] = [];
  private db: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router // <-- Inyectamos el Router
  ) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(app);
  }

  ngOnInit() {
    this.detectarGrupoYColeccion();
    this.obtenerMuchachosParaAsistencia();
  }

  detectarGrupoYColeccion() {
    const urlActual = this.router.url;
    
    // Configuramos dinámicamente el grupo y la colección raíz según la URL activa
    if (urlActual.includes('navegantes')) {
      this.grupoActual = 'NAVEGANTES';
      this.coleccionGrupo = 'navegantes_lista';
    } else if (urlActual.includes('pioneros')) {
      this.grupoActual = 'PIONEROS';
      this.coleccionGrupo = 'pioneros_lista';
    } else if (urlActual.includes('seguidores')) {
      this.grupoActual = 'SEGUIDORES';
      this.coleccionGrupo = 'seguidores_lista';
    } else {
      this.grupoActual = 'EXPLORADORES';
      this.coleccionGrupo = 'exploradores_lista';
    }
  }

  async obtenerMuchachosParaAsistencia() {
    try {
      // Lee directamente de la colección del grupo en el que estás navegando
      const querySnapshot = await getDocs(collection(this.db, this.coleccionGrupo));
      this.muchachos = [];
      
      querySnapshot.forEach((doc) => {
        // Estructura los muchachos agregando una propiedad por defecto para el check de asistencia si lo usas
        this.muchachos.push({ id: doc.id, ...doc.data(), asistio: false });
      });

      // Ordenar por patrulla y luego por nombre
      this.muchachos.sort((a, b) => 
        (a.patrulla || '').localeCompare(b.patrulla || '') || a.nombre.localeCompare(b.nombre)
      );

    } catch (e) {
      console.error("Error al obtener muchachos para asistencia:", e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  // Si guardas el historial de asistencia en otra colección (ej: asistencia_historial)
  async guardarAsistencia() {
    // Tu lógica actual para guardar la asistencia...
    // Puedes usar la variable `this.grupoActual` o `this.coleccionGrupo` si necesitas etiquetar el reporte.
  }
}