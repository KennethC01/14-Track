import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx'; // Asegúrate de tener instalado 'xlsx'
import { getApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

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
    } catch (error) { console.error("❌ Error Firebase:", error); }
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
      const muchachosRef = collection(this.firestore, `${this.grupoActual.toLowerCase()}_lista`);
      const querySnapshot = await getDocs(muchachosRef);
      this.muchachos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), ascenso: doc.data()['ascenso'] || {} }));
      this.cdr.detectChanges();
    } catch (error) { console.error('❌ Error cargar datos:', error); }
  }

  async guardarCambiosEnBaseDatos() {
    if (!this.firestore) return;
    this.cargando = true;
    const nombreColeccion = `${this.grupoActual.toLowerCase()}_lista`;
    try {
      for (const muchacho of this.muchachos) {
        const docRef = doc(this.firestore, nombreColeccion, muchacho.id);
        await setDoc(docRef, { ascenso: muchacho.ascenso, ultimaActualizacion: new Date() }, { merge: true });
      }
      alert(`Progreso guardado.`);
    } catch (error) { alert('Error al guardar.'); } 
    finally { this.cargando = false; this.cdr.detectChanges(); }
  }

  async exportarAExcel() {
    if (this.muchachos.length === 0) return;
    try {
      const response = await fetch('/Plantilla_ascenso.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      
      // Leer el archivo preservando estilos
      const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', cellStyles: true });
      const ws = wb.Sheets[wb.SheetNames[0]];

      const todasLasColumnas = [...this.premiosDestreza, ...this.liderazgoColumnas, ...this.estudiosBiblicos];
      let filaInicio = 3; 

      this.muchachos.forEach((m, index) => {
        const filaActual = filaInicio + index;
        
        // Escribir nombre en A
        const cellA = ws[XLSX.utils.encode_cell({ r: filaActual - 1, c: 0 })] || { t: 's', v: '' };
        cellA.v = m.nombre;
        ws[XLSX.utils.encode_cell({ r: filaActual - 1, c: 0 })] = cellA;

        // Escribir X en las columnas siguientes
        todasLasColumnas.forEach((col, colIndex) => {
          const valor = m.ascenso[col.id] ? 'X' : '';
          const coord = XLSX.utils.encode_cell({ r: filaActual - 1, c: colIndex + 1 });
          const cell = ws[coord] || { t: 's', v: '' };
          cell.v = valor;
          ws[coord] = cell;
        });
      });

      // Escribir el archivo manteniendo los estilos originales
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ascenso_${this.grupoActual}.xlsx`;
      a.click();
    } catch (error) {
      console.error("❌ Error:", error);
      alert("No se pudo cargar la plantilla o procesar los estilos.");
    }
  }

  async guardarConfiguracionColumnas() {
    const configRef = doc(this.firestore, 'configuracion_columnas', this.grupoActual.toUpperCase());
    await setDoc(configRef, { premiosDestreza: this.premiosDestreza, liderazgoColumnas: this.liderazgoColumnas, estudiosBiblicos: this.estudiosBiblicos }, { merge: true });
  }

  async agregarColumna(tipo: string) {
    const nombre = prompt(`Nombre:`);
    if (!nombre) return;
    const nuevaCol = { id: `${tipo}_${Date.now()}`, label: nombre.toUpperCase() };
    if (tipo === 'destreza') this.premiosDestreza.push(nuevaCol);
    if (tipo === 'liderazgo') this.liderazgoColumnas.push(nuevaCol);
    if (tipo === 'biblico') this.estudiosBiblicos.push(nuevaCol);
    await this.guardarConfiguracionColumnas();
  }

  async eliminarColumna(id: string, tipo: string, label: string) {
    if (!confirm(`¿Eliminar "${label}"?`)) return;
    if (tipo === 'destreza') this.premiosDestreza = this.premiosDestreza.filter(c => c.id !== id);
    if (tipo === 'liderazgo') this.liderazgoColumnas = this.liderazgoColumnas.filter(c => c.id !== id);
    if (tipo === 'biblico') this.estudiosBiblicos = this.estudiosBiblicos.filter(c => c.id !== id);
    await this.guardarConfiguracionColumnas();
  }
}