import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase.config';
// 1. IMPORTA EL COMPONENTE DE REPORTES
import { ReportesComponent } from '../../reportes/reportes';

@Component({
  selector: 'app-registro',
  standalone: true,
  // 2. AÑADE REPORTESCOMPONENT A LOS IMPORTS
  imports: [CommonModule, RouterLink, FormsModule, ReportesComponent],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent implements OnInit {
  // Campos del formulario
  nuevoNombre: string = '';
  nuevoGrupo: string = 'EXPLORADORES'; 
  nuevaPatrulla: string = 'SIN PATRULLA';
  nuevaIdentidad: string = '';
  nuevoTelefono: string = '';
  nuevoTipoSangre: string = 'O+';
  nuevoNombrePadres: string = '';
  nuevoTelefonoPadres: string = '';
  nuevoInscrito: boolean = false;
  
  muchachoEnEdicion: any = null; 
  textoBoton: string = 'Registrar Muchacho';

  coleccionGrupo: string = 'exploradores_lista'; 
  muchachos: any[] = []; // Renombrado a 'muchachos' para que coincida con tu HTML
  private db: any;

  constructor(private cdr: ChangeDetectorRef, private router: Router, private route: ActivatedRoute) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(app);
  }

  ngOnInit() {
    this.detectarGrupoYColeccion();
    this.obtenerMuchachos();
  }

  detectarGrupoYColeccion() {
    const urlActual = this.router.url;
    if (urlActual.includes('navegantes')) {
      this.nuevoGrupo = 'NAVEGANTES'; this.coleccionGrupo = 'navegantes_lista';
    } else if (urlActual.includes('pioneros')) {
      this.nuevoGrupo = 'PIONEROS'; this.coleccionGrupo = 'pioneros_lista';
    } else if (urlActual.includes('seguidores')) {
      this.nuevoGrupo = 'SEGUIDORES'; this.coleccionGrupo = 'seguidores_lista';
    } else {
      this.nuevoGrupo = 'EXPLORADORES'; this.coleccionGrupo = 'exploradores_lista';
    }
  }

  async obtenerMuchachos() {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.coleccionGrupo));
      this.muchachos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error al obtener:", e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  editarMuchacho(m: any) { // Cambiado nombre para coincidir con el HTML anterior
    this.muchachoEnEdicion = m;
    this.nuevoNombre = m.nombre || '';
    this.nuevaIdentidad = m.identidad || '';
    this.nuevoTelefono = m.telefono || '';
    this.nuevoTipoSangre = m.tipoSangre || 'O+';
    this.nuevoNombrePadres = m.nombrePadres || '';
    this.nuevoTelefonoPadres = m.telefonoPadres || '';
    this.nuevoInscrito = !!m.inscrito;
    this.nuevaPatrulla = m.patrulla || 'SIN PATRULLA';
    this.textoBoton = 'Actualizar Muchacho';
  }

  async registrarMuchacho() {
    if (!this.nuevoNombre.trim()) return alert("El nombre es requerido");

    try {
      const datosMuchacho = {
        nombre: this.nuevoNombre,
        grupo: this.nuevoGrupo,
        patrulla: this.nuevaPatrulla,
        identidad: this.nuevaIdentidad || '',
        telefono: this.nuevoTelefono || '',
        tipoSangre: this.nuevoTipoSangre || 'O+',
        nombrePadres: this.nuevoNombrePadres || '',
        telefonoPadres: this.nuevoTelefonoPadres || '',
        inscrito: !!this.nuevoInscrito
      };

      if (this.muchachoEnEdicion) {
        const docRef = doc(this.db, this.coleccionGrupo, this.muchachoEnEdicion.id);
        await updateDoc(docRef, datosMuchacho);
      } else {
        await addDoc(collection(this.db, this.coleccionGrupo), datosMuchacho);
      }
      
      this.limpiarFormulario();
      this.obtenerMuchachos(); // Recarga la lista
      alert("Operación realizada con éxito");
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  }

  limpiarFormulario() {
    this.muchachoEnEdicion = null;
    this.textoBoton = 'Registrar Muchacho';
    this.nuevoNombre = '';
    this.nuevoInscrito = false;
    // ... resto de limpiezas si es necesario
  }

  async borrarMuchacho(id: string) {
    if (confirm("¿Eliminar este registro?")) {
      await deleteDoc(doc(this.db, this.coleccionGrupo, id));
      this.obtenerMuchachos();
    }
  }
}