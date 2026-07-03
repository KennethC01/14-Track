import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
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
  coleccionGrupo: string = 'exploradores_lista';
  muchachos: any[] = [];
  private db: any;

  // Propiedades para la vista
  fechaReunion: string = '';
  conteoAsistencia: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router
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
      const querySnapshot = await getDocs(collection(this.db, this.coleccionGrupo));
      
      // Recuperar estado previo del localStorage para que no se borre al recargar
      const storageKey = 'asistencia_temporal_' + this.coleccionGrupo;
      const guardadoLocal = localStorage.getItem(storageKey);
      const estadosPrevios = guardadoLocal ? JSON.parse(guardadoLocal) : {};

      this.muchachos = [];
      querySnapshot.forEach((doc) => {
        this.muchachos.push({ 
          id: doc.id, 
          ...doc.data(), 
          asistio: estadosPrevios[doc.id] || false 
        });
      });

      this.actualizarConteo(); 

      this.muchachos.sort((a, b) => 
        (a.patrulla || '').localeCompare(b.patrulla || '') || a.nombre.localeCompare(b.nombre)
      );
    } catch (e) {
      console.error("Error al obtener muchachos:", e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  actualizarConteo() {
    this.conteoAsistencia = this.muchachos.filter(m => m.asistio).length;
    
    // Persistencia: Guardar el estado de los checks en localStorage
    const estadoActual: any = {};
    this.muchachos.forEach(m => estadoActual[m.id] = m.asistio);
    localStorage.setItem('asistencia_temporal_' + this.coleccionGrupo, JSON.stringify(estadoActual));
  }

  async guardarAsistencia() {
    if (!this.fechaReunion) {
      alert("Por favor, selecciona una fecha antes de guardar.");
      return;
    }

    try {
      const asistieron = this.muchachos.filter(m => m.asistio);
      
      // Guardado dinámico en colecciones separadas: ej: asistencia_exploradores
      const nombreColeccion = `asistencia_${this.grupoActual.toLowerCase()}`;
      
      await addDoc(collection(this.db, nombreColeccion), {
        fecha: this.fechaReunion,
        totalAsistentes: this.conteoAsistencia,
        listaAsistentes: asistieron.map(m => ({ nombre: m.nombre, id: m.id }))
      });

      // Limpiar persistencia temporal tras guardar con éxito
      localStorage.removeItem('asistencia_temporal_' + this.coleccionGrupo);
      
      alert(`Asistencia guardada correctamente en ${this.grupoActual}. Total: ${this.conteoAsistencia}`);
      
      // Resetear formulario
      this.fechaReunion = '';
      this.obtenerMuchachosParaAsistencia(); 
      
    } catch (e) {
      console.error("Error al guardar la asistencia:", e);
      alert("Hubo un error al guardar en la base de datos.");
    }
  }
}