import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import { Storage } from '@ionic/storage-angular';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import Chart from 'chart.js/auto';
import { TareasService } from '../services/tareas.service';
import { MetasService } from '../services/metas.service';


declare var google: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, AfterViewInit {
  tareaForm!: FormGroup;
  @ViewChild('direccionInput') direccionInput!: ElementRef; 
  @ViewChild('map') mapElement!: ElementRef;
  @ViewChild('tareasChart') tareasChart!: ElementRef<HTMLCanvasElement>; 
  @ViewChild('metasChart') metasChart!: ElementRef<HTMLCanvasElement>;
  map: any;
  marker: any;
  longPressTimer: any;

 
  private tareasChartInstance: Chart | null = null;
private metasChartInstance: Chart | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private storage: Storage,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private tareasService: TareasService,
    private metasService: MetasService,
    private alertController: AlertController
    
    
  ) {}

  

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCtYOLsfQsqKdJAGO_7pgm821lyO_M9XRA&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        resolve();
      };
    });
  }

  ngOnInit() {
    
    this.inicializarFormulario();
    this.initAutocomplete();
    this.loadMaps();
    
    
   
  }

  

  ngAfterViewInit() { 
    /*setTimeout(() => {
      this.dibujarGraficos();
    }, 100);*/
    this.loadGoogleMapsScript().then(() => {
      this.initializeMap();
      
    });
    
  }

  ionViewDidEnter() {
   /* if (this.necesitaRedibujarGraficos) {
      this.dibujarGraficos();
     
      this.necesitaRedibujarGraficos = false;
    }*/
    this.dibujarGraficos();
  }

  initializeOrResetMap() {
    if (!this.map) {
      // Si el mapa no existe, lo inicializa
      this.loadGoogleMapsScript().then(() => {
        const latLng = new google.maps.LatLng(-34.397, 150.644);
        const mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
  
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.map.addListener('dblclick', async (e: google.maps.MapMouseEvent) => {
          const confirmacion = await this.confirmarGuardarUbicacion(latLng);
          if (confirmacion) {
            this.guardarUbicacionSeleccionada(e.latLng, "casa"); 
          }
        });
      });
    } else {
      
      this.mapElement.nativeElement.style.display = 'block';
      google.maps.event.trigger(this.map, 'resize');
      this.map.setCenter(new google.maps.LatLng(-34.397, 150.644)); 
    }
  }

  initializeMap() {
    const latLng = new google.maps.LatLng(-34.397, 150.644);
    const mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.map.addListener('dblclick', (e: google.maps.MapMouseEvent) => this.confirmarGuardarUbicacion(latLng));
  }

  async loadMaps() {
    await this.loadGoogleMapsScript();
    const defaultCenter = { lat: -34.397, lng: 150.644 }; 
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 8,
      center: { lat: -34.397, lng: 150.644 },
    });
  
    
    this.marker = new google.maps.Marker({
      position: defaultCenter,
      map: this.map,
      title: 'Ubicación Seleccionada',
    });
    this.marker.setVisible(false);
  
   
    this.map.addListener('mousedown', (e: google.maps.MapMouseEvent) => {
      this.longPressTimer = setTimeout(() => {
        this.marker.setPosition(e.latLng);
        this.marker.setVisible(true);
         
      }, 3000); 
    });
    
    this.map.addListener('mouseup', () => {
      clearTimeout(this.longPressTimer);
    });
  }

  inicializarFormulario() {
    this.tareaForm = this.formBuilder.group({
      descripcion: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      prioridad: ['media', Validators.required],
      categoria: this.formBuilder.array([]),
      recordatorio: [false],
      notas: ['']
    });
  }

  initAutocomplete(): void {
    
    setTimeout(() => {
      const inputElement = this.direccionInput.nativeElement.querySelector('input');
      const autocomplete = new google.maps.places.Autocomplete(inputElement);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log(place.geometry.location.lat(), place.geometry.location.lng());
       
      });
    }, 1000);
  }

  async elegirMetodoRegistro(tipoUbicacion: 'casa' | 'trabajo') {
    const actionSheet = await this.actionSheetCtrl.create({
        header: 'Método de Registro',
        buttons: [
            {
                text: 'Manual',
                handler: () => {
                   
                    this.mostrarMapaParaSeleccion(tipoUbicacion);
                }
            },
            {
                text: 'Automático',
                handler: () => {
                    
                    this.registrarUbicacion(tipoUbicacion);
                }
            },
            {
                text: 'Cancelar',
                role: 'cancel'
            }
        ]
    });
    await actionSheet.present();
}

  

  async mostrarMapaParaSeleccion(tipoUbicacion: 'casa' | 'trabajo') {
    
    this.initializeOrResetMap();
    this.mapElement.nativeElement.style.display = 'block';

    
    if (!this.map) {
        await this.loadGoogleMapsScript();
    }
    
    
    this.initializeMap();

   
    google.maps.event.trigger(this.map, 'resize');
    this.map.setCenter({ lat: -34.397, lng: 150.644 }); 

    
    google.maps.event.clearListeners(this.map, 'dblclick');
    this.map.addListener('dblclick', async (e: any) => {
        const confirmacion = await this.confirmarGuardarUbicacion(e.latLng);
        if (confirmacion) {
            this.guardarUbicacionSeleccionada(e.latLng, tipoUbicacion);
        } else {
           
            this.mapElement.nativeElement.style.display = 'block';
        }
    });
}

  async confirmarGuardarUbicacion(latLng: { lat: number, lng: number }): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
        const alert = await this.alertController.create({
            header: 'Confirmar',
            message: '¿Deseas guardar esta ubicación?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        this.mapElement.nativeElement.style.display = 'none'; 
                        resolve(false);
                    },
                },
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.mapElement.nativeElement.style.display = 'none'; 
                        resolve(true);
                    },
                },
            ],
        });

        await alert.present();
    });
}
  
