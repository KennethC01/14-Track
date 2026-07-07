import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent implements OnInit, OnDestroy {
  grupoActual: string = '';
  
  // Métricas
  totalMuchachos: number = 0;
  inscritos: number = 0;
  pendientes: number = 0;
  porcentajeInscripcion: number = 0;
  
  // Lista para la tabla
  listaMuchachos: any[] = [];
  totalReuniones: number = 10; 

  private db: any;
  private unsubscribe: Unsubscribe | null = null; // Para limpiar la suscripción

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(app);
  }

  ngOnInit() {
    this.detectarGrupo();
    this.iniciarSuscripcion();
  }

  // Se ejecuta al salir del componente para evitar fugas de memoria
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  detectarGrupo() {
    const url = this.router.url;
    const gruposValidos = ['exploradores', 'navegantes', 'pioneros', 'seguidores'];
    const partes = url.split('/');
    const encontrado = partes.find(p => gruposValidos.includes(p.toLowerCase()));
    this.grupoActual = encontrado || 'exploradores';
  }

  iniciarSuscripcion() {
    const base = this.grupoActual.toLowerCase();
    const coleccionRef = collection(this.db, `${base}_lista`);

    this.unsubscribe = onSnapshot(coleccionRef, (snapshot) => {
      this.listaMuchachos = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // --- AGREGA ESTO PARA DEPURAR ---
        console.log("Datos de", data['nombre'], ":", data);
        // --------------------------------
        
        return {
          id: doc.id,
          nombre: data['nombre'] || 'Sin nombre',
          // Asegúrate de que estos nombres coincidan EXACTAMENTE con los de tu BD
          asistencia: data['asistencia'] || 0, 
          nivelAscenso: data['nivel'] || 'Iniciado',
          porcentajeAscenso: data['progreso'] || 0,
          estado: data['inscrito'] === true ? 'inscrito' : 'pendiente'
        };
      });

      this.totalMuchachos = this.listaMuchachos.length;
      this.inscritos = this.listaMuchachos.filter(m => m.estado === 'inscrito').length;
      this.pendientes = this.totalMuchachos - this.inscritos;
      this.porcentajeInscripcion = this.totalMuchachos > 0 ? (this.inscritos / this.totalMuchachos) * 100 : 0;

      this.cdr.detectChanges();
    });
  }