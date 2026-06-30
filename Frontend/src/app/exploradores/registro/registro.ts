import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  nuevoGrupo: string = 'EXPLORADORES'; // <-- Nuevo valor inicial
  nuevaPatrulla: string = 'ÁGUILAS';
  nuevoAvatar: string = 'boys/default.png';
  
  muchachos: any[] = [];
  private db: any;

  constructor(private cdr: ChangeDetectorRef) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(app);
  }

  ngOnInit() {
    this.obtenerMuchachos();
  }

  async obtenerMuchachos() {
    try {
      const querySnapshot = await getDocs(collection(this.db, "exploradores_lista"));
      this.muchachos = [];
      querySnapshot.forEach((doc) => {
        this.muchachos.push({ id: doc.id, ...doc.data() });
      });
      // Ordenar por grupo y luego por nombre
      this.muchachos.sort((a, b) => (a.grupo || '').localeCompare(b.grupo || '') || a.nombre.localeCompare(b.nombre));
    } catch (e) {
      console.error(e);
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
        grupo: this.nuevoGrupo, // <-- Guardando el grupo seleccionado
        patrulla: this.nuevaPatrulla,
        avatar: this.nuevoAvatar
      };

      await addDoc(collection(this.db, "exploradores_lista"), nuevoExplorador);
      this.nuevoNombre = ''; 
      alert("¡Muchacho registrado con éxito en la base de datos!");
      this.obtenerMuchachos(); 
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  }

  async eliminarMuchacho(id: string) {
    if (confirm("¿Seguro que deseas eliminar este registro?")) {
      await deleteDoc(doc(this.db, "exploradores_lista", id));
      this.obtenerMuchachos();
    }
  }
}