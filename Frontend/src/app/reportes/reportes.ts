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
  totalReuniones: number = 10; // Ajusta según tu necesidad

  private db: any;
  private unsubscribeLista: Unsubscribe | null = null;
  private unsubscribeAsis: Unsubscribe | null = null;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(app);
  }

  ngOnInit() {
    this.detectarGrupo();
    this.iniciarSuscripciones();
  }

  ngOnDestroy() {
    if (this.unsubscribeLista) this.unsubscribeLista();
    if (this.unsubscribeAsis) this.unsubscribeAsis();
  }

  detectarGrupo() {
    const url = this.router.url;
    const gruposValidos = ['exploradores', 'navegantes', 'pioneros', 'seguidores'];
    const partes = url.split('/');
    const encontrado = partes.find(p => gruposValidos.includes(p.toLowerCase()));
    this.grupoActual = encontrado || 'exploradores';
  }

 iniciarSuscripciones() {
    const base = this.grupoActual.toLowerCase();
    const refLista = collection(this.db, `${base}_lista`);
    const refAsistencia = collection(this.db, `asistencia_${base}`);

    let cacheLista: any[] = [];
    let cacheAsistencia: any[] = []; // Guardaremos todos los documentos de asistencia aquí

    const actualizarVista = () => {
      this.listaMuchachos = cacheLista.map(doc => {
        const data = doc.data();
        const infoAscenso = data['ascenso'] || {};
        const clavesCompletadas = Object.values(infoAscenso).filter(val => val === true).length;

        // CONTAR ASISTENCIAS: 
        // Filtramos cuántas veces aparece el id del muchacho en la lista de todos los días
        let asistenciasContadas = 0;
        cacheAsistencia.forEach(asisDoc => {
          const lista = asisDoc.data()['listaAsistentes'] || [];
          if (lista.some((m: any) => m.id === doc.id)) {
            asistenciasContadas++;
          }
        });

        return {
          id: doc.id,
          nombre: data['nombre'] || 'Sin nombre',
          asistencia: asistenciasContadas, 
          nivelAscenso: clavesCompletadas >= 3 ? 'Avanzado' : 'En proceso',
          porcentajeAscenso: (clavesCompletadas / 3) * 100,
          estado: data['inscrito'] === true ? 'inscrito' : 'pendiente'
        };
      });

      this.totalMuchachos = this.listaMuchachos.length;
      this.inscritos = this.listaMuchachos.filter(m => m.estado === 'inscrito').length;
      this.pendientes = this.totalMuchachos - this.inscritos;
      this.porcentajeInscripcion = this.totalMuchachos > 0 ? (this.inscritos / this.totalMuchachos) * 100 : 0;
      this.cdr.detectChanges();
    };

    this.unsubscribeLista = onSnapshot(refLista, (snap) => {
      cacheLista = snap.docs;
      actualizarVista();
    });

    this.unsubscribeAsis = onSnapshot(refAsistencia, (snap) => {
      cacheAsistencia = snap.docs;
      actualizarVista();
    });
  }
}
