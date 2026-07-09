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
    // 1. Usamos fetch con respuesta tipo 'arrayBuffer'
    const response = await fetch('/plantilla_ascenso.xlsx');
    
    if (!response.ok) {
      throw new Error(`Error al descargar la plantilla: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // 2. Leemos el binario directamente (type: 'array')
    const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];

    // 3. (El resto de tu lógica de mapeo se mantiene igual)
    const todasLasColumnas = [
      ...this.premiosDestreza, 
      ...this.liderazgoColumnas, 
      ...this.estudiosBiblicos
    ];
    
    let filaInicio = 5; 

    this.muchachos.forEach((m, index) => {
      const filaActual = filaInicio + index;
      XLSX.utils.sheet_add_aoa(ws, [[m.nombre]], { origin: `A${filaActual}` });
      
      todasLasColumnas.forEach((col, colIndex) => {
        const valor = m.ascenso[col.id] ? 'X' : '';
        const celdaRef = XLSX.utils.encode_cell({ r: filaActual - 1, c: colIndex + 1 });
        XLSX.utils.sheet_add_aoa(ws, [[valor]], { origin: celdaRef });
      });
    });

    XLSX.writeFile(wb, `Ascenso_${this.grupoActual}.xlsx`);
    
  } catch (error) {
    console.error("❌ Error al exportar con plantilla:", error);
    alert("No se pudo cargar o procesar la plantilla. Verifica que esté en /public/plantilla_ascenso.xlsx");
  }
}
}
