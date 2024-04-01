import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TareaFormComponent } from '../components/tarea-form/tarea-form.component'; 
import { TareasService } from '../services/tareas.service'; 
import { MetasService } from '../services/metas.service';
import { ActionSheetController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Storage } from '@ionic/storage-angular';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  tareas: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private tareasService: TareasService,
    private actionSheetCtrl: ActionSheetController,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.cargarTareas();
  }

  async cargarYOrdenarTareas() {
    
    this.tareas = await this.cargarTareas(); 

    
    this.tareas = await this.ordenarTareasPorProximidad(); 
}

  async obtenerUbicacionActual() {
    try {
      const ubicacionActual = await Geolocation.getCurrentPosition();
      return ubicacionActual; 
    } catch (e) {
      console.error('Error al obtener la ubicación', e);
      throw e;
    }
  }

  calcularDistancia(lat1:number, lon1:number, lat2:number, lon2:number) {
    const rad = function(x:number) {return x * Math.PI / 180;}
    var R = 6378.137; 
    var dLat = rad( lat2 - lat1 );
    var dLong = rad( lon2 - lon1 );
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
  }

  async ordenarTareasPorProximidad() {
    const ubicacionActual = await this.obtenerUbicacionActual();
    const ubicacionCasa = await this.storage.get('casa'); 
    const ubicacionTrabajo = await this.storage.get('trabajo'); 
  
    const distanciaCasa = this.calcularDistancia(ubicacionActual.coords.latitude, ubicacionActual.coords.longitude, ubicacionCasa.lat, ubicacionCasa.lng);
    const distanciaTrabajo = this.calcularDistancia(ubicacionActual.coords.latitude, ubicacionActual.coords.longitude, ubicacionTrabajo.lat, ubicacionTrabajo.lng);
  
    const masCercano = distanciaCasa < distanciaTrabajo ? 'casa' : 'trabajo';
  
    
    let tareasOrdenadas = [];
    if (masCercano === 'casa') {
      
      tareasOrdenadas = this.tareas.sort((a, b) => a.tipoUbicacion === 'casa' ? -1 : 1);
    } else {
      
      tareasOrdenadas = this.tareas.sort((a, b) => a.tipoUbicacion === 'trabajo' ? -1 : 1);
    }
  
    return tareasOrdenadas;
  }

  async abrirFormularioTarea(tareaId?: string) {
    let tareaParaEditar = null;
    if (tareaId) {
      
      tareaParaEditar = this.tareas.find(tarea => tarea.id === tareaId);
    }
    const modal = await this.modalCtrl.create({
      component: TareaFormComponent,
      componentProps: { tarea: tareaParaEditar }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      await this.cargarTareas();
    }
  }

  async cargarTareas(): Promise<any[]> {
    
    this.tareas = await this.tareasService.obtenerTareas();
    return [];
  }

  async presentActionSheet(tareaId: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [{
        text: 'Borrar',
        role: 'destructive',
        icon: 'trash',
        handler: async () => {
          await this.tareasService.eliminarTarea(tareaId);
          await this.cargarTareas(); 
        }
      }, {
        text: 'Modificar',
        icon: 'create',
        handler: () => {
          this.abrirFormularioTarea(tareaId);
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  async modificarTarea(tareaId: string) {
    await this.abrirFormularioTarea(tareaId); 
  }

  private async obtenerUsuarioId(): Promise<string> {
    const usuarioId = await this.storage.get('usuarioActual');
    return usuarioId;
  }

  esTareaVencida(fechaVencimiento: string): boolean {
    const hoy = new Date();
    const fechaVence = new Date(fechaVencimiento);
    return fechaVence < hoy;
  }

  async actualizarEstadoTarea(tareaId: string, completada: boolean): Promise<void> {
    const tareas = await this.tareasService.obtenerTareas();
    const index = tareas.findIndex(t => t.id === tareaId);
    if (index !== -1) {
      tareas[index].completada = completada;
      // Aquí deberías actualizar el almacenamiento de tareas con la lista actualizada.
      await this.storage.set('tareas', JSON.stringify(tareas));
    }
  }

  async marcarTareaComoCompletada(tareaId: string) {
    // Suponiendo que necesitas obtener primero la tarea completa para luego actualizarla
    const tareas = await this.tareasService.obtenerTareas();
    const tarea = tareas.find(t => t.id === tareaId);
    if (tarea) {
      const datosActualizados = { ...tarea, completada: true }; // Asumiendo que 'completada' es el campo a actualizar
      await this.tareasService.actualizarTarea(tareaId, datosActualizados);
      console.log(`Tarea ${tareaId} marcada como completada`);
      await this.cargarTareas();
    }
  }
}



