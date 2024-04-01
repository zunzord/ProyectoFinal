import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  constructor(private storage: Storage) {
    this.storage.create();
  }

  private async obtenerUsuarioId(): Promise<string> {
   
    const usuarioIdCifrado = await this.storage.get('usuarioActual');
   
    const bytes = CryptoJS.AES.decrypt(usuarioIdCifrado, 'clave-secreta'); 
    const usuarioId = bytes.toString(CryptoJS.enc.Utf8);
    return usuarioId;
  }

  async agregarTarea(tarea: any) {
    const usuarioId = await this.obtenerUsuarioId();
    const tareas = await this.obtenerTareas() || [];
    tarea.id = Date.now().toString(); 
    tarea.usuarioId = usuarioId; 
    tareas.push(tarea);
    await this.storage.set('tareas-' + usuarioId, JSON.stringify(tareas)); 
  }

  async obtenerTareas(): Promise<any[]> {
    const usuarioId = await this.obtenerUsuarioId();
    const tareasCifradas = await this.storage.get('tareas-' + usuarioId);
    if (tareasCifradas) {
      
      return JSON.parse(tareasCifradas);
    }
    return [];
  }

  async actualizarTarea(tareaId: string, tareaActualizada: any): Promise<void> {
    const usuarioId = await this.obtenerUsuarioId();
    const tareas = await this.obtenerTareas();
    const tareaIndex = tareas.findIndex(t => t.id === tareaId && t.usuarioId === usuarioId);
    if (tareaIndex !== -1) {
      tareas[tareaIndex] = { ...tareas[tareaIndex], ...tareaActualizada };
      await this.storage.set('tareas-' + usuarioId, JSON.stringify(tareas));
    }
  }

  async eliminarTarea(tareaId: string) {
    const usuarioId = await this.obtenerUsuarioId();
    let tareas = await this.obtenerTareas();
    tareas = tareas.filter(t => t.id !== tareaId && t.usuarioId === usuarioId);
    await this.storage.set('tareas-' + usuarioId, JSON.stringify(tareas));
  }
}