async guardarUbicacionSeleccionada(latLng: google.maps.LatLng, tipoUbicacion: 'casa' | 'trabajo') {
  // 
  const coordenadas = { lat: latLng.lat(), lng: latLng.lng() };
  const usuarioId = await this.obtenerUsuarioId();
  await this.storage.set(`${tipoUbicacion}-${usuarioId}`, JSON.stringify(coordenadas));
  console.log(`Ubicación de ${tipoUbicacion} guardada:`, coordenadas);
}

  

  async guardarUbicacion(e: google.maps.MapMouseEvent, tipoUbicacion: 'casa' | 'trabajo') {
    if (!e.latLng) return;
    const usuarioId = await this.obtenerUsuarioId();
    const coordenadas = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    await this.storage.set(`${tipoUbicacion}-${usuarioId}`, JSON.stringify(coordenadas));
    console.log(`Ubicación de ${tipoUbicacion} guardada:`, coordenadas);
  }

  

  guardarTarea() {
    if (this.tareaForm.valid) {
      console.log('Tarea guardada', this.tareaForm.value);
      this.tareaForm.reset({
        prioridad: 'media',
        recordatorio: false 
      });
    } else {
      console.log('Formulario inválido');
    }
  }
  async obtenerUbicacionRegistrada(tipoUbicacion: 'casa' | 'trabajo') {
    const usuarioId = await this.obtenerUsuarioId();
    const ubicacion = await this.storage.get(`ubicacion_${tipoUbicacion}_${usuarioId}`);
    return JSON.parse(ubicacion);
  }

  async listarTareasBasadasEnUbicacion() {
    const usuarioId = await this.obtenerUsuarioId();
    const casa = JSON.parse(await this.storage.get(`casa-${usuarioId}`));
    const trabajo = JSON.parse(await this.storage.get(`trabajo-${usuarioId}`));
    
  }

  async registrarUbicacion(tipoUbicacion: 'casa' | 'trabajo') {
    const permiso = await Geolocation.requestPermissions();
    if (permiso.location === 'granted') {
      const ubicacion = await Geolocation.getCurrentPosition();
      const coordenadas = { lat: ubicacion.coords.latitude, lng: ubicacion.coords.longitude };
      const usuarioId = await this.obtenerUsuarioId();
      await this.storage.set(`${tipoUbicacion}-${usuarioId}`, JSON.stringify(coordenadas));
    }
  }

  async obtenerUsuarioId(): Promise<string> {
    const usuarioId = await this.storage.get('usuarioActual');
    return usuarioId ? usuarioId : '';
  }

  async presentarOpcionesUbicacion() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Registrar Ubicación',
      buttons: [
        {
          text: 'Personal',
          handler: () => {
            this.registrarUbicacion('casa');
          }
        },
        {
          text: 'Trabajo',
          handler: () => {
            this.registrarUbicacion('trabajo');
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  mostrarMapa = false; 

  async mostrarMapaParaSeleccion2(tipoUbicacion: 'casa' | 'trabajo') {
    this.initializeOrResetMap();
    this.mapElement.nativeElement.style.display = 'block';
    google.maps.event.clearListeners(this.map, 'dblclick');
    this.map.addListener('dblclick', async (e: any) => {
        const confirmacion = await this.confirmarGuardarUbicacion(e.latLng);
        if (confirmacion) {
            this.guardarUbicacionSeleccionada(e.latLng, tipoUbicacion);
        }
    });
}
async elegirUbicacionYMostrarMapa() {
  const alert = await this.alertController.create({
    header: 'Seleccionar Ubicación',
    message: '¿Dónde deseas registrar la ubicación?',
    buttons: [
      {
        text: 'Casa',
        handler: () => {
          this.mostrarMapaParaSeleccion('casa');
        }
      },
      {
        text: 'Trabajo',
        handler: () => {
          this.mostrarMapaParaSeleccion('trabajo');
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ]
  });

  await alert.present();
}


async dibujarGraficos() {
  console.log("Dibujando gráficos...");
  
  
  const { completadas: tareasCompletadas, noCompletadas: tareasNoCompletadas } = await this.obtenerDatosTareas();
  const { completadas: metasCompletadas, noCompletadas: metasNoCompletadas } = await this.obtenerDatosMetas();

  const tareasChart = new Chart(this.tareasChart.nativeElement, {
    
    type: 'doughnut',
    data: {
      labels: ['Completadas', 'No Completadas'],
      datasets: [{
        data: [tareasCompletadas, tareasNoCompletadas],
        backgroundColor: ['#264c73', '#f79220'],
      }]
    }
    
  });

  const metasChart = new Chart(this.metasChart.nativeElement, {
    type: 'doughnut',
    data: {
      labels: ['Completadas', 'No Completadas'],
      datasets: [{
        data: [metasCompletadas, metasNoCompletadas],
        backgroundColor: ['#264c73', '#04aef3'],
      }]
    }
  });
  
}




async obtenerDatosTareas() {
  const tareasCompletadas = await this.tareasService.obtenerTareasCompletadas()
  const tareasNoCompletadas = await this.tareasService.obtenerTareasNoCompletadas();
  return { completadas: tareasCompletadas.length, noCompletadas: tareasNoCompletadas.length };
}

async obtenerDatosMetas() {
  
  
  const metasCompletadas = await this.metasService.obtenerMetasCompletadas();
  const metasNoCompletadas = await this.metasService.obtenerMetasNoCompletadas();
  return { completadas: metasCompletadas.length, noCompletadas: metasNoCompletadas.length };
}







}








  


  

