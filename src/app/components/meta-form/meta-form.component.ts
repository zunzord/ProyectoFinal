import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { MetasService } from '../../services/metas.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-meta-form',
  templateUrl: './meta-form.component.html',
  styleUrls: ['./meta-form.component.scss'],
})
export class MetaFormComponent implements OnInit {
  formaMeta: FormGroup;
  metaOriginal: any = null; // Usaremos esto para almacenar los datos de la meta si estamos editando

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private metasService: MetasService,
    private storage: Storage,
    private navParams: NavParams // Añadido para recibir datos del modal
  ) {
    this.formaMeta = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tiempoVigencia: ['', Validators.required],
      frecuenciaSemanal: ['', [Validators.required, Validators.min(1)]],
      recordatorio: [false],
    });
  }

  ngOnInit() {
    // Verificamos si estamos editando una meta existente
    this.metaOriginal = this.navParams.get('meta');
    if (this.metaOriginal) {
      // Si hay una meta, prellenamos el formulario con sus datos
      this.formaMeta.patchValue(this.metaOriginal);
    }
  }

  async registrarMeta() {
    const usuarioId = await this.obtenerUsuarioId();
    if (this.formaMeta.valid && usuarioId) {
      const meta = { ...this.formaMeta.value, usuarioId };
      if (this.metaOriginal && this.metaOriginal.id) {
        // Si es una edición, actualizar la meta existente
        await this.metasService.actualizarMeta(this.metaOriginal.id, meta, usuarioId);
      } else {
        // Si es una nueva meta, agregarla
        await this.metasService.agregarMeta(meta, usuarioId);
      }
      await this.mostrarAlertaExito();
      this.modalCtrl.dismiss({ registered: true });
    } else {
      console.error('El formulario de meta no es válido o falta usuarioId');
    }
  }

  private async obtenerUsuarioId(): Promise<string> {
    const usuarioId = await this.storage.get('usuarioActual');
    return usuarioId;
  }

  private async mostrarAlertaExito() {
    const alert = await this.alertController.create({
      header: 'Meta Guardada',
      message: 'La meta ha sido guardada correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}




/*import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { MetasService } from '../../services/metas.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-meta-form',
  templateUrl: './meta-form.component.html',
  styleUrls: ['./meta-form.component.scss'],
})
export class MetaFormComponent implements OnInit {
  formaMeta: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private metasService: MetasService,
    
    private storage: Storage
  ) {
    this.formaMeta = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tiempoVigencia: ['', Validators.required],
      frecuenciaSemanal: ['', [Validators.required, Validators.min(1)]],
      recordatorio: [false],
    });
  }

  ngOnInit() {}

  async registrarMeta() {
    const usuarioId = await this.obtenerUsuarioId();
    if (this.formaMeta.valid && usuarioId) {
      const meta = { ...this.formaMeta.value, usuarioId };
      await this.metasService.agregarMeta(meta, usuarioId);
      await this.mostrarAlertaExito();
      this.modalCtrl.dismiss({ registered: true });
    } else {
      // Manejar el caso de formulario inválido o falta de usuarioId
      console.error('El formulario de meta no es válido o falta usuarioId');
    }
  }

  private async obtenerUsuarioId(): Promise<string> {
    const usuarioId = await this.storage.get('usuarioActual');
    return usuarioId;
  }

  private async mostrarAlertaExito() {
    const alert = await this.alertController.create({
      header: 'Meta Guardada',
      message: 'La meta ha sido guardada correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}*/






/*import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { MetasService } from '../../services/metas.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-meta-form',
  templateUrl: './meta-form.component.html',
  styleUrls: ['./meta-form.component.scss'],
})
export class MetaFormComponent implements OnInit {
  formaMeta: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private metasService: MetasService,
    private storage: Storage
  ) {
    this.formaMeta = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tiempoVigencia: ['', Validators.required],
      frecuenciaSemanal: ['', [Validators.required, Validators.min(1)]],
      recordatorio: [false],
    });
  }
  async obtenerUsuarioId(): Promise<string> {
    const usuarioId = await this.storage.get('usuarioActual');
    return usuarioId; // Asegúrate de que este valor se maneja adecuadamente en el resto de tu lógica.
  }

  async registrarMeta() {
    if (this.formaMeta.valid) {
      // Obtiene el usuarioId de Storage.
      const usuarioId = await this.storage.get('usuarioActual');
  
      if (usuarioId) {
        const metaConUsuarioId = { ...this.formaMeta.value, usuarioId };
  
        // Asegúrate de pasar usuarioId como segundo argumento en agregarMeta.
        await this.metasService.agregarMeta(metaConUsuarioId, usuarioId);
  
        // Resto de tu lógica para manejar el éxito...
      } else {
        console.error('No se pudo obtener el usuarioId');
      }
    } else {
      console.error('El formulario de meta no es válido');
    }
  }

  ngOnInit() {}
}*/






/*import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { MetasService } from '../../services/metas.service';




@Component({
  selector: 'app-meta-form',
  templateUrl: './meta-form.component.html',
  styleUrls: ['./meta-form.component.scss'],
})
export class MetaFormComponent  implements OnInit {
  mostrarFormularioMeta: boolean = false;
  @Output() metaRegistrada = new EventEmitter<any>();
  formaMeta: FormGroup;
  constructor(private formBuilder: FormBuilder, private router: Router, private alertController: AlertController, private metasService: MetasService,) { 
    this.formaMeta = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tiempoVigencia: ['', Validators.required],
      frecuenciaSemanal: ['', [Validators.required, Validators.min(1)]],
      recordatorio: [false]
    });
    
  }
  async registrarMeta() {
    if (this.formaMeta.valid) {
      // Emitir evento o realizar la lógica de guardado aquí
     // this.metaRegistrada.emit(this.formaMeta.value);
     this.metasService.agregarMeta(this.formaMeta.value);
      const alert = await this.alertController.create({
        header: 'Meta Guardada',
        message: 'La meta ha sido guardada correctamente.',
        buttons: [{
          text: 'OK',
          handler: () => {
            this.router.navigateByUrl('/tabs/tab3'); // Navega a tab3 cuando el usuario toca 'OK'
          }
        }]
      });
      await alert.present();
      // Resetear el formulario
      this.formaMeta.reset();

      // Opcionalmente, mostrar algún mensaje de confirmación al usuario aquí

      // Navegar de vuelta a tab3
      //this.router.navigateByUrl('/tabs/tab3');
    } else {
      console.error('El formulario de meta no es válido');
    }
  }


  ngOnInit() {}

}*/
