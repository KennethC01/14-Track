import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent implements OnInit {
  grupoActual: string = '';
  
  // Métricas
  totalMuchachos: number = 0;
  inscritos: number = 0;
  pendientes: number = 0;
  porcentajeInscripcion: number = 0;
  progresoAscenso: number = 0;
  promedioAsistencia: number = 0;

  private db: any;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(app);
  }

  async ngOnInit() {
    this.detectarGrupo();
    await this.cargarTodo();
  }

  detectarGrupo() {
    const url = this.router.url;
    const gruposValidos = ['exploradores', 'navegantes', 'pioneros', 'seguidores'];
    const partes = url.split('/');
    
    // Identifica el grupo en la URL
    const encontrado = partes.find(p => gruposValidos.includes(p.toLowerCase()));
    this.grupoActual = encontrado || 'exploradores';
  }

  async cargarTodo() {
    try {
      const base = this.grupoActual.toLowerCase();
      
      // 1. Carga de Inscripción (Colección: grupo_lista)
      const snapInsc = await getDocs(collection(this.db, `${base}_lista`));
      const listaInsc = snapInsc.docs.map(doc => doc.data());
      this.totalMuchachos = listaInsc.length;
      this.inscritos = listaInsc.filter((m: any) => m.inscrito === true).length;
      this.pendientes = this.totalMuchachos - this.inscritos;
      this.porcentajeInscripcion = this.totalMuchachos > 0 ? (this.inscritos / this.totalMuchachos) * 100 : 0;

      // 2. Carga de Ascenso (Colección: grupo_ascenso)
      const snapAsc = await getDocs(collection(this.db, `${base}_ascenso`));
      const listaAsc = snapAsc.docs.map(doc => doc.data());
      const sumaProgreso = listaAsc.reduce((acc, curr) => acc + (curr['progreso'] || 0), 0);
      this.progresoAscenso = listaAsc.length > 0 ? Math.round(sumaProgreso / listaAsc.length) : 0;

      // 3. Carga de Asistencia (Colección: grupo_asistencia)
      const snapAsis = await getDocs(collection(this.db, `${base}_asistencia`));
      const listaAsis = snapAsis.docs.map(doc => doc.data());
      const sumaAsis = listaAsis.reduce((acc, curr) => acc + (curr['porcentaje'] || 0), 0);
      this.promedioAsistencia = listaAsis.length > 0 ? Math.round(sumaAsis / listaAsis.length) : 0;

      // Fuerza la actualización de la vista
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error("Error al cargar reportes para", this.grupoActual, ":", error);
    }
  }
}