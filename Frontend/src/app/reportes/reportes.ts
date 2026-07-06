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
      const snapshot = await getDocs(collection(this.db, coleccionNombre));
      const lista = snapshot.docs.map(doc => doc.data());
      
      console.log("Datos crudos de Firebase:", lista); 
      
      this.totalMuchachos = lista.length;
      
      // FILTRO INTELIGENTE:
      // Aquí estamos revisando el objeto. 
      // Si el campo se llama 'inscrito', úsalo. Si se llama distinto, cámbialo abajo:
      this.inscritos = lista.filter((m: any) => {
        // Imprime el valor de cada muchacho para identificar el campo
        // console.log("Muchacho:", m); 
        
        // CORRECCIÓN: Ajusta 'inscrito' al nombre real de la propiedad que viste en el Array
        return m.inscrito === true || m.inscrito === 'si' || m.inscrito === 'SÍ';
      }).length;
      
      this.pendientes = this.totalMuchachos - this.inscritos;
      this.porcentajeInscripcion = this.totalMuchachos > 0 ? (this.inscritos / this.totalMuchachos) * 100 : 0;
      
    } catch (error) {
      console.error("ERROR CRÍTICO AL LEER FIRESTORE:", error);
    }
  }
}
