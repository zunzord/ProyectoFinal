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

  
  async init() {
    await this.storage.create();
    await this.cargarMetas();
  }

  async agregarMeta(meta: any, usuarioId: string) {
    const metaConIdYUsuario = { ...meta, id: Date.now().toString(), usuarioId: usuarioId };
    this.metas.push(metaConIdYUsuario);
    await this.guardarMetas();
  }

  async obtenerMetas(usuarioId: string): Promise<any[]> {
    const metasCifradas = await this.storage.get(`metas-${usuarioId}`);
    return metasCifradas ? JSON.parse(metasCifradas) : [];
  }

  
  async actualizarMeta(metaId: string, cambios: any, usuarioId: string) {
    let metas = await this.obtenerMetas(usuarioId);
    const index = metas.findIndex(meta => meta.id === metaId);
    if (index !== -1) {
      metas[index] = { ...metas[index], ...cambios };
      await this.storage.set(`metas-${usuarioId}`, JSON.stringify(metas));
    }
  }

  
  async eliminarMeta(metaId: string, usuarioId: string) {
    let metas = await this.obtenerMetas(usuarioId);
    metas = metas.filter(meta => meta.id !== metaId);
    await this.storage.set(`metas-${usuarioId}`, JSON.stringify(metas));
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




