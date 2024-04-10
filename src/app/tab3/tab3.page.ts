import { Component, OnInit } from '@angular/core';
import { MetaFormComponent } from '../components/meta-form/meta-form.component';
import { MetasService } from '../services/metas.service';
import { Storage } from '@ionic/storage-angular';
import { ModalController, ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  metas: any[] = [];
  

  constructor(
    private modalCtrl: ModalController,
    private metasService: MetasService,
    private storage: Storage,
    private actionSheetCtrl: ActionSheetController
  ) {}

  async ngOnInit() {
    await this.cargarMetas();
  }

  async mostrarFormularioMeta(metaId?: string) {
    
    const metaParaEditar = metaId ? this.metas.find(meta => meta.id === metaId) : null;
    const modal = await this.modalCtrl.create({
      component: MetaFormComponent,
      componentProps: { meta: metaParaEditar }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.registered) {
      await this.cargarMetas();
    }
  }

  async presentActionSheet(metaId: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash',
          handler: async () => {
           
            const usuarioId = await this.obtenerUsuarioId(); 
            await this.metasService.eliminarMeta(metaId, usuarioId);
            await this.cargarMetas();
          }
        },
        {
          text: 'Modificar',
          icon: 'create',
          handler: () => {
            this.mostrarFormularioMeta(metaId);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        }
      ]
    });
    await actionSheet.present();
  }
 

  async cargarMetas() {
    const usuarioId = await this.obtenerUsuarioId();
    if (usuarioId) {
      this.metas = await this.metasService.obtenerMetas(usuarioId);
    } else {
      console.error('No se pudo obtener el usuarioId');
    }
  }

  private async obtenerUsuarioId(): Promise<string> {
    const usuarioId = await this.storage.get('usuarioActual');
    return usuarioId;
  }

  async actualizarMeta(metaId: string, cambios: any) {
    const usuarioId = await this.obtenerUsuarioId();
    await this.metasService.actualizarMeta(metaId, cambios, usuarioId);
    await this.cargarMetas();
  }
  
  async eliminarMeta(metaId: string) {
    const usuarioId = await this.obtenerUsuarioId();
    await this.metasService.eliminarMeta(metaId, usuarioId);
    await this.cargarMetas();
  }
}





