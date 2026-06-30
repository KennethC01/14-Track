import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase.config'; // 👈 CORREGIDO: Ruta corregida (dos niveles arriba)

@Component({
  selector: 'app-ascenso',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ascenso.html',    
  styleUrl: './ascenso.css'
})
export class AscensoComponent implements OnInit {
  grupoActual: string = 'EXPLORADORES';
  coleccionGrupo: string = 'exploradores_lista';
  muchachos: any[] = [];
  
  premiosDestreza: any[] = [];
  liderazgoColumnas: any[] = [];

  private db: any;

  constructor(private cdr: ChangeDetectorRef, private router: Router) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(app);
  }

  ngOnInit() {
    this.detectarGrupoYColeccion();
    this.configurarColumnasPorGrupo();
    this.obtenerMuchachosAscenso();
  }

  detectarGrupoYColeccion() {
    const urlActual = this.router.url;
    if (urlActual.includes('navegantes')) {
      this.grupoActual = 'NAVEGANTES';
      this.coleccionGrupo = 'navegantes_lista';
    } else if (urlActual.includes('pioneros')) {
      this.grupoActual = 'PIONEROS';
      this.coleccionGrupo = 'pioneros_lista';
    } else if (urlActual.includes('seguidores')) {
      this.grupoActual = 'SEGUIDORES';
      this.coleccionGrupo = 'seguidores_lista';
    } else {
      this.grupoActual = 'EXPLORADORES';
      this.coleccionGrupo = 'exploradores_lista';
    }
  }

  configurarColumnasPorGrupo() {
    if (this.grupoActual === 'NAVEGANTES') {
      this.premiosDestreza = [
        { id: 'ruta_promesa', label: 'Ruta de la Promesa' },
        { id: 'parche_timon', label: 'Parche del Timón' },
        { id: 'parche_ancla', label: 'Parche del Ancla' },
        { id: 'esp_nautica_1', label: 'Marinería Básica' }
      ];
      this.liderazgoColumnas = [
        { id: 'grumete', label: 'Grumete' },
        { id: 'marinero', label: 'Marinero' },
        { id: 'suboficial', label: 'Suboficial' }
      ];
    } 
    else if (this.grupoActual === 'PIONEROS') {
      this.premiosDestreza = [
        { id: 'herramientas', label: 'Herramientas de Campo' },
        { id: 'brujula', label: 'Uso de Brújula' },
        { id: 'campamento_base', label: 'Campamento Base' },
        { id: 'supervivencia', label: 'Supervivencia Básica' }
      ];
      this.liderazgoColumnas = [
        { id: 'pionero_verde', label: 'Senda Verde' },
        { id: 'pionero_azul', label: 'Senda Azul' },
        { id: 'pionero_roja', label: 'Senda Roja' }
      ];
    } 
    else if (this.grupoActual === 'SEGUIDORES') {
      this.premiosDestreza = [
        { id: 'analisis_biblico', label: 'Análisis Bíblico' },
        { id: 'meritos_oro', label: 'Méritos de Oro' },
        { id: 'servicio_comunitario', label: 'Servicio Comunitario' },
        { id: 'academia_lideres', label: 'Academia de Líderes' }
      ];
      this.liderazgoColumnas = [
        { id: 'guia_mayor', label: 'Guía Mayor' },
        { id: 'lider_mariscal', label: 'Líder Mariscal' }
      ];
    } 
    else {
      this.premiosDestreza = [
        { id: 'fundamentales', label: 'Habilidades Fundamentales' },
        { id: 'ciudadania', label: 'Ciudadanía' },
        { id: 'presupuestos', label: 'Presupuestos y Finanzas' },
        { id: 'electricidad', label: 'Electricidad' },
        { id: 'kayak', label: 'Navegando en Kayak' }
      ];
      this.liderazgoColumnas = [
        { id: 'Liderazgo201', label: 'LIDERAZGO 201' },
        { id: 'Liderazgo202', label: 'LIDERAZGO 202' },
        { id: 'Liderazgo203', label: 'LIDERAZGO 203' },
        { id: 'Liderazgo301', label: 'LIDERAZGO 301' }
      ];
    }
  }

  async obtenerMuchachosAscenso() {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.coleccionGrupo));
      this.muchachos = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        this.muchachos.push({
          id: doc.id,
          nombre: data['nombre'],    // 👈 CORREGIDO: Acceso con corchetes
          patrulla: data['patrulla'],// 👈 CORREGIDO: Acceso con corchetes
          ascenso: data['ascenso'] || {} // 👈 CORREGIDO: Acceso con corchetes
        });
      });

      this.muchachos.sort((a, b) => (a.patrulla || '').localeCompare(b.patrulla || '') || a.nombre.localeCompare(b.nombre));
    } catch (e) {
      console.error("Error al traer muchachos: ", e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async guardarProgreso(muchacho: any) {
    try {
      const docRef = doc(this.db, this.coleccionGrupo, muchacho.id);
      await updateDoc(docRef, {
        ascenso: muchacho.ascenso
      });
      console.log(`Progreso guardado en la nube para ${muchacho.nombre}`);
    } catch (error) {
      console.error("Error actualizando ascenso: ", error);
    }
  }
}