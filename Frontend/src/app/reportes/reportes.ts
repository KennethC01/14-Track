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
    if (url.includes('navegantes')) this.grupoActual = 'NAVEGANTES';
    else if (url.includes('pioneros')) this.grupoActual = 'PIONEROS';
    else if (url.includes('seguidores')) this.grupoActual = 'SEGUIDORES';
    else this.grupoActual = 'EXPLORADORES';
  }

  async cargarDatos() {
  try {
    const coleccionNombre = this.grupoActual.toLowerCase() + '_lista';
    console.log("Buscando colección:", coleccionNombre); // Verifica esto en la consola del navegador (F12)
    
    const snapshot = await getDocs(collection(this.db, coleccionNombre));
    
    // Si la estructura en Firebase tiene un campo 'inscrito' (booleano o string)
    const lista = snapshot.docs.map(doc => doc.data());
    
    this.totalMuchachos = lista.length;
    // Ajusta la condición según tu base de datos (ej: si el campo es string 'si', cámbialo)
    this.inscritos = lista.filter((m: any) => m.inscrito === true || m.inscrito === 'si').length;
    this.pendientes = this.totalMuchachos - this.inscritos;
    this.porcentajeInscripcion = this.totalMuchachos > 0 ? (this.inscritos / this.totalMuchachos) * 100 : 0;
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}
}
