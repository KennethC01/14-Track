import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core'; // <- Agregamos ChangeDetectorRef
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  DocumentData,
  QueryDocumentSnapshot,
  Firestore
} from 'firebase/firestore';

@Component({
  selector: 'app-ascenso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ascenso.html',
  styleUrls: ['./ascenso.css']
})
export class AscensoComponent implements OnInit {
  grupoActual: string = 'EXPLORADORES'; 
  menuAbierto: boolean = false;
  cargando: boolean = false;

  muchachos: any[] = []; 
  premiosDestreza: any[] = [];
  liderazgoColumnas: any[] = [];
  estudiosBiblicos: any[] = [];

  private firestore!: Firestore;

  // Inyectamos el detector de cambios en el constructor
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.inicializarConexionFirebase();
    }
  }

  private inicializarConexionFirebase() {
    try {
      if (getApps().length > 0) {
        this.firestore = getFirestore(getApp());
        this.cargarMuchachosDesdeFirebase();
      } else {
        setTimeout(() => {
          if (getApps().length > 0) {
            this.firestore = getFirestore(getApp());
            this.cargarMuchachosDesdeFirebase();
          }
        }, 150);
      }
    } catch (error) {
      console.error("❌ Error al obtener el puente de Firestore:", error);
    }
  }

  async cargarMuchachosDesdeFirebase() {
    if (!this.firestore) return;
    
    try {
      const muchachosRef = collection(this.firestore, 'exploradores_lista');
      const querySnapshot = await getDocs(muchachosRef);
      
      const listaTemporal = querySnapshot.docs.map((documento: QueryDocumentSnapshot<DocumentData>) => {
        const datos = documento.data();
        return {
          id: documento.id,
          nombre: datos['nombre'], 
          grupoDb: datos['grupo'],
          ascenso: datos['ascenso'] || {} 
        };
      });

      // Filtramos
      this.muchachos = listaTemporal.filter(m => {
        return m.grupoDb?.toString().trim().toUpperCase() === this.grupoActual.toUpperCase();
      });

      // Reconstruimos las columnas
      const destrezaSet = new Set<string>();
      const liderazgoSet = new Set<string>();
      const biblicoSet = new Set<string>();

      this.muchachos.forEach(muchacho => {
        if (muchacho.ascenso) {
          Object.keys(muchacho.ascenso).forEach(parcheId => {
            if (
              parcheId.startsWith('destreza_') || 
              parcheId.includes('_6792') || 
              parcheId.includes('_4808') || 
              parcheId.includes('_0968')
            ) {
              destrezaSet.add(parcheId);
            } else if (parcheId.startsWith('liderazgo_')) {
              liderazgoSet.add(parcheId);
            } else {
              biblicoSet.add(parcheId);
            }
          });
        }
      });

      this.premiosDestreza = Array.from(destrezaSet).map(id => ({
        id,
        label: id.split('_')[0].toUpperCase()
      }));

      this.liderazgoColumnas = Array.from(liderazgoSet).map(id => ({
        id,
        label: id.split('_')[0].toUpperCase()
      }));

      this.estudiosBiblicos = Array.from(biblicoSet).map(id => ({
        id,
        label: id.split('_')[0].toUpperCase()
      }));

      // 🔥 ¡ESTA ES LA MAGIA! Le decimos a Angular que pinte los cambios YA mismo
      this.cdr.detectChanges();

    } catch (error) {
      console.error('❌ ERROR CRÍTICO DE FIRESTORE:', error);
    }
  }

  async guardarCambiosEnBaseDatos() {
    if (!this.firestore) return;
    if (this.muchachos.length === 0) {
      alert('No hay muchachos en la lista para guardar.');
      return;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    try {
      for (const muchacho of this.muchachos) {
        const muchachoDocRef = doc(this.firestore, 'exploradores_lista', muchacho.id);
        
        // Creamos un clon limpio para enviar a Firebase sin la propiedad local grupoDb
        const { grupoDb, ...datosAEnviar } = muchacho;

        await setDoc(muchachoDocRef, {
          ascenso: datosAEnviar.ascenso,
          ultimaActualizacionAscenso: new Date()
        }, { merge: true });
      }
      alert('¡Progreso de ascenso guardado exitosamente en Firebase!');
    } catch (error) {
      console.error('❌ Error al persistir cambios en la nube:', error);
      alert('Hubo un error al intentar guardar los cambios en la nube.');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  agregarColumna(tipo: string) {
    const nombreParche = prompt(`Introduce el nombre del nuevo ${tipo}:`);
    if (!nombreParche) return;

    const idNuevo = `${tipo.toLowerCase()}_${Date.now()}`;
    const nuevaCol = { id: idNuevo, label: nombreParche.toUpperCase() };

    if (tipo === 'destreza') this.premiosDestreza.push(nuevaCol);
    if (tipo === 'liderazgo') this.liderazgoColumnas.push(nuevaCol);
    if (tipo === 'biblico') this.estudiosBiblicos.push(nuevaCol);
    
    this.cdr.detectChanges();
  }

  eliminarColumna(id: string, tipo: string, label: string) {
    if (!confirm(`¿Seguro que deseas eliminar la columna "${label}"?`)) return;

    if (tipo === 'destreza') this.premiosDestreza = this.premiosDestreza.filter(c => c.id !== id);
    if (tipo === 'liderazgo') this.liderazgoColumnas = this.liderazgoColumnas.filter(c => c.id !== id);
    if (tipo === 'biblico') this.estudiosBiblicos = this.estudiosBiblicos.filter(c => c.id !== id);
    
    this.cdr.detectChanges();
  }
}