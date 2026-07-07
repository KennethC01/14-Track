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
  
  // Métricas para el Dashboard
  totalMuchachos: number = 0;
  inscritos: number = 0;
  pendientes: number = 0;
  porcentajeInscripcion: number = 0;
  
  // Lista para la tabla
  listaMuchachos: any[] = [];
  totalReuniones: number = 10; // Puedes ajustarlo dinámicamente si tienes una colección de reuniones

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
    const encontrado = partes.find(p => gruposValidos.includes(p.toLowerCase()));
    this.grupoActual = encontrado || 'exploradores';
  }

  async cargarTodo() {
    try {
      const base = this.grupoActual.toLowerCase();
      
      // Carga de la lista principal de muchachos
      const snapInsc = await getDocs(collection(this.db, `${base}_lista`));
      
      this.listaMuchachos = snapInsc.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data['nombre'] || 'Sin nombre',
          asistencia: data['asistencia'] || 0,
          nivelAscenso: data['nivel'] || 'Iniciado',
          porcentajeAscenso: data['progreso'] || 0, // Espera un valor de 0 a 100
          estado: data['inscrito'] === true ? 'inscrito' : 'pendiente'
        };
      });

      // Cálculo de métricas basadas en la lista procesada
      this.totalMuchachos = this.listaMuchachos.length;
      this.inscritos = this.listaMuchachos.filter(m => m.estado === 'inscrito').length;
      this.pendientes = this.totalMuchachos - this.inscritos;
      this.porcentajeInscripcion = this.totalMuchachos > 0 
        ? (this.inscritos / this.totalMuchachos) * 100 
        : 0;

      // Notificar al componente que los datos han cambiado
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error("Error al cargar reportes para", this.grupoActual, ":", error);
    }
  }
}