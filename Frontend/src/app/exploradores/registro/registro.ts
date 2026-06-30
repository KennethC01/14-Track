import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase.config';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent implements OnInit {
  nuevoNombre: string = '';
  nuevoGrupo: string = 'EXPLORADORES'; 
  nuevaPatrulla: string = 'ÁGUILAS';
  nuevoAvatar: string = 'boys/default.png';
  
  // Esta variable definirá la colección correspondiente en Firestore
  coleccionGrupo: string = 'exploradores_lista'; 
  
  muchachosFiltrados: any[] = []; 
  private db: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,          
    private route: ActivatedRoute    
  ) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(app);
  }

  ngOnInit() {
    this.detectarGrupoYColeccion();
    this.obtenerMuchachos();
  }

  detectarGrupoYColeccion() {
    const urlActual = this.router.url;
    
    // Configuramos el nombre del Grupo y el nombre exacto de la Colección en Firestore
    if (urlActual.includes('navegantes')) {
      this.nuevoGrupo = 'NAVEGANTES';
      this.coleccionGrupo = 'navegantes_lista';
    } else if (urlActual.includes('pioneros')) {
      this.nuevoGrupo = 'PIONEROS';
      this.coleccionGrupo = 'pioneros_lista';
    } else if (urlActual.includes('seguidores')) {
      this.nuevoGrupo = 'SEGUIDORES';
      this.coleccionGrupo = 'seguidores_lista';
    } else {
      this.nuevoGrupo = 'EXPLORADORES';
      this.coleccionGrupo = 'exploradores_lista';
    }
  }

  async obtenerMuchachos() {
    try {
      // Ahora lee dinámicamente desde la colección correspondiente al grupo activo
      const querySnapshot = await getDocs(collection(this.db, this.coleccionGrupo));
      this.muchachosFiltrados = [];
      
      querySnapshot.forEach((doc) => {
        this.muchachosFiltrados.push({ id: doc.id, ...doc.data() });
      });

      // Ordenar por patrulla y luego por nombre
      this.muchachosFiltrados.sort((a, b) => 
        (a.patrulla || '').localeCompare(b.patrulla || '') || a.nombre.localeCompare(b.nombre)
      );

    } catch (e) {
      console.error("Error al obtener muchachos:", e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async registrarMuchacho() {
    if (!this.nuevoNombre.trim()) {
      alert("Por favor ingresa un nombre válido.");
      return;
    }

    try {
      const nuevoExplorador = {
        nombre: this.nuevoNombre,
        grupo: this.nuevoGrupo, 
        patrulla: this.nuevaPatrulla,
        avatar: this.nuevoAvatar
      };

      // Se guarda directamente en su propia colección independiente en Firebase
      await addDoc(collection(this.db, this.coleccionGrupo), nuevoExplorador);
      this.nuevoNombre = ''; 
      alert(`¡Muchacho registrado con éxito en la colección: ${this.coleccionGrupo}!`);
      this.obtenerMuchachos(); 
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  }

  async eliminarMuchacho(id: string) {
    if (confirm("¿Seguro que deseas eliminar este registro?")) {
      // Se elimina directamente de su colección correspondiente
      await deleteDoc(doc(this.db, this.coleccionGrupo, id));
      this.obtenerMuchachos();
    }
  }
}