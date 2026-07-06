import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase.config';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent implements OnInit {
  grupoActual: string = '';
  totalMuchachos: number = 0;
  inscritos: number = 0;
  pendientes: number = 0;
  porcentajeInscripcion: number = 0;
  private db: any;

  constructor(private router: Router) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(app);
  }

  async ngOnInit() {
    this.detectarGrupo();
    await this.cargarDatos();
  }

  detectarGrupo() {
    const url = this.router.url;
    if (url.includes('navegantes')) this.grupoActual = 'NAVEGANTES';
    else if (url.includes('pioneros')) this.grupoActual = 'PIONEROS';
    else if (url.includes('seguidores')) this.grupoActual = 'SEGUIDORES';
    else this.grupoActual = 'EXPLORADORES';
  }

  async cargarDatos() {
    const coleccion = this.grupoActual.toLowerCase() + '_lista';
    const snapshot = await getDocs(collection(this.db, coleccion));
    const lista = snapshot.docs.map(doc => doc.data());
    
    this.totalMuchachos = lista.length;
    this.inscritos = lista.filter((m: any) => m.inscrito === true).length;
    this.pendientes = this.totalMuchachos - this.inscritos;
    this.porcentajeInscripcion = this.totalMuchachos > 0 ? (this.inscritos / this.totalMuchachos) * 100 : 0;
  }
}