import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

// Librería para exportación profesional a .xlsx
import * as XLSX from 'xlsx';

import { getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  getDoc,
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
  grupoActual: string = ''; 
  menuAbierto: boolean = false;
  cargando: boolean = false;

  muchachos: any[] = []; 
  premiosDestreza: any[] = [];
  liderazgoColumnas: any[] = [];
  estudiosBiblicos: any[] = [];

  private firestore!: Firestore;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.grupoActual = params['grupo']?.toUpperCase() || 'EXPLORADORES';
      if (isPlatformBrowser(this.platformId)) {
        this.inicializarConexionFirebase();
      }
    });
  }

  private inicializarConexionFirebase() {
    try {
      if (getApps().length > 0) {
        this.firestore = getFirestore(getApp());
        this.cargarDatos();
      }
    } catch (error) {
      console.error("❌ Error al inicializar Firebase:", error);
    }
  }

  async cargarDatos() {
    if (!this.firestore) return;
    
    try {
      const configRef = doc(this.firestore, 'configuracion_columnas', this.grupoActual.toUpperCase());
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        const data = configSnap.data();
        this.premiosDestreza = data['premiosDestreza'] || [];
        this.liderazgoColumnas = data['liderazgoColumnas'] || [];
        this.estudiosBiblicos = data['estudiosBiblicos'] || [];
      }

      const nombreColeccion = `${this.grupoActual.toLowerCase()}_lista`;
      const muchachosRef = collection(this.firestore, nombreColeccion);
      const querySnapshot = await getDocs(muchachosRef);
      
      this.muchachos = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const datos = doc.data();
        return {
          id: doc.id,
          nombre: datos['nombre'],
          ascenso: datos['ascenso'] || {} 
        };
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    }
  }

  async guardarConfiguracionColumnas() {
    const configRef = doc(this.firestore, 'configuracion_columnas', this.grupoActual.toUpperCase());
    await setDoc(configRef, {
      premiosDestreza: this.premiosDestreza,
      liderazgoColumnas: this.liderazgoColumnas,
      estudiosBiblicos: this.estudiosBiblicos
    }, { merge: true });
  }

  async guardarCambiosEnBaseDatos() {
    if (!this.firestore) return;
    this.cargando = true;
    const nombreColeccion = `${this.grupoActual.toLowerCase()}_lista`;

    try {
      for (const muchacho of this.muchachos) {
        const docRef = doc(this.firestore, nombreColeccion, muchacho.id);
        await setDoc(docRef, { 
          ascenso: muchacho.ascenso,
          ultimaActualizacion: new Date() 
        }, { merge: true });
      }
      alert(`Progreso de ${this.grupoActual} guardado exitosamente.`);
    } catch (error) {
      console.error(error);
      alert('Error al guardar en la base de datos.');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async exportarAExcel() {
    if (this.muchachos.length === 0) return;

    try {
      // 1. Cargar la plantilla desde assets
      const response = await fetch('/assets/plantilla_ascenso.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      
      // 2. Leer la plantilla
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]]; // Usamos la primera hoja

      // 3. Preparar los datos
      const todasLasColumnas = [
        ...this.premiosDestreza, 
        ...this.liderazgoColumnas, 
        ...this.estudiosBiblicos
      ];
      
      // Fila donde empiezan los nombres (Ajusta este número si tu plantilla empieza distinto)
      let filaInicio = 5; 

      // 4. Inyectar datos en la plantilla
      this.muchachos.forEach((m, index) => {
        const filaActual = filaInicio + index;
        
        // Escribir nombre en la columna A
        XLSX.utils.sheet_add_aoa(ws, [[m.nombre]], { origin: `A${filaActual}` });
        
        // Escribir las marcas en las columnas siguientes (B, C, D...)
        todasLasColumnas.forEach((col, colIndex) => {
          const valor = m.ascenso[col.id] ? 'X' : '';
          const celdaRef = XLSX.utils.encode_cell({ r: filaActual - 1, c: colIndex + 1 });
          XLSX.utils.sheet_add_aoa(ws, [[valor]], { origin: celdaRef });
        });
      });

      // 5. Descargar el archivo
      XLSX.writeFile(wb, `Ascenso_${this.grupoActual}_${new Date().toLocaleDateString()}.xlsx`);
      
    } catch (error) {
      console.error("❌ Error al exportar con plantilla:", error);
      alert("No se pudo cargar la plantilla. Verifica que el archivo '/assets/plantilla_ascenso.xlsx' exista.");
    }
  }
  
  async agregarColumna(tipo: string) {
    const nombre = prompt(`Nombre del nuevo ${tipo}:`);
    if (!nombre) return;

    const nuevaCol = { id: `${tipo}_${Date.now()}`, label: nombre.toUpperCase() };

    if (tipo === 'destreza') this.premiosDestreza.push(nuevaCol);
    if (tipo === 'liderazgo') this.liderazgoColumnas.push(nuevaCol);
    if (tipo === 'biblico') this.estudiosBiblicos.push(nuevaCol);

    await this.guardarConfiguracionColumnas();
    this.cdr.detectChanges();
  }

  async eliminarColumna(id: string, tipo: string, label: string) {
    if (!confirm(`¿Eliminar la columna "${label}"?`)) return;

    if (tipo === 'destreza') this.premiosDestreza = this.premiosDestreza.filter(c => c.id !== id);
    if (tipo === 'liderazgo') this.liderazgoColumnas = this.liderazgoColumnas.filter(c => c.id !== id);
    if (tipo === 'biblico') this.estudiosBiblicos = this.estudiosBiblicos.filter(c => c.id !== id);

    await this.guardarConfiguracionColumnas();
    this.cdr.detectChanges();
  }
}