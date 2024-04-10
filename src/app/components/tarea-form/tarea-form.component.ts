import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { TareasService } from '../../services/tareas.service';
import { MetasService } from '../../services/metas.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tarea-form',
  templateUrl: './tarea-form.component.html',
  styleUrls: ['./tarea-form.component.scss'],
})
export class TareaFormComponent implements OnInit {
  tareaForm: FormGroup;
  metas: any[] = [];
  tareaActual: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private tareasService: TareasService,
    private metasService: MetasService,
    private navParams: NavParams,
    private storage: Storage
  ) {
    this.tareaForm = this.formBuilder.group({
      descripcion: [''],
      fechaVencimiento: [''],
      prioridad: ['media'],
      categoria: [''],
      recordatorio: [false],
      notas: [''],
      metaId: [null],
      completada: [Boolean]
    });

    if (this.navParams.get('tarea')) {
      this.tareaActual = this.navParams.get('tarea');
      this.tareaForm.patchValue(this.tareaActual);
    }
  }

  async ngOnInit() {
    await this.cargarMetas();
  }

  async cargarMetas() {
    const usuarioId = await this.storage.get('usuarioActual'); 
    this.metas = await this.metasService.obtenerMetas(usuarioId);
  }

  async guardarTarea() {
    if (this.tareaForm.valid) {
      const tarea = this.tareaForm.value;
      if (this.tareaActual) {
        await this.tareasService.actualizarTarea(this.tareaActual.id, tarea);
      } else {
        await this.tareasService.agregarTarea(tarea);
      }
      this.modalCtrl.dismiss({ 'dismissed': true, 'tarea': tarea });
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

}





/*import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { TareasService } from '../../services/tareas.service';
import { MetasService } from '../../services/metas.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tarea-form',
  templateUrl: './tarea-form.component.html',
  styleUrls: ['./tarea-form.component.scss'],
})
export class TareaFormComponent implements OnInit {
  tareaForm!: FormGroup;
  metas: any[] = [];
  tareaActual: any = null; // Almacena la tarea actual si estamos editando

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private tareasService: TareasService,
    private metasService: MetasService,
    private navParams: NavParams,
    private storage: Storage
  ) {
    this.tareaActual = this.navParams.get('tarea'); // Intenta obtener una tarea pasada como parámetro
  }

  async ngOnInit() {
    await this.cargarMetas();
    this.inicializarFormulario();
  }

  async cargarMetas() {
    const usuarioId = await this.storage.get('usuarioActual'); // Asume que 'usuarioActual' es la clave donde guardas el ID cifrado del usuario
    // Asegúrate de manejar la decodificación del ID de usuario si está cifrado
    this.metas = await this.metasService.obtenerMetas(usuarioId);
  }

  inicializarFormulario() {
    // Pre-popula el formulario si `tareaActual` está definido, de lo contrario, inicializa campos vacíos
    this.tareaForm = this.formBuilder.group({
      descripcion: [this.tareaActual?.descripcion || '' ],
      fechaVencimiento: [this.tareaActual?.fechaVencimiento || ''],
      prioridad: [this.tareaActual?.prioridad || 'media'],
      categoria: [this.tareaActual?.categoria || '', Validators.required],
      recordatorio: [this.tareaActual?.recordatorio || false],
      notas: [this.tareaActual?.notas || ''],
      metaId: [this.tareaActual?.metaId || null] // Asegúrate de que el campo metaId esté correctamente validado
    });
  }

  async guardarTarea() {
    if (this.tareaForm.valid) {
      const tarea = this.tareaForm.value;
      if (this.tareaActual) {
        // Actualiza una tarea existente
        await this.tareasService.actualizarTarea(this.tareaActual.id, tarea);
      } else {
        // Agrega una nueva tarea
        await this.tareasService.agregarTarea(tarea);
      }
      this.modalCtrl.dismiss({ 'dismissed': true, 'tarea': tarea });
    } else {
      console.log('Formulario inválido');
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}*/










/*import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TareasService } from '../../services/tareas.service';
import { MetasService } from '../../services/metas.service';


@Component({
  selector: 'app-tarea-form',
  templateUrl: './tarea-form.component.html',
  styleUrls: ['./tarea-form.component.scss'],
})
export class TareaFormComponent implements OnInit {
  tareaForm!: FormGroup;
  metas: any[] = []; // Almacena las metas disponibles para seleccionar
  tareaActual: any = null; // Para almacenar la tarea que estamos editando

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private tareasService: TareasService,
    private metasService: MetasService, // Inyecta el servicio de metas
    
  ) {
   
  }

  ngOnInit() {
    this.cargarMetas(); // Carga las metas disponibles al iniciar
    this.tareaForm = this.formBuilder.group({
      descripcion: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      prioridad: ['media', Validators.required],
      metaId: [null], // Añade un campo para seleccionar la meta asociada
      categoria: ['', Validators.required],
      recordatorio: [false],
      notas: ['']
    });
  }

  cargarMetas() {
    this.metas = this.metasService.obtenerMetas(); // Obtiene las metas desde el servicio
  }

  guardarTarea() {
    if (this.tareaForm.valid) {
      this.tareasService.agregarTarea(this.tareaForm.value);
      this.modalCtrl.dismiss({
        'dismissed': true
      });
    } else {
      console.log('Formulario inválido');
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
}*/