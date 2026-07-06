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

 // reportes.ts
async cargarDatos() {
  try {
    const coleccionNombre = this.grupoActual.toLowerCase() + '_lista';
    const snapshot = await getDocs(collection(this.db, coleccionNombre));
    
    // Convertimos los documentos a un array de datos
    const lista = snapshot.docs.map(doc => doc.data());
    
    // Actualizamos las variables de clase directamente
    this.totalMuchachos = lista.length;
    
    // Filtramos los inscritos donde la propiedad 'inscrito' sea exactamente true
    this.inscritos = lista.filter((m: any) => m.inscrito === true).length;
    
    this.pendientes = this.totalMuchachos - this.inscritos;
    
    // Calculamos el porcentaje
    this.porcentajeInscripcion = this.totalMuchachos > 0 
      ? (this.inscritos / this.totalMuchachos) * 100 
      : 0;

    console.log("Total:", this.totalMuchachos, "Inscritos:", this.inscritos);
    
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}
}