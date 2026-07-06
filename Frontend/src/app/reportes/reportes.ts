import { Component, OnInit } from '@angular/core';
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
    // Buscamos si la URL contiene el nombre del grupo
    if (url.includes('navegantes')) this.grupoActual = 'navegantes';
    else if (url.includes('pioneros')) this.grupoActual = 'pioneros';
    else if (url.includes('seguidores')) this.grupoActual = 'seguidores';
    else this.grupoActual = 'exploradores';
  }

  async cargarDatos() {
    const coleccionNombre = this.grupoActual + '_lista';
    const snapshot = await getDocs(collection(this.db, coleccionNombre));
    const lista = snapshot.docs.map(doc => doc.data());
    
    this.totalMuchachos = lista.length;
    // Ajusta 'inscrito' según el nombre exacto de tu campo en Firebase (¿es booleano o string?)
    this.inscritos = lista.filter((m: any) => m.inscrito === true || m.inscrito === 'si').length;
    this.pendientes = this.totalMuchachos - this.inscritos;
    this.porcentajeInscripcion = this.totalMuchachos > 0 ? (this.inscritos / this.totalMuchachos) * 100 : 0;
  }
}
