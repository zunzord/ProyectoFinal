import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class MetasService {
  private metas: any[] = [];

  constructor(private storage: Storage) {
    this.init();
  }

  // Inicializar el almacenamiento
  async init() {
    await this.storage.create();
    await this.cargarMetas();
  }

  async agregarMeta(meta: any, usuarioId: string) {
    const metaConIdYUsuario = { ...meta, id: Date.now().toString(), usuarioId: usuarioId };
    this.metas.push(metaConIdYUsuario);
    await this.guardarMetas();
  }

  async obtenerMetas(usuarioId: string) {
    return this.metas.filter(meta => meta.usuarioId === usuarioId);
  }

  async actualizarMeta(metaId: string, cambios: any, usuarioId: string) {
    const index = this.metas.findIndex(meta => meta.id === metaId && meta.usuarioId === usuarioId);
    if (index !== -1) {
      this.metas[index] = { ...this.metas[index], ...cambios };
      await this.guardarMetas();
    }
  }

  async eliminarMeta(metaId: string, usuarioId: string) {
    this.metas = this.metas.filter(meta => meta.id !== metaId && meta.usuarioId === usuarioId);
    await this.guardarMetas();
  }

  private async cargarMetas() {
    const metasGuardadas = await this.storage.get('metas');
    if (metasGuardadas) {
      this.metas = JSON.parse(metasGuardadas);
    }
  }

  private async guardarMetas() {
    await this.storage.set('metas', JSON.stringify(this.metas));
  }
}




/*import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetasService {
  private metas: any[] = [];

  constructor() { }

  async agregarMeta(meta: any, usuarioId: string) {
    const metaConIdYUsuario = { ...meta, id: Date.now().toString(), usuarioId: usuarioId };
    this.metas.push(metaConIdYUsuario);
    await this.guardarMetas(); // Si estás utilizando persistencia
  }

  async obtenerMetas(usuarioId: string) {
    await this.cargarMetas(); // Si estás utilizando persistencia
    return this.metas.filter(meta => meta.usuarioId === usuarioId);
  }

  async actualizarMeta(metaId: string, cambios: any) {
    const index = this.metas.findIndex(meta => meta.id === metaId);
    if (index !== -1) {
      this.metas[index] = { ...this.metas[index], ...cambios };
      await this.guardarMetas(); // Si estás utilizando persistencia
    }
  }

  async eliminarMeta(metaId: string) {
    this.metas = this.metas.filter(meta => meta.id !== metaId);
    await this.guardarMetas(); // Si estás utilizando persistencia
  }

  // Métodos de ayuda para cargar y guardar metas (si estás utilizando persistencia)
  private async cargarMetas() {
    // Implementar lógica de carga
  }

  private async guardarMetas() {
    // Implementar lógica de guardado
  }
}*/






/*import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class MetasService {
  private metas: any[] = [];
  constructor() { }
  agregarMeta(meta: any) {
    this.metas.push(meta);
  }

  obtenerMetas() {
    return this.metas;
  }
}*/
