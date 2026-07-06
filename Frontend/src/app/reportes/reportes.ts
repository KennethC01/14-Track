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
    const partes = url.split('/');
    this.grupoActual = partes[1] || 'exploradores';
    console.log("Grupo detectado:", this.grupoActual);
  }

  async cargarDatos() {
    try {
      const coleccionNombre = this.grupoActual.toLowerCase() + '_lista';
      console.log("Intentando conectar a:", coleccionNombre);
      
      const snapshot = await getDocs(collection(this.db, coleccionNombre));
      const lista = snapshot.docs.map(doc => doc.data());
      
      console.log("Datos crudos de Firebase:", lista); // REVISA ESTO EN LA CONSOLA
      
      this.totalMuchachos = lista.length;
      
      // AJUSTA ESTA LÍNEA SEGÚN EL NOMBRE DEL CAMPO EN TU BASE DE DATOS
      // Si tu campo en Firebase se llama 'inscrito', asegúrate de que sea ese nombre exacto
      this.inscritos = lista.filter((m: any) => m.inscrito === true || m.inscrito === 'si' || m.inscrito === 'SÍ').length;
      
      this.pendientes = this.totalMuchachos - this.inscritos;
      this.porcentajeInscripcion = this.totalMuchachos > 0 ? (this.inscritos / this.totalMuchachos) * 100 : 0;
      
    } catch (error) {
      console.error("ERROR CRÍTICO AL LEER FIRESTORE:", error);
    }
  }
}